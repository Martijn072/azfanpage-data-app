-- Fix security issues identified in Supabase Security Advisor

-- 1. Enable RLS on processed_articles table
ALTER TABLE public.processed_articles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only service role access (no public access needed)
CREATE POLICY "Service role only access" 
ON public.processed_articles 
FOR ALL 
USING (false);

-- 2. Fix mutable search paths for database functions by adding SECURITY DEFINER SET search_path = ''

-- Fix update_media_vote_count function
CREATE OR REPLACE FUNCTION public.update_media_vote_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.supporter_media 
    SET votes_count = votes_count + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = NEW.media_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.supporter_media 
    SET votes_count = votes_count - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = OLD.media_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.supporter_media 
    SET votes_count = votes_count + 
      CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END -
      CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = NEW.media_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

-- Fix update_media_report_count function
CREATE OR REPLACE FUNCTION public.update_media_report_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.supporter_media 
    SET reports_count = reports_count + 1
    WHERE id = NEW.media_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

-- Fix update_comment_reaction_counts function
CREATE OR REPLACE FUNCTION public.update_comment_reaction_counts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.secure_comments 
    SET likes_count = likes_count + CASE WHEN NEW.reaction_type = 'like' THEN 1 ELSE 0 END,
        dislikes_count = dislikes_count + CASE WHEN NEW.reaction_type = 'dislike' THEN 1 ELSE 0 END
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.secure_comments 
    SET likes_count = likes_count - CASE WHEN OLD.reaction_type = 'like' THEN 1 ELSE 0 END,
        dislikes_count = dislikes_count - CASE WHEN OLD.reaction_type = 'dislike' THEN 1 ELSE 0 END
    WHERE id = OLD.comment_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.secure_comments 
    SET likes_count = likes_count + 
          CASE WHEN NEW.reaction_type = 'like' THEN 1 ELSE 0 END -
          CASE WHEN OLD.reaction_type = 'like' THEN 1 ELSE 0 END,
        dislikes_count = dislikes_count + 
          CASE WHEN NEW.reaction_type = 'dislike' THEN 1 ELSE 0 END -
          CASE WHEN OLD.reaction_type = 'dislike' THEN 1 ELSE 0 END
    WHERE id = NEW.comment_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

-- Fix update_reply_counts function
CREATE OR REPLACE FUNCTION public.update_reply_counts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    UPDATE public.secure_comments 
    SET reply_count = reply_count + 1
    WHERE id = NEW.parent_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    UPDATE public.secure_comments 
    SET reply_count = reply_count - 1
    WHERE id = OLD.parent_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Fix handle_new_user_profile function
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  username_base TEXT;
  username_counter INTEGER := 0;
  final_username TEXT;
BEGIN
  -- Extract username from email or use random
  username_base := COALESCE(
    split_part(NEW.email, '@', 1),
    'user_' || substr(NEW.id::text, 1, 8)
  );
  
  -- Ensure unique username
  final_username := username_base;
  WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = final_username) LOOP
    username_counter := username_counter + 1;
    final_username := username_base || '_' || username_counter;
  END LOOP;
  
  -- Create profile
  INSERT INTO public.user_profiles (
    user_id,
    username,
    display_name,
    avatar_url
  ) VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', final_username),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  
  -- Create notification settings
  INSERT INTO public.notification_settings (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$function$;

-- Fix check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_user_id uuid, p_ip_address inet, p_action_type text, p_max_actions integer, p_window_minutes integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  SELECT COALESCE(SUM(action_count), 0)
  INTO current_count
  FROM public.user_rate_limits
  WHERE user_id = p_user_id
    AND ip_address = p_ip_address
    AND action_type = p_action_type
    AND window_start > window_start;
  
  RETURN current_count < p_max_actions;
END;
$function$;

-- Fix record_rate_limit_action function
CREATE OR REPLACE FUNCTION public.record_rate_limit_action(p_user_id uuid, p_ip_address inet, p_action_type text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.user_rate_limits (user_id, ip_address, action_type)
  VALUES (p_user_id, p_ip_address, p_action_type)
  ON CONFLICT (user_id, ip_address, action_type, window_start)
  DO UPDATE SET action_count = user_rate_limits.action_count + 1;
END;
$function$;