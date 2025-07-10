import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  created_at: string;
  updated_at: string;
}

// VAPID public key - deze zou normaal vanuit de backend moeten komen
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HI0stV14_VuEB1dLjxQ3HL5_LtK8VjbNkxDRDhGY8jCIFP6wKM_IrFbFqU';

export const usePushSubscription = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkPushSupport();
    checkExistingSubscription();
  }, []);

  const checkPushSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (!supported) {
      console.log('❌ Push notifications not supported');
      setIsLoading(false);
    }
  };

  const checkExistingSubscription = async () => {
    if (!isSupported) return;

    try {
      // Check if service worker is registered and has subscription
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
        
        if (subscription) {
          console.log('✅ Existing push subscription found');
          // Verify subscription exists in database
          await verifySubscriptionInDatabase(subscription);
        }
      }
    } catch (error) {
      console.error('❌ Error checking existing subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifySubscriptionInDatabase = async (subscription: globalThis.PushSubscription) => {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('endpoint', subscription.endpoint)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error verifying subscription in database:', error);
      }

      if (!data) {
        // Subscription not in database, save it
        await saveSubscriptionToDatabase(subscription);
      }
    } catch (error) {
      console.error('❌ Error verifying subscription:', error);
    }
  };

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      throw error;
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const saveSubscriptionToDatabase = async (subscription: globalThis.PushSubscription) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const subscriptionJson = subscription.toJSON();
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.data.user.id,
        endpoint: subscription.endpoint,
        p256dh_key: subscriptionJson.keys?.p256dh || '',
        auth_key: subscriptionJson.keys?.auth || '',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving subscription to database:', error);
      throw error;
    }

    console.log('✅ Subscription saved to database:', data);
    return data as PushSubscription;
  };

  const subscribe = async () => {
    if (!isSupported) {
      throw new Error('Push notifications not supported');
    }

    try {
      setIsLoading(true);

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Register service worker
      const registration = await registerServiceWorker();

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log('✅ Push subscription created:', subscription);

      // Save to database
      await saveSubscriptionToDatabase(subscription);

      setIsSubscribed(true);
      console.log('✅ Push notifications enabled');
    } catch (error) {
      console.error('❌ Error subscribing to push notifications:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    try {
      setIsLoading(true);

      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          console.log('✅ Push subscription removed from browser');

          // Remove from database
          const { error } = await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', subscription.endpoint);

          if (error) {
            console.error('❌ Error removing subscription from database:', error);
          } else {
            console.log('✅ Subscription removed from database');
          }
        }
      }

      setIsSubscribed(false);
    } catch (error) {
      console.error('❌ Error unsubscribing from push notifications:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  };
};