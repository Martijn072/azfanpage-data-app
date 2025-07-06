import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Share, ExternalLink, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface InAppBrowserProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const InAppBrowser = ({ url, isOpen, onClose, title }: InAppBrowserProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setCurrentUrl(url);
      setIsLoading(true);
      setCanGoBack(false);
      setCanGoForward(false);
    }
  }, [url, isOpen]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    // Try to access iframe history (may be blocked by CORS)
    try {
      if (iframeRef.current?.contentWindow) {
        setCanGoBack(iframeRef.current.contentWindow.history.length > 1);
      }
    } catch (error) {
      // Silently handle CORS errors
    }
  };

  const handleGoBack = () => {
    try {
      iframeRef.current?.contentWindow?.history.back();
      setCanGoBack(false);
    } catch (error) {
      toast({
        title: "Navigatie niet beschikbaar",
        description: "Terug navigeren is niet mogelijk voor deze website",
        variant: "destructive"
      });
    }
  };

  const handleGoForward = () => {
    try {
      iframeRef.current?.contentWindow?.history.forward();
    } catch (error) {
      toast({
        title: "Navigatie niet beschikbaar", 
        description: "Vooruit navigeren is niet mogelijk voor deze website",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Interessante link',
          url: currentUrl,
        });
      } catch (error) {
        // User cancelled sharing or sharing failed
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(currentUrl);
        toast({
          title: "Link gekopieerd",
          description: "De link is gekopieerd naar je klembord"
        });
      } catch (error) {
        toast({
          title: "Delen niet mogelijk",
          description: "Kon de link niet kopiëren",
          variant: "destructive"
        });
      }
    }
  };

  const handleOpenExternal = () => {
    window.open(currentUrl, '_blank');
    onClose();
  };

  const getDisplayUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url.length > 40 ? url.substring(0, 40) + '...' : url;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-white dark:bg-gray-900 animate-slide-in-right"
      style={{ top: 0 }}
    >
      {/* Header */}
      <header className="bg-az-red text-white px-4 py-3 flex items-center gap-3 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/20 p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            {title || getDisplayUrl(currentUrl)}
          </div>
          <div className="text-xs opacity-80 truncate">
            {getDisplayUrl(currentUrl)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-white hover:bg-white/20 p-2"
            title="Delen"
          >
            <Share className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenExternal}
            className="text-white hover:bg-white/20 p-2"
            title="Open in externe browser"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 md:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Navigation Controls */}
      <div className="bg-premium-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-premium-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          disabled={!canGoBack}
          className="text-premium-gray-600 dark:text-gray-300 hover:text-az-red disabled:opacity-50"
          title="Terug"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="text-premium-gray-600 dark:text-gray-300 hover:text-az-red"
          title="Vernieuwen"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>

        {isLoading && (
          <div className="flex-1 flex items-center gap-2 text-sm text-premium-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-az-red border-t-transparent rounded-full animate-spin"></div>
            Laden...
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 relative" style={{ height: 'calc(100vh - 120px)' }}>
        <iframe
          ref={iframeRef}
          src={currentUrl}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          title={title || "Externe website"}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-az-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-premium-gray-600 dark:text-gray-400">
                Website laden...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};