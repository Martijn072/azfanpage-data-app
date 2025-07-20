
import React, { useEffect, useRef } from 'react';
import { MessageCircle, RefreshCw, AlertCircle, Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DisqusContainerProps {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  currentIdentifier: string;
  onLoadDisqus: () => void;
  onResetDisqus: () => void;
  isDarkMode: boolean;
}

export const DisqusContainer = ({
  isLoaded,
  isLoading,
  error,
  currentIdentifier,
  onLoadDisqus,
  onResetDisqus,
  isDarkMode
}: DisqusContainerProps) => {
  const [darkModeMethod, setDarkModeMethod] = React.useState<'enhanced' | 'sepia' | 'high-contrast' | 'fallback'>('enhanced');
  const disqusRef = useRef<HTMLDivElement>(null);

  // Enhanced Disqus configuration with dark mode attempts
  useEffect(() => {
    if (isLoaded && isDarkMode && window.DISQUS) {
      try {
        // Attempt to configure Disqus with dark theme parameters
        window.DISQUS.reset({
          reload: true,
          config: function () {
            this.page.identifier = currentIdentifier;
            // Try to set color scheme (may not work due to Disqus limitations)
            this.colorScheme = 'dark';
            this.theme = 'dark';
          }
        });
      } catch (e) {
        console.log('Could not configure Disqus dark theme:', e);
      }
    }
  }, [isLoaded, isDarkMode, currentIdentifier]);

  const getDarkModeClass = () => {
    if (!isDarkMode) return '';
    
    switch (darkModeMethod) {
      case 'sepia':
        return 'disqus-sepia-dark';
      case 'high-contrast':
        return 'disqus-high-contrast';
      case 'fallback':
        return 'disqus-fallback';
      default:
        return 'disqus-enhanced-dark';
    }
  };

  return (
    <div className="space-y-4">
      {/* Comments Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-az-red" />
          <h3 className="text-lg font-semibold text-az-black dark:text-white">
            Reacties
          </h3>
        </div>
        
        {/* Dark Mode Style Selector - Only show in dark mode when loaded */}
        {isDarkMode && isLoaded && (
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-premium-gray-500 dark:text-gray-400" />
            <select
              value={darkModeMethod}
              onChange={(e) => setDarkModeMethod(e.target.value as any)}
              className="text-xs bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 rounded px-2 py-1 text-premium-gray-700 dark:text-gray-300"
            >
              <option value="enhanced">Verbeterd</option>
              <option value="sepia">Warm</option>
              <option value="high-contrast">Hoog contrast</option>
              <option value="fallback">Basis</option>
            </select>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-premium-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-az-red" />
            <span className="text-premium-gray-600 dark:text-gray-300">
              Reacties laden...
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">
                Fout bij laden van reacties
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                {error}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={onLoadDisqus}
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300"
                >
                  Opnieuw proberen
                </Button>
                <Button
                  onClick={onResetDisqus}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 dark:text-red-400"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Not Loaded State */}
      {!isLoaded && !isLoading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-premium-gray-200 dark:border-gray-700 p-6">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-premium-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-premium-gray-700 dark:text-gray-300 mb-2">
              Reacties laden
            </h4>
            <p className="text-sm text-premium-gray-500 dark:text-gray-400 mb-4">
              Klik om de reacties te laden
            </p>
            <Button
              onClick={onLoadDisqus}
              className="bg-az-red hover:bg-red-700 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Reacties laden
            </Button>
          </div>
        </div>
      )}

      {/* Debug Info (only in development) */}
      {currentIdentifier && process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-premium-gray-500 dark:text-gray-400 p-2 bg-premium-gray-50 dark:bg-gray-800 rounded">
          <strong>Debug:</strong> Actieve identifier: {currentIdentifier} | Dark mode: {darkModeMethod}
        </div>
      )}

      {/* Enhanced Disqus Container with multiple styling approaches */}
      <div 
        ref={disqusRef}
        id="disqus_thread" 
        className={`min-h-[200px] ${isLoading ? 'disqus-loading' : ''} ${getDarkModeClass()}`}
      />
    </div>
  );
};
