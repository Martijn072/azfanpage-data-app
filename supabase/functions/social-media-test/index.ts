
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 Starting comprehensive social media diagnostic test...')
    console.log('📅 Test timestamp:', new Date().toISOString())
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Check Twitter API credentials
    console.log('🔑 Checking Twitter API credentials...')
    const twitterKeys = {
      TWITTER_CONSUMER_KEY: Deno.env.get("TWITTER_CONSUMER_KEY") ? '✅ Set' : '❌ Missing',
      TWITTER_CONSUMER_SECRET: Deno.env.get("TWITTER_CONSUMER_SECRET") ? '✅ Set' : '❌ Missing',
      TWITTER_ACCESS_TOKEN: Deno.env.get("TWITTER_ACCESS_TOKEN") ? '✅ Set' : '❌ Missing',
      TWITTER_ACCESS_TOKEN_SECRET: Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET") ? '✅ Set' : '❌ Missing'
    }
    console.log('🐦 Twitter credentials status:', twitterKeys)

    // 2. Check Instagram credentials
    console.log('📷 Checking Instagram API credentials...')
    const instagramKeys = {
      INSTAGRAM_ACCESS_TOKEN: Deno.env.get("INSTAGRAM_ACCESS_TOKEN") ? '✅ Set' : '❌ Missing',
      INSTAGRAM_USER_ID: Deno.env.get("INSTAGRAM_USER_ID") ? '✅ Set' : '❌ Missing'
    }
    console.log('📷 Instagram credentials status:', instagramKeys)

    // 3. Test social media fetcher function directly
    console.log('🧪 Testing social-media-fetcher function...')
    let fetcherResult;
    let fetcherError;
    
    try {
      const { data, error } = await supabaseClient.functions.invoke('social-media-fetcher')
      fetcherResult = data;
      fetcherError = error;
      
      if (error) {
        console.error('❌ Social media fetcher error:', error)
      } else {
        console.log('✅ Social media fetcher result:', data)
      }
    } catch (error) {
      console.error('❌ Error calling social media fetcher:', error)
      fetcherError = error.message;
    }

    // 4. Check recent social media notifications
    console.log('📱 Checking recent social media notifications...')
    const { data: notifications, error: notifError } = await supabaseClient
      .from('notifications')
      .select('*')
      .in('type', ['twitter', 'instagram'])
      .order('created_at', { ascending: false })
      .limit(20)

    if (notifError) {
      console.error('❌ Error checking notifications:', notifError)
    } else {
      console.log(`✅ Found ${notifications?.length || 0} social media notifications:`)
      notifications?.slice(0, 5).forEach(notif => {
        console.log(`  - ${notif.type}: ${notif.title} (${notif.created_at})`)
      })
    }

    // 5. Check if cron jobs exist
    console.log('📋 Checking for cron jobs...')
    let cronJobStatus = 'Unknown';
    try {
      // Try to check cron jobs - this might not work in all environments
      const { data: cronJobs, error: cronError } = await supabaseClient
        .rpc('cron_job_check')
      
      if (cronError) {
        console.log('⚠️ Cannot check cron jobs directly (this is normal):', cronError.message)
        cronJobStatus = 'Cannot check directly';
      } else {
        console.log('✅ Cron jobs found:', cronJobs?.length || 0)
        cronJobStatus = `${cronJobs?.length || 0} jobs found`;
      }
    } catch (error) {
      console.log('⚠️ Cron job check skipped (this is normal):', error.message)
      cronJobStatus = 'Check skipped';
    }

    // 6. Clean up mock/test data if requested
    const cleanupMockData = req.url.includes('cleanup=true');
    let cleanupResult = null;
    
    if (cleanupMockData) {
      console.log('🧹 Cleaning up mock social media data...')
      const { data: deleted, error: deleteError } = await supabaseClient
        .from('notifications')
        .delete()
        .like('social_media_url', '%mockpost%')
        .select()

      if (deleteError) {
        console.error('❌ Error cleaning up mock data:', deleteError)
        cleanupResult = `Error: ${deleteError.message}`;
      } else {
        console.log(`✅ Cleaned up ${deleted?.length || 0} mock notifications`)
        cleanupResult = `Deleted ${deleted?.length || 0} mock notifications`;
      }
    }

    const diagnosticResult = {
      timestamp: new Date().toISOString(),
      credentials: {
        twitter: twitterKeys,
        instagram: instagramKeys,
        all_twitter_set: Object.values(twitterKeys).every(status => status === '✅ Set'),
        instagram_configured: Object.values(instagramKeys).every(status => status === '✅ Set')
      },
      social_media_fetcher: {
        result: fetcherResult,
        error: fetcherError,
        available: !fetcherError
      },
      notifications: {
        count: notifications?.length || 0,
        recent: notifications?.slice(0, 5).map(n => ({
          type: n.type,
          title: n.title,
          created_at: n.created_at,
          url: n.social_media_url
        })) || []
      },
      cron_jobs: {
        status: cronJobStatus
      },
      cleanup: cleanupResult
    }

    console.log('🎯 Diagnostic test complete!')
    console.log('📊 Final result:', diagnosticResult)

    return new Response(
      JSON.stringify(diagnosticResult, null, 2),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Diagnostic test error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString(),
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
