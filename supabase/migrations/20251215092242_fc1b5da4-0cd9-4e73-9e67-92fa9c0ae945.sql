-- Drop and recreate the SELECT policy with proper NULL handling
DROP POLICY IF EXISTS "Authenticated users can view own WordPress profile" ON public.wordpress_users;

CREATE POLICY "Authenticated users can view own WordPress profile" 
ON public.wordpress_users 
FOR SELECT 
USING (supabase_user_id IS NOT NULL AND auth.uid() = supabase_user_id);

-- Also fix the UPDATE policy for consistency
DROP POLICY IF EXISTS "Authenticated users can update own WordPress profile" ON public.wordpress_users;

CREATE POLICY "Authenticated users can update own WordPress profile" 
ON public.wordpress_users 
FOR UPDATE 
USING (supabase_user_id IS NOT NULL AND auth.uid() = supabase_user_id);