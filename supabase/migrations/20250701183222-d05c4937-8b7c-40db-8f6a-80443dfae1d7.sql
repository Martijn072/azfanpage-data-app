
-- Drop existing comment tables to start fresh
DROP TABLE IF EXISTS public.comment_likes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;

-- Create user profiles table for enhanced user management
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  reputation INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  banned_until TIMESTAMP WITH TIME ZONE,
  warning_count INTEGER DEFAULT 0,
  last_warning_at TIMESTAMP WITH TIME ZONE,
  account_created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create secure comments table
CREATE TABLE public.secure_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.secure_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) >= 3 AND length(content) <= 2000),
  content_html TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  edit_count INTEGER DEFAULT 0,
  last_edited_at TIMESTAMP WITH TIME ZONE,
  likes_count INTEGER DEFAULT 0,
  dislikes_count INTEGER DEFAULT 0,
  reports_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false,
  hidden_reason TEXT,
  spam_score DECIMAL(3,2) DEFAULT 0.0,
  reply_count INTEGER DEFAULT 0,
  depth INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create comment reactions table
CREATE TABLE public.comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES public.secure_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Create comment reports table
CREATE TABLE public.comment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES public.secure_comments(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'misinformation', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create rate limiting table
CREATE TABLE public.user_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ip_address INET,
  action_type TEXT NOT NULL CHECK (action_type IN ('comment', 'like', 'report', 'login_attempt')),
  action_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, ip_address, action_type, window_start)
);

-- Create notification preferences table  
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_new_comments BOOLEAN DEFAULT true,
  email_comment_replies BOOLEAN DEFAULT true,
  push_new_comments BOOLEAN DEFAULT false,
  push_comment_replies BOOLEAN DEFAULT true,
  in_app_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create article subscriptions table
CREATE TABLE public.article_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_id TEXT NOT NULL,
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, article_id)
);

-- Create secure notifications table
CREATE TABLE public.secure_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('comment_reply', 'comment_like', 'comment_mention', 'article_comment')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  comment_id UUID REFERENCES public.secure_comments(id) ON DELETE CASCADE,
  article_id TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secure_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secure_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for secure_comments  
CREATE POLICY "Anyone can view approved comments" ON public.secure_comments FOR SELECT USING (is_approved = true AND NOT is_hidden);
CREATE POLICY "Users can insert own comments" ON public.secure_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.secure_comments FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for comment_reactions
CREATE POLICY "Anyone can view reactions" ON public.comment_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage own reactions" ON public.comment_reactions FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for comment_reports
CREATE POLICY "Users can create reports" ON public.comment_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view own reports" ON public.comment_reports FOR SELECT USING (auth.uid() = reporter_id);

-- RLS Policies for user_rate_limits
CREATE POLICY "Users can view own rate limits" ON public.user_rate_limits FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for notification_settings
CREATE POLICY "Users can manage own notification settings" ON public.notification_settings FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for article_subscriptions
CREATE POLICY "Users can manage own subscriptions" ON public.article_subscriptions FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for secure_notifications
CREATE POLICY "Users can view own notifications" ON public.secure_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.secure_notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_secure_comments_article_id ON public.secure_comments(article_id);
CREATE INDEX idx_secure_comments_user_id ON public.secure_comments(user_id);
CREATE INDEX idx_secure_comments_parent_id ON public.secure_comments(parent_id);
CREATE INDEX idx_secure_comments_created_at ON public.secure_comments(created_at DESC);
CREATE INDEX idx_comment_reactions_comment_id ON public.comment_reactions(comment_id);
CREATE INDEX idx_comment_reactions_user_id ON public.comment_reactions(user_id);
CREATE INDEX idx_user_rate_limits_user_window ON public.user_rate_limits(user_id, window_start);
CREATE INDEX idx_secure_notifications_user_unread ON public.secure_notifications(user_id, is_read, created_at DESC);

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_comment_reaction_counts()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

-- Function to update reply counts
CREATE OR REPLACE FUNCTION update_reply_counts()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_comment_reaction_change
  AFTER INSERT OR UPDATE OR DELETE ON public.comment_reactions
  FOR EACH ROW EXECUTE FUNCTION update_comment_reaction_counts();

CREATE TRIGGER on_comment_reply_change
  AFTER INSERT OR DELETE ON public.secure_comments
  FOR EACH ROW EXECUTE FUNCTION update_reply_counts();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_profile();

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_ip_address INET,
  p_action_type TEXT,
  p_max_actions INTEGER,
  p_window_minutes INTEGER
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record rate limit action
CREATE OR REPLACE FUNCTION record_rate_limit_action(
  p_user_id UUID,
  p_ip_address INET,
  p_action_type TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_rate_limits (user_id, ip_address, action_type)
  VALUES (p_user_id, p_ip_address, p_action_type)
  ON CONFLICT (user_id, ip_address, action_type, window_start)
  DO UPDATE SET action_count = user_rate_limits.action_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
