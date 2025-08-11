
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    console.log('🧹 Notification cleanup starting...')
    console.log('🕐 Timestamp:', new Date().toISOString())
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (action === 'fix-titles') {
      // Clean up notification titles by removing BREAKING prefix
      console.log('🔧 Fixing notification titles...')
      
      const { data: notificationsToFix } = await supabaseClient
        .from('notifications')
        .select('id, title')
        .like('title', '🔥 BREAKING:%');

      console.log(`Found ${notificationsToFix?.length || 0} notifications with BREAKING prefix to fix`);

      let fixedCount = 0;
      for (const notification of notificationsToFix || []) {
        const cleanTitle = notification.title.replace(/^🔥 BREAKING:\s*/, '');
        
        const { error } = await supabaseClient
          .from('notifications')
          .update({ title: cleanTitle })
          .eq('id', notification.id);

        if (!error) {
          fixedCount++;
          console.log(`✅ Fixed title: "${notification.title}" → "${cleanTitle}"`);
        } else {
          console.error(`❌ Error fixing notification ${notification.id}:`, error);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          action: 'fix-titles',
          fixed_count: fixedCount,
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Default action: cleanup old notifications
    // Calculate cutoff date (7 days ago)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 7)
    const cutoffISOString = cutoffDate.toISOString()

    console.log(`🗓️ Deleting notifications older than: ${cutoffISOString}`)

    // Delete notifications older than 7 days
    const { data, error, count } = await supabaseClient
      .from('notifications')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffISOString)

    if (error) {
      console.error('❌ Error deleting old notifications:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    const deletedCount = count || 0
    console.log(`✅ Successfully deleted ${deletedCount} old notifications`)

    const result = {
      success: true,
      action: 'cleanup',
      deleted_count: deletedCount,
      cutoff_date: cutoffISOString,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(result, null, 2),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Cleanup error:', error)
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
