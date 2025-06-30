
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📅 Notification Scheduler starting...')
    console.log('🕐 Timestamp:', new Date().toISOString())
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const results = {
      timestamp: new Date().toISOString(),
      social_media_result: null as any,
      articles_result: null as any,
      success: true,
      errors: [] as string[]
    }

    // Call social media fetcher
    console.log('🐦 Calling social media fetcher...')
    try {
      const { data: socialData, error: socialError } = await supabaseClient.functions.invoke('social-media-fetcher', {
        body: {}
      })
      
      if (socialError) {
        console.error('❌ Social media fetcher error:', socialError)
        results.errors.push(`Social media error: ${socialError.message}`)
        results.social_media_result = { success: false, error: socialError.message }
      } else {
        console.log('✅ Social media fetcher success:', socialData)
        results.social_media_result = socialData
      }
    } catch (error) {
      console.error('❌ Social media fetcher exception:', error)
      results.errors.push(`Social media exception: ${error.message}`)
      results.social_media_result = { success: false, error: error.message }
    }

    // Call articles fetcher in notifications mode
    console.log('📰 Calling articles fetcher...')
    try {
      const { data: articlesData, error: articlesError } = await supabaseClient.functions.invoke('fetch-articles', {
        body: { mode: 'notifications', perPage: 20 }
      })
      
      if (articlesError) {
        console.error('❌ Articles fetcher error:', articlesError)
        results.errors.push(`Articles error: ${articlesError.message}`)
        results.articles_result = { success: false, error: articlesError.message }
      } else {
        console.log('✅ Articles fetcher success:', articlesData)
        results.articles_result = articlesData
      }
    } catch (error) {
      console.error('❌ Articles fetcher exception:', error)
      results.errors.push(`Articles exception: ${error.message}`)
      results.articles_result = { success: false, error: error.message }
    }

    // Set overall success status
    results.success = results.errors.length === 0

    console.log('📋 Scheduler Summary:')
    console.log(`  ✅ Success: ${results.success}`)
    console.log(`  🐦 Social Media: ${results.social_media_result?.success !== false ? '✅' : '❌'}`)
    console.log(`  📰 Articles: ${results.articles_result?.success !== false ? '✅' : '❌'}`)
    console.log(`  ❌ Errors: ${results.errors.length}`)

    return new Response(
      JSON.stringify(results, null, 2),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Scheduler error:', error)
    const errorResult = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
    
    return new Response(
      JSON.stringify(errorResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
