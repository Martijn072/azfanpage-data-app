
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const NotificationTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
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
        toast({
          title: "Fout",
          description: `Fout bij het testen van notificaties: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Notification scheduler response:', data);
      
      if (data?.success) {
        toast({
          title: "Test voltooid",
          description: `Scheduler uitgevoerd! Nieuwe artikelen: ${data.newArticles || 0}, Social media: ${data.social_media_result?.success ? 'Gelukt' : 'Gefaald'}`,
          className: "bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 text-premium-gray-900 dark:text-white",
        });
      } else {
        toast({
          title: "Test uitgevoerd",
          description: `Scheduler uitgevoerd met fouten. Check de console voor details.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Exception during test:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het testen",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
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
    </div>
  );
};
