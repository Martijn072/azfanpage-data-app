
import { useEffect, useRef } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useDisqusLoader } from '@/hooks/useDisqusLoader';
import { DisqusContainer } from './DisqusContainer';

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
  const { isDarkMode } = useDarkMode();
  const {
    isLoaded,
    isLoading,
    error,
    currentIdentifier,
    loadDisqus,
    resetDisqus
  } = useDisqusLoader({ slug, title, articleId });

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
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

  return (
    <div ref={containerRef} className="mt-8 pt-6 border-t border-premium-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="headline-premium text-headline-sm text-yellow-900 dark:text-yellow-100 mb-2">
                ⚠️ Legacy Comment Systeem
              </h4>
              <p className="body-premium text-body-sm text-yellow-800 dark:text-yellow-200 mb-3">
                Dit is het oude Disqus comment systeem. We zijn overgestapt op een nieuw, veiliger systeem.
                Deze comments zijn alleen nog zichtbaar voor archief doeleinden.
              </p>
            </div>
          </div>
        </div>
        
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
