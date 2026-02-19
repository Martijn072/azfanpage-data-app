import { useCallback, RefObject } from 'react';
import { toPng } from 'html-to-image';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

async function toDataUrlViaProxy(src: string): Promise<string | null> {
  try {
    console.log('[visual-export] Proxying image:', src);
    const { data, error } = await supabase.functions.invoke('image-proxy', {
      body: { url: src },
    });
    if (error) {
      console.error('[visual-export] Proxy error:', error);
      return null;
    }
    if (!data?.dataUrl) {
      console.error('[visual-export] No dataUrl in response:', data);
      return null;
    }
    console.log('[visual-export] Proxy success for:', src);
    return data.dataUrl;
  } catch (e) {
    console.error('[visual-export] Proxy exception:', e);
    return null;
  }
}

async function blobToDataUrl(blobUrl: string): Promise<string | null> {
  try {
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function inlineExternalImages(container: HTMLDivElement) {
  const images = container.querySelectorAll('img');
  const originals: { img: HTMLImageElement; src: string }[] = [];

  console.log('[visual-export] Found', images.length, 'images to process');

  await Promise.all(
    Array.from(images).map(async (img) => {
      const src = img.getAttribute('src') || img.src;
      if (!src || src.startsWith('data:')) return;

      // Handle blob URLs - convert to data URL to avoid cacheBust issues
      if (src.startsWith('blob:')) {
        console.log('[visual-export] Converting blob URL:', src);
        originals.push({ img, src });
        const dataUrl = await blobToDataUrl(src);
        if (dataUrl) img.src = dataUrl;
        return;
      }

      // Check if it's a local/relative image
      try {
        const imgUrl = new URL(src, window.location.origin);
        if (imgUrl.origin === window.location.origin) {
          console.log('[visual-export] Skipping local image:', src);
          return;
        }
      } catch {
        return;
      }

      originals.push({ img, src });
      console.log('[visual-export] Proxying image:', src);
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
      console.log('[visual-export] Starting export...');
      restore = await inlineExternalImages(ref.current);
      console.log('[visual-export] Images inlined, generating PNG...');

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

      console.log('[visual-export] PNG generated, downloading...');
      const link = document.createElement('a');
      link.download = filename || `az-visual-${format(new Date(), 'yyyyMMdd')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('[visual-export] Failed to generate image:', err);
    } finally {
      restore?.();
    }
  }, []);

  return { downloadPng };
};
