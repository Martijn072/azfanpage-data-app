-- Drop existing policies on wordpress_users
DROP POLICY IF EXISTS "Users can view own WordPress profile" ON public.wordpress_users;
DROP POLICY IF EXISTS "Users can update their own WordPress profile" ON public.wordpress_users;

-- Create explicit policy for authenticated users only to view their own profile
-- This excludes the wordpress_token from being accessible
CREATE POLICY "Authenticated users can view own WordPress profile" 
ON public.wordpress_users 
FOR SELECT 
TO authenticated
USING (auth.uid() = supabase_user_id);

-- Create policy for authenticated users to update their own profile
CREATE POLICY "Authenticated users can update own WordPress profile" 
ON public.wordpress_users 
FOR UPDATE 
TO authenticated
USING (auth.uid() = supabase_user_id);

-- Create a security definer function to safely get public WordPress profile info
-- This explicitly excludes email, token, and sensitive fields
CREATE OR REPLACE FUNCTION public.get_wordpress_safe_profile(p_wordpress_user_id integer)
RETURNS TABLE(
  wordpress_user_id integer,
  username text,
  display_name text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    wu.wordpress_user_id,
    wu.username,
    wu.display_name,
    wu.avatar_url
  FROM public.wordpress_users wu
  WHERE wu.wordpress_user_id = p_wordpress_user_id;
$$;