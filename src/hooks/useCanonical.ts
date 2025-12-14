import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MAIN_SITE_URL = 'https://azfanpage.nl';

/**
 * Hook that automatically sets the canonical URL pointing to azfanpage.nl
 * This ensures all SEO authority goes to the main site, not the PWA.
 */
export const useCanonical = () => {
  const location = useLocation();

  useEffect(() => {
    // Remove any existing canonical link
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Build the canonical URL based on current route
    let canonicalPath = location.pathname;
    
    // Map PWA routes to main site equivalents
    const routeMapping: Record<string, string> = {
      '/': '/',
      '/nieuws': '/nieuws/',
      '/wedstrijden': '/wedstrijden/',
      '/standen': '/standen/',
      '/selectie': '/selectie/',
      '/forum': '/forum/',
      '/over': '/over/',
    };

    // Check if it's a mapped static route
    if (routeMapping[canonicalPath]) {
      canonicalPath = routeMapping[canonicalPath];
    }
    // Article pages: /artikel/{slug} → /{slug}
    else if (canonicalPath.startsWith('/artikel/')) {
      const slug = canonicalPath.replace('/artikel/', '');
      canonicalPath = `/${slug}`;
    }
    // For other dynamic routes, use the path as-is
    else {
      canonicalPath = canonicalPath.endsWith('/') ? canonicalPath : `${canonicalPath}/`;
    }

    const canonicalUrl = `${MAIN_SITE_URL}${canonicalPath}`;

    // Create and insert new canonical link
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonicalUrl;
    document.head.appendChild(link);

    // Cleanup on unmount or route change
    return () => {
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.remove();
      }
    };
  }, [location.pathname]);
};
