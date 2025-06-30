
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const NotificationTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const { toast } = useToast();

  const handleTestNotifications = async () => {
    setIsLoading(true);
    console.log('🧪 Testing notification scheduler...');
    
    try {
      const { data, error } = await supabase.functions.invoke('notification-scheduler', {
        body: {}
      });

      if (error) {
        console.error('❌ Error invoking notification scheduler:', error);
        setLastResult({ success: false, error: error.message });
        toast({
          title: "Fout",
          description: `Fout bij het testen van notificaties: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Notification scheduler response:', data);
      setLastResult(data);
      
      if (data?.success) {
        toast({
          title: "Test voltooid",
          description: `Scheduler succesvol uitgevoerd!`,
          className: "bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 text-premium-gray-900 dark:text-white",
        });
      } else {
        toast({
          title: "Test uitgevoerd met waarschuwingen",
          description: `Er waren enkele problemen. Check de resultaten hieronder.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Exception during test:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      setLastResult({ success: false, error: errorMessage });
      toast({
        title: "Fout",
        description: `Er is een fout opgetreden: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="headline-premium text-headline-sm text-az-black dark:text-white font-semibold mb-1">
            Notificatie Test
          </h3>
          <p className="body-premium text-body-sm text-premium-gray-600 dark:text-gray-400">
            Test de notificatie scheduler handmatig
          </p>
        </div>
        <Button
          onClick={handleTestNotifications}
          disabled={isLoading}
          className="bg-az-red hover:bg-red-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testen...
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Test Notificaties
            </>
          )}
        </Button>
      </div>

      {lastResult && (
        <div className="mt-4 p-3 bg-premium-gray-50 dark:bg-gray-700 rounded border">
          <div className="flex items-center gap-2 mb-2">
            {lastResult.success ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span className="font-medium text-sm">
              Test Resultaat: {lastResult.success ? 'Gelukt' : 'Gefaald'}
            </span>
          </div>
          
          {lastResult.social_media_result && (
            <div className="text-xs text-premium-gray-600 dark:text-gray-400 mb-1">
              🐦 Social Media: {lastResult.social_media_result.success !== false ? 'OK' : 'Fout'}
              {lastResult.social_media_result.new_twitter_posts !== undefined && 
                ` (${lastResult.social_media_result.new_twitter_posts} nieuwe tweets)`}
            </div>
          )}
          
          {lastResult.articles_result && (
            <div className="text-xs text-premium-gray-600 dark:text-gray-400 mb-1">
              📰 Artikelen: {lastResult.articles_result.success !== false ? 'OK' : 'Fout'}
              {lastResult.articles_result.newArticles !== undefined && 
                ` (${lastResult.articles_result.newArticles} nieuwe artikelen)`}
            </div>
          )}
          
          {lastResult.errors && lastResult.errors.length > 0 && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-2">
              Fouten: {lastResult.errors.join(', ')}
            </div>
          )}

          {lastResult.error && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-2">
              Fout: {lastResult.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
