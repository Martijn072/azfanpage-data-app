-- Fix WordPress users table RLS: restrict SELECT to own data only
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all WordPress user profiles" ON public.wordpress_users;

-- Create a new restrictive SELECT policy - users can only view their own data
CREATE POLICY "Users can view own WordPress profile" 
ON public.wordpress_users 
FOR SELECT 
USING (auth.uid() = supabase_user_id);

-- Create a secure function for limited public profile lookups (username, display_name, avatar only)
CREATE OR REPLACE FUNCTION public.get_wordpress_public_profile(p_wordpress_user_id integer)
RETURNS TABLE (
  wordpress_user_id integer,
  username text,
  display_name text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    wu.wordpress_user_id,
    wu.username,
    wu.display_name,
    wu.avatar_url
  FROM public.wordpress_users wu
  WHERE wu.wordpress_user_id = p_wordpress_user_id;
$$;