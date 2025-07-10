import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  type: 'article' | 'match' | 'social' | 'comment';
  user_ids?: string[]; // Specific users to send to, if empty sends to all
}

interface PushSubscription {
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_id: string;
}

const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: PushNotificationPayload = await req.json();
    console.log('📨 Sending push notification:', payload);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get push subscriptions
    let subscriptionsQuery = supabase
      .from('push_subscriptions')
      .select(`
        endpoint,
        p256dh_key,
        auth_key,
        user_id,
        notification_settings!inner(*)
      `);

    // Filter by specific users if provided
    if (payload.user_ids && payload.user_ids.length > 0) {
      subscriptionsQuery = subscriptionsQuery.in('user_id', payload.user_ids);
    }

    const { data: subscriptions, error: subError } = await subscriptionsQuery;

    if (subError) {
      console.error('❌ Error fetching subscriptions:', subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('ℹ️ No push subscriptions found');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📱 Found ${subscriptions.length} push subscriptions`);

    // Filter subscriptions based on notification settings and quiet hours
    const filteredSubscriptions = subscriptions.filter((sub: any) => {
      const settings = sub.notification_settings;
      
      // Check if push notifications are enabled for this type
      switch (payload.type) {
        case 'article':
          return settings.push_new_articles;
        case 'match':
          return settings.push_live_matches;
        case 'social':
          return settings.push_social_media;
        case 'comment':
          return settings.push_new_comments || settings.push_comment_replies;
        default:
          return true;
      }
    });

    // Check quiet hours
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    const activeSubscriptions = filteredSubscriptions.filter((sub: any) => {
      const settings = sub.notification_settings;
      
      if (!settings.quiet_hours_start || !settings.quiet_hours_end) {
        return true; // No quiet hours set
      }

      const start = settings.quiet_hours_start;
      const end = settings.quiet_hours_end;

      // Handle quiet hours that span midnight
      if (start <= end) {
        return currentTime < start || currentTime >= end;
      } else {
        return currentTime < start && currentTime >= end;
      }
    });

    console.log(`🔇 ${filteredSubscriptions.length - activeSubscriptions.length} subscriptions filtered out by quiet hours`);
    console.log(`✅ Sending to ${activeSubscriptions.length} active subscriptions`);

    // Send push notifications
    const results = await Promise.allSettled(
      activeSubscriptions.map(async (subscription: PushSubscription) => {
        return await sendWebPush(subscription, payload);
      })
    );

    // Count successful sends
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    console.log(`📊 Push notification results: ${successful} sent, ${failed} failed`);

    // Log failed sends
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`❌ Failed to send to subscription ${index}:`, result.reason);
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        sent: successful,
        failed: failed,
        total: activeSubscriptions.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function sendWebPush(subscription: PushSubscription, payload: PushNotificationPayload) {
  const webPushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/favicon.ico',
    badge: payload.badge || '/favicon.ico',
    tag: payload.tag || 'az-notification',
    requireInteraction: payload.requireInteraction || false,
    data: {
      url: payload.url || '/'
    }
  });

  // Create VAPID headers
  const vapidHeaders = await createVapidHeaders(subscription.endpoint);

  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400', // 24 hours
      ...vapidHeaders,
    },
    body: await encryptPayload(
      webPushPayload,
      subscription.p256dh_key,
      subscription.auth_key
    ),
  });

  if (!response.ok) {
    throw new Error(`Push send failed: ${response.status} ${response.statusText}`);
  }

  return response;
}

async function createVapidHeaders(endpoint: string): Promise<Record<string, string>> {
  if (!VAPID_PRIVATE_KEY || !VAPID_PUBLIC_KEY) {
    console.log('⚠️ VAPID keys not configured, sending without VAPID');
    return {};
  }

  // For now, we'll skip VAPID implementation as it requires JWT signing
  // In a production environment, you'd implement proper VAPID signing here
  return {};
}

async function encryptPayload(payload: string, p256dhKey: string, authKey: string): Promise<Uint8Array> {
  // For now, we'll send unencrypted payload
  // In a production environment, you'd implement proper Web Push encryption here
  return new TextEncoder().encode(payload);
}