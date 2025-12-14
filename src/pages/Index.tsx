import { HeroNewsCard } from "@/components/HeroNewsCard";
import { CompactNewsCard } from "@/components/CompactNewsCard";
import { NewsCard } from "@/components/NewsCard";
import { NextMatchWidget } from "@/components/NextMatchWidget";
import { SocialMediaPromo } from "@/components/SocialMediaPromo";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useInfiniteArticles } from "@/hooks/useInfiniteArticles";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Button } from "@/components/ui/button";
import { H3 } from "@/components/ui/typography";
import { useState, useEffect } from "react";
import { articleCache } from "@/services/articleCache";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
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

  if (error) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-200">
        <OfflineIndicator 
          onSyncNow={handleManualSync}
          issyncing={isSyncing}
        />
        <Header />
        <main className="pb-20">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center animate-fade-in">
              <h2 className="text-2xl font-bold text-destructive mb-4">
                Fout bij het laden van artikelen
              </h2>
              <p className="text-muted-foreground">
                {error.message}
              </p>
              {!isOnline && (
                <p className="text-sm text-muted-foreground mt-2">
                  Controleer je internetverbinding of bekijk offline opgeslagen artikelen
                </p>
              )}
            </div>
          </div>
        </main>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <OfflineIndicator 
        onSyncNow={handleManualSync}
        issyncing={isSyncing}
      />
      
      <PullToRefreshIndicator 
        isRefreshing={isRefreshing} 
        pullDistance={pullDistance} 
        threshold={100}
      />
      
      <Header />
      
      <main className="pb-20">
        <div className="container mx-auto px-4 py-4 md:py-6">
          {isLoading ? (
            <>
              {/* Hero skeleton */}
              <div className="animate-pulse mb-4">
                <div className="aspect-[4/3] lg:aspect-[16/9] bg-muted rounded-xl" />
              </div>
              
              {/* Mobile NextMatch skeleton */}
              <div className="lg:hidden animate-pulse mb-6">
                <div className="h-32 bg-muted rounded-xl" />
              </div>
              
              {/* Compact cards skeleton */}
              <div className="mt-6 space-y-3">
                <div className="h-5 bg-muted rounded w-32 mb-4" />
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse p-3 bg-muted/30 rounded-lg">
                    <div className="w-[100px] aspect-square bg-muted rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : articles.length > 0 ? (
            <>
              {/* Hero Section - Desktop: 2/3 + 1/3 layout */}
              <div className="lg:grid lg:grid-cols-3 lg:gap-6">
                <div className="lg:col-span-2 animate-fade-in">
                  <HeroNewsCard article={articles[0]} />
                </div>
                <div className="hidden lg:block animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <NextMatchWidget />
                </div>
              </div>

              {/* Mobile: NextMatch under hero */}
              <div className="lg:hidden mt-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <NextMatchWidget />
              </div>

              {/* Compact cards section (articles 2-5) */}
              {articles.length > 1 && (
                <section className="mt-6 lg:mt-8">
                  <H3 className="text-foreground mb-4">Meer nieuws</H3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {articles.slice(1, 5).map((article, index) => (
                      <div 
                        key={article.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${0.15 + (index * 0.05)}s` }}
                      >
                        <CompactNewsCard article={article} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Regular cards grid (articles 6+) */}
              {articles.length > 5 && (
                <section className="mt-8 lg:mt-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {articles.slice(5).map((article, index) => (
                      <div 
                        key={article.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${0.3 + (index * 0.03)}s` }}
                      >
                        <NewsCard article={article} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Load more */}
              {hasNextPage && (
                <div className="text-center mt-8 animate-fade-in">
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage || (!isOnline && !articles.length)}
                    className="bg-az-red hover:bg-red-700 text-white px-8 py-3 text-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                  >
                    {isFetchingNextPage ? 'Laden...' : 'Meer artikelen laden'}
                  </Button>
                  {!isOnline && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Internetverbinding vereist voor meer artikelen
                    </p>
                  )}
                </div>
              )}

              {isFetchingNextPage && (
                <div className="mt-6 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse h-24 bg-muted rounded-lg" />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Geen artikelen gevonden</p>
            </div>
          )}
          
          {/* Social Media Promo */}
          <div className="mt-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <SocialMediaPromo />
          </div>
        </div>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
