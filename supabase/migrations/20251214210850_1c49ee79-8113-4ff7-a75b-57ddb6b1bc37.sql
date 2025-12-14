-- The user_rate_limits table should only be modified by service role (backend)
-- Users should only be able to view their own rate limits

-- Drop existing SELECT policy to recreate with TO clause
DROP POLICY IF EXISTS "Users can view own rate limits" ON public.user_rate_limits;

-- Create SELECT policy for authenticated users to view their own rate limits
CREATE POLICY "Authenticated users can view own rate limits" 
ON public.user_rate_limits 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Block all INSERT, UPDATE, DELETE from regular users
-- Service role bypasses RLS, so backend can still manage rate limits

-- Explicitly deny INSERT for authenticated users (only service role can insert)
CREATE POLICY "Service role only can insert rate limits" 
ON public.user_rate_limits 
FOR INSERT 
TO authenticated
WITH CHECK (false);

-- Explicitly deny UPDATE for authenticated users
CREATE POLICY "Service role only can update rate limits" 
ON public.user_rate_limits 
FOR UPDATE 
TO authenticated
USING (false);

-- Explicitly deny DELETE for authenticated users
CREATE POLICY "Service role only can delete rate limits" 
ON public.user_rate_limits 
FOR DELETE 
TO authenticated
USING (false);