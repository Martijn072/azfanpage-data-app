import { useCallback, RefObject } from 'react';
import { toPng } from 'html-to-image';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

async function toDataUrlViaProxy(src: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('image-proxy', {
      body: { url: src },
    });
    if (error || !data?.dataUrl) return null;
    return data.dataUrl;
  } catch {
    return null;
  }
}

async function inlineExternalImages(container: HTMLDivElement) {
  const images = container.querySelectorAll('img');
  const originals: { img: HTMLImageElement; src: string }[] = [];

  await Promise.all(
    Array.from(images).map(async (img) => {
      const src = img.src;
      if (!src || src.startsWith('data:') || src.startsWith(window.location.origin)) return;

      originals.push({ img, src });

      const dataUrl = await toDataUrlViaProxy(src);
      if (dataUrl) {
        img.src = dataUrl;
      }
    })
  );

  return () => {
    originals.forEach(({ img, src }) => {
      img.src = src;
    });
  };
}

export const useVisualDownload = () => {
  const downloadPng = useCallback(async (ref: RefObject<HTMLDivElement>, filename?: string) => {
    if (!ref.current) return;

    let restore: (() => void) | undefined;

    try {
      restore = await inlineExternalImages(ref.current);

      const dataUrl = await toPng(ref.current, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
        },
        width: ref.current.scrollWidth,
        height: ref.current.scrollHeight,
        filter: (node: HTMLElement) => {
          if (node.tagName === 'LINK' && (node as HTMLLinkElement).href?.includes('fonts.googleapis.com')) {
            return false;
          }
          return true;
        },
      });

      const link = document.createElement('a');
      link.download = filename || `az-visual-${format(new Date(), 'yyyyMMdd')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      restore?.();
    }
  }, []);

  return { downloadPng };
};
