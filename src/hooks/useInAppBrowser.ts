import { useState, useCallback } from 'react';

interface BrowserState {
  isOpen: boolean;
  url: string;
  title?: string;
}

export const useInAppBrowser = () => {
  const [browserState, setBrowserState] = useState<BrowserState>({
    isOpen: false,
    url: '',
    title: undefined
  });

  const openBrowser = useCallback((url: string, title?: string) => {
    setBrowserState({
      isOpen: true,
      url,
      title
    });
  }, []);

  const closeBrowser = useCallback(() => {
    setBrowserState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const shouldOpenInApp = useCallback((url: string): boolean => {
    try {
      const urlObj = new URL(url, window.location.origin);
      
      // Always open external links in-app
      if (urlObj.origin !== window.location.origin) {
        // Exceptions: these should open externally
        const exceptions = [
          // App store links
          'apps.apple.com',
          'play.google.com',
          'itunes.apple.com',
          // Protocol-specific links
          'tel:',
          'mailto:',
          'sms:',
        ];

        // Check for protocol exceptions
        if (url.startsWith('tel:') || url.startsWith('mailto:') || url.startsWith('sms:')) {
          return false;
        }

        // Check for domain exceptions
        const shouldOpenExternally = exceptions.some(exception => 
          urlObj.hostname.includes(exception)
        );

        return !shouldOpenExternally;
      }

      return false; // Internal links should navigate normally
    } catch {
      return false; // Invalid URLs should not open in-app
    }
  }, []);

  const handleLinkClick = useCallback((event: Event, url: string, title?: string) => {
    if (shouldOpenInApp(url)) {
      event.preventDefault();
      openBrowser(url, title);
      return true; // Indicates the link was handled
    }
    return false; // Let the browser handle it normally
  }, [shouldOpenInApp, openBrowser]);

  const processExternalLinks = useCallback((element: HTMLElement) => {
    const links = element.querySelectorAll('a[href]');
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Remove existing listeners to avoid duplicates
      const newLink = link.cloneNode(true) as HTMLAnchorElement;
      link.parentNode?.replaceChild(newLink, link);

      if (shouldOpenInApp(href)) {
        newLink.addEventListener('click', (e) => {
          e.preventDefault();
          const title = newLink.textContent || newLink.getAttribute('title') || undefined;
          openBrowser(href, title);
        });

        // Add visual indicator for external links
        newLink.style.textDecoration = 'underline';
        newLink.style.textDecorationStyle = 'dotted';
        newLink.setAttribute('title', 'Opent in AZ Fanpage browser');
      }
    });
  }, [shouldOpenInApp, openBrowser]);

  return {
    browserState,
    openBrowser,
    closeBrowser,
    shouldOpenInApp,
    handleLinkClick,
    processExternalLinks
  };
};