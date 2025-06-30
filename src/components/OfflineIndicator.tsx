
import { WifiOff, RefreshCw, Clock } from 'lucide-react';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface OfflineIndicatorProps {
  onSyncNow?: () => void;
  issyncing?: boolean;
}

export const OfflineIndicator = ({ onSyncNow, issyncing = false }: OfflineIndicatorProps) => {
  const { isOnline, lastSync } = useOfflineDetection();

  // Only show when offline
  if (isOnline) return null;

  return (
    <div className="bg-premium-gray-100 dark:bg-gray-800 border-b border-premium-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-premium-gray-600 dark:text-gray-400">
            <WifiOff className="w-4 h-4" />
            <span>Offline modus</span>
            
            {lastSync && (
              <div className="flex items-center gap-1 text-xs opacity-75">
                <Clock className="w-3 h-3" />
                <span>
                  Laatste sync: {formatDistanceToNow(lastSync, { 
                    addSuffix: true, 
                    locale: nl 
                  })}
                </span>
              </div>
            )}
          </div>

          {onSyncNow && (
            <button
              onClick={onSyncNow}
              disabled={issyncing}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-white dark:bg-gray-700 rounded border border-premium-gray-300 dark:border-gray-600 hover:bg-premium-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${issyncing ? 'animate-spin' : ''}`} />
              <span>
                {issyncing ? 'Syncing...' : 'Sync nu'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
