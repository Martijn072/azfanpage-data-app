
import { NewsCard } from "@/components/NewsCard";
import { NextMatchWidget } from "@/components/NextMatchWidget";
import { EredivisieStandings } from "@/components/EredivisieStandings";
import { SocialMediaPromo } from "@/components/SocialMediaPromo";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { NotificationTest } from "@/components/NotificationTest";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import { useInfiniteArticles } from "@/hooks/useInfiniteArticles";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { LoadMoreSkeleton } from "@/components/LoadMoreSkeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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

  // Pull to refresh
  const { isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
    }
  });

  // Extract all articles from all pages
  const articles = data?.pages.flatMap(page => page.articles) || [];

  if (error) {
    return (
      <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900">
        <Header />
        <main className="pb-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center animate-fade-in">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Fout bij het laden van artikelen
              </h2>
              <p className="text-premium-gray-600 dark:text-gray-400">
                {error.message}
              </p>
            </div>
          </div>
        </main>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900">
      <PullToRefreshIndicator 
        isRefreshing={isRefreshing} 
        pullDistance={pullDistance} 
        threshold={100}
      />
      
      <Header />
      
      <main className="pb-20">
        <div className="container mx-auto px-4 py-8">
          {/* Notification Test Component */}
          <div className="animate-fade-in">
            <NotificationTest />
          </div>
          
          {/* Next Match Widget */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <NextMatchWidget />
          </div>
          
          {/* News Section */}
          <section className="mb-12">
            <h2 className="headline-premium text-headline-lg text-az-black dark:text-white font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Laatste Nieuws
            </h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {articles.map((article, index) => (
                    <div 
                      key={article.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
                    >
                      <NewsCard article={article} />
                    </div>
                  ))}
                </div>
                
                {hasNextPage && (
                  <div className="text-center animate-fade-in">
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="bg-az-red hover:bg-red-700 text-white px-8 py-3 text-lg transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                    >
                      {isFetchingNextPage ? 'Laden...' : 'Meer artikelen laden'}
                    </Button>
                  </div>
                )}
                
                {isFetchingNextPage && <LoadMoreSkeleton />}
              </>
            )}
          </section>

          {/* Eredivisie Standings */}
          <div className="animate-fade-in mb-12" style={{ animationDelay: '0.4s' }}>
            <EredivisieStandings />
          </div>
          
          {/* Social Media Promo */}
          <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <SocialMediaPromo />
          </div>
        </div>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
