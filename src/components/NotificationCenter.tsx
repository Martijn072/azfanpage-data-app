
import React from 'react';
import { X, Trash2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotifications, useMarkAsRead, useClearAllNotifications, useDeleteNotification, type Notification } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { notifications, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const clearAll = useClearAllNotifications();
  const deleteNotification = useDeleteNotification();

  if (!isOpen) return null;

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead.mutateAsync(notification.id);
    }

    // Navigate to related content
    if (notification.type === 'article' && notification.article_id) {
      navigate(`/artikel/${notification.article_id}`);
      onClose();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotification.mutate(notificationId);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return '📰';
      case 'goal': return '⚽';
      case 'match': return '🏟️';
      case 'breaking': return '🚨';
      default: return '🔔';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'goal': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'match': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'breaking': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Notificaties
            </h1>
            {notifications.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {notifications.filter(n => !n.read).length} nieuw
              </Badge>
            )}
          </div>
          
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearAll.mutate()}
              disabled={clearAll.isPending}
              className="flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Alles gelezen
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-80px)]">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-az-red mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Notificaties laden...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Geen notificaties
            </p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">
              Je ontvangt hier updates over AZ nieuws en wedstrijden
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md group ${
                  !notification.read
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                    : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className={`font-semibold text-sm ${
                          !notification.read 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </h3>
                        
                        {notification.description && (
                          <p className={`text-sm mt-1 ${
                            !notification.read 
                              ? 'text-gray-700 dark:text-gray-300' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {notification.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getTypeColor(notification.type)}`}
                          >
                            {notification.type === 'article' && 'Artikel'}
                            {notification.type === 'goal' && 'Goal'}
                            {notification.type === 'match' && 'Wedstrijd'}
                            {notification.type === 'breaking' && 'Breaking'}
                          </Badge>
                          
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: nl,
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteClick(e, notification.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {!notification.read && (
                    <div className="w-2 h-2 bg-az-red rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
