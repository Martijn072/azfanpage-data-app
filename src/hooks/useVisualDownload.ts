import { useCallback, RefObject } from 'react';
import { toPng } from 'html-to-image';
import { format } from 'date-fns';

export const useVisualDownload = () => {
  const downloadPng = useCallback(async (ref: RefObject<HTMLDivElement>, filename?: string) => {
    if (!ref.current) return;

    try {
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
          // Skip external stylesheets that cause CORS errors
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
    }
  }, []);

  return { downloadPng };
};
