
-- Comprehensive fix for social media cron jobs
-- This migration ensures both article and social media fetching work correctly

-- First, clean up any existing cron jobs to avoid conflicts
DO $$
BEGIN
    -- Unschedule existing social media job if it exists
    BEGIN
        PERFORM cron.unschedule('fetch-social-media-posts');
        RAISE NOTICE 'Unscheduled existing social media cron job';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'No existing social media cron job to unschedule';
    END;
    
    -- Unschedule existing articles job if it exists
    BEGIN
        PERFORM cron.unschedule('fetch-new-articles-for-notifications');
        RAISE NOTICE 'Unscheduled existing articles cron job';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'No existing articles cron job to unschedule';
    END;
END $$;

-- Create the social media cron job to run every 15 minutes
DO $$
BEGIN
    PERFORM cron.schedule(
        'fetch-social-media-posts',
        '*/15 * * * *', -- every 15 minutes
        $$
        SELECT
            net.http_post(
                url:='https://vweraucnekeucrryqjlo.supabase.co/functions/v1/social-media-fetcher',
                headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZXJhdWNuZWtldWNycnlxamxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMzI3OTMsImV4cCI6MjA2NjcwODc5M30.Cy65kblAI4P6GP1ANUHFNdsLma-Hb1lCp5g6w5hRGHc"}'::jsonb,
                body:='{}'::jsonb
            ) as request_id;
        $$
    );
    
    RAISE NOTICE 'Social media cron job scheduled successfully - runs every 15 minutes';
END $$;

-- Recreate the articles cron job to run every 30 minutes
DO $$
BEGIN
    PERFORM cron.schedule(
        'fetch-new-articles-for-notifications',
        '*/30 * * * *', -- every 30 minutes
        $$
        SELECT
            net.http_post(
                url:='https://vweraucnekeucrryqjlo.supabase.co/functions/v1/fetch-articles',
                headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZXJhdWNuZWtldWNycnlxamxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMzI3OTMsImV4cCI6MjA2NjcwODc5M30.Cy65kblAI4P6GP1ANUHFNdsLma-Hb1lCp5g6w5hRGHc"}'::jsonb,
                body:='{"mode": "notifications", "perPage": 20}'::jsonb
            ) as request_id;
        $$
    );
    
    RAISE NOTICE 'Articles cron job scheduled successfully - runs every 30 minutes';
END $$;

-- Verify that both cron jobs are scheduled
DO $$
DECLARE
    job_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO job_count 
    FROM cron.job 
    WHERE jobname IN ('fetch-social-media-posts', 'fetch-new-articles-for-notifications');
    
    RAISE NOTICE 'Total cron jobs scheduled: %', job_count;
    
    -- Log the details of scheduled jobs
    FOR job_count IN 
        SELECT jobname FROM cron.job 
        WHERE jobname IN ('fetch-social-media-posts', 'fetch-new-articles-for-notifications')
    LOOP
        RAISE NOTICE 'Scheduled job: %', job_count;
    END LOOP;
END $$;
