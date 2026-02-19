import { useCallback, RefObject } from 'react';
import { toPng } from 'html-to-image';
import { format } from 'date-fns';

// Convert cross-origin images to inline data URLs to avoid CORS errors during export
async function inlineExternalImages(container: HTMLDivElement) {
  const images = container.querySelectorAll('img');
  const originals: { img: HTMLImageElement; src: string }[] = [];

  await Promise.all(
    Array.from(images).map(async (img) => {
      const src = img.src;
      // Skip local / already-inlined images
      if (!src || src.startsWith('data:') || src.startsWith(window.location.origin)) return;

      originals.push({ img, src });

      try {
        const response = await fetch(src);
        const blob = await response.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        img.src = dataUrl;
      } catch {
        // If direct fetch fails (CORS), use a canvas proxy
        try {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const tempImg = new Image();
            tempImg.crossOrigin = 'anonymous';
            tempImg.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = tempImg.naturalWidth;
              canvas.height = tempImg.naturalHeight;
              canvas.getContext('2d')!.drawImage(tempImg, 0, 0);
              resolve(canvas.toDataURL('image/png'));
            };
            tempImg.onerror = reject;
            tempImg.src = src + (src.includes('?') ? '&' : '?') + '_cors=' + Date.now();
          });
          img.src = dataUrl;
        } catch {
          // Leave original src; html-to-image will skip it
        }
      }
    })
  );

  // Return a restore function
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
      // Pre-convert external images to data URLs
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
      // Restore original image sources
      restore?.();
    }
  }, []);

  return { downloadPng };
};
