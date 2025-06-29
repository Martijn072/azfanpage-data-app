
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  type TEXT NOT NULL CHECK (type IN ('article', 'goal', 'match', 'breaking')),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  article_id TEXT,
  match_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create index for better performance
CREATE INDEX idx_notifications_user_id_created_at ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_read_status ON public.notifications(user_id, read);

-- Insert some sample notifications for testing
INSERT INTO public.notifications (type, title, description, icon, article_id) VALUES
('article', 'Nieuwe transfer update', 'AZ haalt nieuwe speler binnen voor het winterse transfervenster', '📰', '123'),
('goal', 'GOAL! AZ scoort', 'AZ scoort de 1-0 tegen Ajax in de 25e minuut', '⚽', null),
('match', 'Wedstrijd begint binnenkort', 'AZ - PSV begint over 1 uur in het AFAS Stadion', '🏟️', null),
('breaking', 'BREAKING: Trainer nieuws', 'AZ bevestigt nieuwe contractverlenging hoofdtrainer', '🚨', '456');
