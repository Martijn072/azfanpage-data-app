import { useEffect, useRef, useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { MessageCircle, AlertCircle } from 'lucide-react';

interface CommentoCommentsProps {
  articleId: string;
  title: string;
  url?: string;
}

export const CommentoComments = ({ articleId, title, url }: CommentoCommentsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useDarkMode();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean up any existing Commento instance
  const cleanupCommento = () => {
    const existingScript = document.querySelector('script[src*="commento"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const commentoContainer = document.getElementById('commento');
    if (commentoContainer) {
      commentoContainer.innerHTML = '';
    }
  };

  const loadCommento = () => {
    if (isLoaded || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      cleanupCommento();
      
      // Create commento container
      const commentoDiv = document.createElement('div');
      commentoDiv.id = 'commento';
      
      if (containerRef.current) {
        containerRef.current.appendChild(commentoDiv);
      }

      // Configure Commento
      window.commentoUrl = url || `https://www.azfanpage.nl/article/${articleId}/`;
      window.commentoPageId = articleId;
      
      // Create and append script
      const script = document.createElement('script');
      script.src = 'https://cdn.commento.io/js/commento.js';
      script.defer = true;
      script.setAttribute('data-css-override', isDarkMode ? 'dark' : 'light');
      
      script.onload = () => {
        setIsLoaded(true);
        setIsLoading(false);
      };
      
      script.onerror = () => {
        setError('Kon de reacties niet laden. Probeer het later opnieuw.');
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
      
    } catch (err) {
      setError('Er ging iets mis bij het laden van de reacties.');
      setIsLoading(false);
    }
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded && !isLoading) {
            loadCommento();
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '100px 0px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isLoaded, isLoading]);

  // Handle dark mode changes
  useEffect(() => {
    if (isLoaded) {
      // Reload Commento with new theme
      setIsLoaded(false);
      cleanupCommento();
      setTimeout(loadCommento, 100);
    }
  }, [isDarkMode]);

  return (
    <div 
      ref={containerRef} 
      className="mt-8 pt-6 border-t border-premium-gray-200 dark:border-gray-700"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
          <h3 className="text-lg font-semibold text-premium-gray-900 dark:text-white">
            Reacties
          </h3>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                loadCommento();
              }}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Opnieuw proberen
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
            <span className="ml-2 text-sm text-premium-gray-600 dark:text-gray-300">
              Reacties laden...
            </span>
          </div>
        )}

        {!isLoaded && !isLoading && !error && (
          <button
            onClick={loadCommento}
            className="w-full py-3 px-4 bg-premium-gray-100 dark:bg-gray-800 hover:bg-premium-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span className="text-premium-gray-700 dark:text-gray-300">
              Klik hier om reacties te laden
            </span>
          </button>
        )}

        {/* Commento will be injected here */}
      </div>
    </div>
  );
};

// Type declarations for Commento globals
declare global {
  interface Window {
    commentoUrl?: string;
    commentoPageId?: string;
  }
}