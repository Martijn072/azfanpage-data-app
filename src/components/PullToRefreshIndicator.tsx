
import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  isRefreshing: boolean;
  pullDistance: number;
  threshold?: number;
}

export const PullToRefreshIndicator = ({ 
  isRefreshing, 
  pullDistance, 
  threshold = 100 
}: PullToRefreshIndicatorProps) => {
  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShow = pullDistance > 20 || isRefreshing;

  if (!shouldShow) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 transition-all duration-200"
      style={{ 
        transform: `translateY(${Math.min(pullDistance * 0.5, 60)}px)`,
        opacity: progress
      }}
    >
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 border border-premium-gray-200 dark:border-gray-700">
        <RefreshCw 
          size={20} 
          className={`text-az-red transition-transform duration-300 ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{
            transform: `rotate(${progress * 180}deg)`
          }}
        />
      </div>
    </div>
  );
};
