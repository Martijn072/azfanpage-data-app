
import { NewsCard } from "@/components/NewsCard";
import { NextMatchWidget } from "@/components/NextMatchWidget";
import { SocialMediaPromo } from "@/components/SocialMediaPromo";
import { ResponsiveLayout } from "@/components/layout/ResponsiveLayout";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useInfiniteArticles } from "@/hooks/useInfiniteArticles";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useResponsive } from "@/hooks/useResponsive";
import { LoadMoreSkeleton } from "@/components/LoadMoreSkeleton";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { articleCache } from "@/services/articleCache";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { isMobile } = useResponsive();
  const { 
    data,
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    refetch
  } = useInfiniteArticles();

  const { isSyncing, handleManualSync, isOnline } = useOfflineSync();

  // Pull to refresh with sync
  const { isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
      // Cache the new articles
      const articles = data?.pages.flatMap(page => page.articles) || [];
      if (articles.length > 0) {
        await articleCache.cacheArticles(articles);
      }
    }
  });

  // Extract all articles from all pages
  const articles = data?.pages.flatMap(page => page.articles) || [];

  // Cache articles when they load
  useEffect(() => {
    if (articles.length > 0 && isOnline) {
      articleCache.cacheArticles(articles);
    }
  }, [articles, isOnline]);

  return (
    <ResponsiveLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      showSidebar={true}
    >
      <OfflineIndicator 
        onSyncNow={handleManualSync}
        issyncing={isSyncing}
      />
      
      <PullToRefreshIndicator 
        isRefreshing={isRefreshing} 
        pullDistance={pullDistance} 
        threshold={100}
      />
      
      {error ? (
        <div className="py-8">
          <div className="text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Fout bij het laden van artikelen
            </h2>
            <p className="text-premium-gray-600 dark:text-gray-400">
              {error.message}
            </p>
            {!isOnline && (
              <p className="text-sm text-premium-gray-500 dark:text-gray-400 mt-2">
                Controleer je internetverbinding of bekijk offline opgeslagen artikelen
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Next Match Widget - Only show on mobile, desktop has it in sidebar */}
          {isMobile && (
            <div className="animate-fade-in">
              <NextMatchWidget />
            </div>
          )}

          {/* Desktop Magazine Layout */}
          {!isMobile && articles.length > 0 && (
            <>
              {/* Hero Article */}
              <div className="mb-8 animate-fade-in">
                <div className="bg-card rounded-lg overflow-hidden shadow-sm border">
                  <NewsCard article={articles[0]} />
                </div>
              </div>

              {/* Secondary Articles - 2 columns */}
              {articles.length > 1 && (
                <div className="mb-8 animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6" style={{ animationDelay: '0.1s' }}>
                  {articles.slice(1, 3).map((article, index) => (
                    <div 
                      key={article.id} 
                      className="bg-card rounded-lg overflow-hidden shadow-sm border animate-fade-in"
                      style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}
                    >
                      <NewsCard article={article} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* News Section */}
          <section className="mb-12">
            {isMobile && (
              <h2 className="headline-premium text-headline-lg text-az-black dark:text-white font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Laatste Nieuws
              </h2>
            )}
            
            {isLoading ? (
              <div className={`grid gap-6 ${
                isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
              }`}>
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-premium-gray-200 dark:bg-gray-700 rounded-lg aspect-video mb-4"></div>
                    <div className="h-4 bg-premium-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-premium-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Dynamic Grid Layout for Desktop */}
                <div className={isMobile ? 'space-y-6 mb-8' : 'space-y-8 mb-8'}>
                  {(isMobile ? articles : articles.slice(3)).map((article, index) => {
                    if (isMobile) {
                      return (
                        <div 
                          key={article.id}
                          className="bg-card rounded-lg overflow-hidden shadow-sm border animate-fade-in"
                          style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}
                        >
                          <NewsCard article={article} />
                        </div>
                      );
                    }

                    // Desktop dynamic layout: alternating pattern
                    const isFullWidth = (index + 1) % 3 === 0; // Every 3rd article is full width
                    
                    if (isFullWidth) {
                      return (
                        <div 
                          key={article.id}
                          className="bg-card rounded-lg overflow-hidden shadow-sm border animate-fade-in"
                          style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}
                        >
                          <NewsCard article={article} />
                        </div>
                      );
                    } else {
                      // Check if this is the start of a pair
                      const nextArticle = (isMobile ? articles : articles.slice(3))[index + 1];
                      const isNextFullWidth = nextArticle && ((index + 2) % 3 === 0);
                      
                      if (!isNextFullWidth && nextArticle) {
                        // Render pair of articles
                        return (
                          <div key={`pair-${index}`} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div 
                              className="bg-card rounded-lg overflow-hidden shadow-sm border animate-fade-in"
                              style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}
                            >
                              <NewsCard article={article} />
                            </div>
                            <div 
                              className="bg-card rounded-lg overflow-hidden shadow-sm border animate-fade-in"
                              style={{ animationDelay: `${0.2 + ((index + 1) * 0.1)}s` }}
                            >
                              <NewsCard article={nextArticle} />
                            </div>
                          </div>
                        );
                      } else {
                        // Single article
                        return (
                          <div 
                            key={article.id}
                            className="bg-card rounded-lg overflow-hidden shadow-sm border animate-fade-in"
                            style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}
                          >
                            <NewsCard article={article} />
                          </div>
                        );
                      }
                    }
                  }).filter((item, index, array) => {
                    // Filter out duplicate articles that were rendered in pairs
                    if (isMobile) return true;
                    const articleIndex = index;
                    const isInPair = (articleIndex % 3 !== 2) && (articleIndex % 2 === 0) && 
                                    array[articleIndex + 1] && ((articleIndex + 2) % 3 !== 0);
                    const isPairSecond = (articleIndex % 3 !== 2) && (articleIndex % 2 === 1) && 
                                        array[articleIndex - 1] && ((articleIndex + 1) % 3 !== 0);
                    return !isPairSecond;
                  })}
                </div>
                
                {hasNextPage && (
                  <div className="text-center animate-fade-in">
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage || (!isOnline && !articles.length)}
                      className="bg-az-red hover:bg-red-700 text-white px-8 py-3 text-lg transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {isFetchingNextPage ? 'Laden...' : 'Meer artikelen laden'}
                    </Button>
                    {!isOnline && (
                      <p className="text-sm text-premium-gray-500 dark:text-gray-400 mt-2">
                        Internetverbinding vereist voor meer artikelen
                      </p>
                    )}
                  </div>
                )}
                
                {isFetchingNextPage && <LoadMoreSkeleton />}

                {/* Social Media Promo - Only show on mobile, desktop has it in sidebar */}
                {isMobile && (
                  <div className="animate-fade-in mt-8" style={{ animationDelay: '0.4s' }}>
                    <SocialMediaPromo />
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </ResponsiveLayout>
  );
};

export default Index;
