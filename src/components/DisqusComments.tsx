
import { useEffect, useRef } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useDisqusLoader } from '@/hooks/useDisqusLoader';
import { DisqusContainer } from './DisqusContainer';
import { Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { enhanceDisqusForDarkMode, applyDisqusDarkModePostLoad, waitForDisqusLoad } from '@/utils/disqusEnhancer';

interface DisqusCommentsProps {
  slug: string;
  title: string;
  articleId: string;
}

export const DisqusComments = ({
  slug,
  title,
  articleId
}: DisqusCommentsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const {
    isLoaded,
    isLoading,
    error,
    currentIdentifier,
    loadDisqus,
    resetDisqus
  } = useDisqusLoader({ 
    slug, 
    title, 
    articleId,
    enhancedConfig: enhanceDisqusForDarkMode({
      identifier: slug || articleId,
      title,
      colorScheme: isDarkMode ? 'dark' : 'light',
      theme: isDarkMode ? 'dark' : 'light'
    })
  });

  // Enhanced intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log('Disqus container in view, preparing enhanced loading...');
          observer.disconnect();
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '100px 0px'
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  // Apply enhanced dark mode styling after Disqus loads
  useEffect(() => {
    if (isLoaded && isDarkMode) {
      waitForDisqusLoad(() => {
        console.log('Applying enhanced dark mode styling to Disqus...');
        applyDisqusDarkModePostLoad('enhanced');
      });
    }
  }, [isLoaded, isDarkMode]);

  return (
    <div ref={containerRef} className="mt-8 pt-6 border-t border-premium-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced dark mode suggestion with better styling */}
        {isDarkMode && (
          <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-amber-700 dark:text-amber-300">
                <Sun className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-1">
                    Voor de beste ervaring met reacties
                  </p>
                  <p className="text-xs opacity-90">
                    Schakel naar light mode voor optimale leesbaarheid
                  </p>
                </div>
              </div>
              <Button
                onClick={toggleDarkMode}
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/30 flex-shrink-0 transition-all duration-200"
              >
                <Sun className="w-3 h-3 mr-1" />
                Light mode
              </Button>
            </div>
          </div>
        )}

        <DisqusContainer
          isLoaded={isLoaded}
          isLoading={isLoading}
          error={error}
          currentIdentifier={currentIdentifier}
          onLoadDisqus={loadDisqus}
          onResetDisqus={resetDisqus}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};
