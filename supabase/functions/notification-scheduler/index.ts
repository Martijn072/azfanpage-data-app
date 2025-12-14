
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
    // Validate service role key - this is an internal-only scheduler function
    const authHeader = req.headers.get('Authorization');
    const expectedServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!authHeader || !authHeader.includes(expectedServiceKey || '')) {
      console.log('🚫 Unauthorized attempt to access scheduler');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Service role required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('📅 Notification Scheduler starting...')
    console.log('🕐 Timestamp:', new Date().toISOString())
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const results = {
      timestamp: new Date().toISOString(),
      articles_result: null as any,
      football_result: null as any,
      success: true,
      errors: [] as string[]
    }

    // Call articles fetcher in notifications mode
    console.log('📰 Checking for new articles...')
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

    // Check for live football matches and create notifications
    console.log('⚽ Checking for live football updates...')
    try {
      const { data: footballData, error: footballError } = await supabaseClient.functions.invoke('football-api', {
        body: { 
          endpoint: '/fixtures',
          params: {
            team: '201', // AZ Alkmaar team ID
            live: 'all',
            timezone: 'Europe/Amsterdam'
          }
        }
      })
      
      if (footballError) {
        console.error('❌ Football API error:', footballError)
        results.errors.push(`Football error: ${footballError.message}`)
        results.football_result = { success: false, error: footballError.message }
      } else {
        console.log('✅ Football API success:', footballData)
        
        // Check if there are any live matches
        const liveMatches = footballData.response?.filter(match => 
          match.fixture.status.short === 'LIVE' || 
          match.fixture.status.short === '1H' || 
          match.fixture.status.short === 'HT' || 
          match.fixture.status.short === '2H'
        ) || []

        console.log(`🔴 Found ${liveMatches.length} live matches`)

        let notificationsCreated = 0
        
        for (const match of liveMatches) {
          const isAZHome = match.teams.home.name.toLowerCase().includes('az')
          const azTeam = isAZHome ? match.teams.home : match.teams.away
          const opponentTeam = isAZHome ? match.teams.away : match.teams.home
          const azGoals = isAZHome ? match.goals.home : match.goals.away
          const opponentGoals = isAZHome ? match.goals.away : match.goals.home

          // Check if we already have a notification for this match
          const { data: existingNotification } = await supabaseClient
            .from('notifications')
            .select('id')
            .eq('type', 'match')
            .eq('match_id', match.fixture.id.toString())
            .single()

          if (!existingNotification) {
            // Create live match notification
            const { error: notificationError } = await supabaseClient
              .from('notifications')
              .insert({
                type: 'match',
                title: `🔴 LIVE: ${azTeam.name} vs ${opponentTeam.name}`,
                description: `${azGoals}-${opponentGoals} • ${match.fixture.status.elapsed}' • ${match.league.name}`,
                icon: '⚽',
                match_id: match.fixture.id.toString(),
                read: false
              })

            if (notificationError) {
              console.error(`❌ Error creating match notification:`, notificationError)
            } else {
              console.log(`✅ Created live match notification: ${azTeam.name} vs ${opponentTeam.name}`)
              notificationsCreated++
            }
          }
        }

        results.football_result = {
          success: true,
          live_matches: liveMatches.length,
          notifications_created: notificationsCreated,
          checked_matches: footballData.response?.length || 0
        }
      }
    } catch (error) {
      console.error('❌ Football API exception:', error)
      results.errors.push(`Football exception: ${error.message}`)
      results.football_result = { success: false, error: error.message }
    }

    // Set overall success status
    results.success = results.errors.length === 0

    console.log('📋 Scheduler Summary:')
    console.log(`  ✅ Success: ${results.success}`)
    console.log(`  📰 Articles: ${results.articles_result?.success !== false ? '✅' : '❌'}`)
    console.log(`  ⚽ Football: ${results.football_result?.success !== false ? '✅' : '❌'}`)
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
