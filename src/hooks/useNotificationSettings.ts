import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_new_comments: boolean | null;
  email_comment_replies: boolean | null;
  push_new_comments: boolean | null;
  push_comment_replies: boolean | null;
  push_new_articles: boolean | null;
  push_live_matches: boolean | null;
  push_social_media: boolean | null;
  in_app_notifications: boolean | null;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useNotificationSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Since we removed auth, return basic functionality without user-specific settings

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      // Return default settings since we don't have user authentication
      return {
        id: 'default',
        user_id: 'default',
        email_new_comments: true,
        email_comment_replies: true,
        push_new_comments: false,
        push_comment_replies: true,
        push_new_articles: true,
        push_live_matches: true,
        push_social_media: false,
        in_app_notifications: true,
        quiet_hours_start: null,
        quiet_hours_end: null,
        created_at: null,
        updated_at: null,
      } as NotificationSettings;
    },
    enabled: true,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<NotificationSettings>) => {
      // Since we don't have authentication, just store locally and show success
      console.log('💾 Storing notification settings locally:', newSettings);
      
      // Store in localStorage for basic persistence
      localStorage.setItem('az-notification-settings', JSON.stringify(newSettings));
      
      return {
        ...settings,
        ...newSettings,
        updated_at: new Date().toISOString(),
      } as NotificationSettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['notification-settings'], data);
      toast({
        title: "Instellingen opgeslagen",
        description: "Je notificatie-instellingen zijn bijgewerkt",
      });
    },
    onError: (error) => {
      console.error('❌ Failed to update notification settings:', error);
      toast({
        title: "Fout",
        description: "Kon instellingen niet bijwerken",
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  };
};