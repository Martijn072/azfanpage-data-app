
-- Remove all existing problematic cron jobs
DO $$
BEGIN
    -- Unschedule all existing notification-related cron jobs
    BEGIN
        PERFORM cron.unschedule('fetch-social-media-posts');
        RAISE NOTICE 'Unscheduled fetch-social-media-posts';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'No fetch-social-media-posts job to unschedule';
    END;
    
    BEGIN
        PERFORM cron.unschedule('fetch-new-articles-for-notifications');
        RAISE NOTICE 'Unscheduled fetch-new-articles-for-notifications';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'No fetch-new-articles-for-notifications job to unschedule';
    END;
    
    -- Clean up any other notification scheduler jobs that might exist
    BEGIN
        PERFORM cron.unschedule('notification-scheduler');
        RAISE NOTICE 'Unscheduled existing notification-scheduler';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'No existing notification-scheduler to unschedule';
    END;
END $$;

-- Create a single, simple cron job that calls our scheduler function
-- This avoids all JSON escaping issues by using a simple HTTP POST
SELECT cron.schedule(
    'notification-scheduler',
    '*/15 * * * *', -- every 15 minutes
    $$
    SELECT net.http_post(
        url := 'https://vweraucnekeucrryqjlo.supabase.co/functions/v1/notification-scheduler',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZXJhdWNuZWtldWNycnlxamxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMzI3OTMsImV4cCI6MjA2NjcwODc5M30.Cy65kblAI4P6GP1ANUHFNdsLma-Hb1lCp5g6w5hRGHc"}'::jsonb,
        body := '{}'::jsonb
    ) as request_id;
    $$
);

-- Verify the cron job was created
DO $$
DECLARE
    job_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO job_count 
    FROM cron.job 
    WHERE jobname = 'notification-scheduler';
    
    RAISE NOTICE 'Notification scheduler cron job created: % jobs found', job_count;
    
    IF job_count > 0 THEN
        RAISE NOTICE 'SUCCESS: Notification scheduler is now active and will run every 15 minutes';
    ELSE
        RAISE NOTICE 'WARNING: Notification scheduler cron job was not created successfully';
    END IF;
END $$;
