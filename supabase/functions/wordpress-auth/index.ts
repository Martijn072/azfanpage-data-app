
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WordPressAuthRequest {
  action: 'login' | 'register';
  email: string;
  password: string;
  username?: string;
  display_name?: string;
}

const WORDPRESS_API_BASE = 'https://www.azfanpage.nl/wp-json/wp/v2';
const WORDPRESS_AUTH_BASE = 'https://www.azfanpage.nl/wp-json/jwt-auth/v1';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, email, password, username, display_name }: WordPressAuthRequest = await req.json();

    if (action === 'login') {
      // Authenticate with WordPress
      const authResponse = await fetch(`${WORDPRESS_AUTH_BASE}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          password: password
        })
      });

      const authData = await authResponse.json();

      if (!authResponse.ok) {
        console.log('WordPress auth failed:', authData);
        return new Response(JSON.stringify({
          success: false,
          message: 'Onjuiste inloggegevens'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Get user details from WordPress
      const userResponse = await fetch(`${WORDPRESS_API_BASE}/users/me`, {
        headers: {
          'Authorization': `Bearer ${authData.token}`
        }
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        console.log('Failed to get user data:', userData);
        return new Response(JSON.stringify({
          success: false,
          message: 'Kan gebruikersgegevens niet ophalen'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Create or sign in Supabase user
      const { data: supabaseUser, error: supabaseError } = await supabase.auth.admin.createUser({
        email: userData.email,
        email_confirm: true,
        user_metadata: {
          wordpress_id: userData.id,
          username: userData.username,
          display_name: userData.name
        }
      });

      // Store WordPress user mapping
      const { error: mappingError } = await supabase
        .from('wordpress_users')
        .upsert({
          wordpress_user_id: userData.id,
          supabase_user_id: supabaseUser?.user?.id,
          username: userData.username,
          display_name: userData.name,
          email: userData.email,
          avatar_url: userData.avatar_urls?.['96'] || null,
          wordpress_token: authData.token,
          token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          last_login_at: new Date().toISOString()
        }, {
          onConflict: 'wordpress_user_id'
        });

      if (mappingError) {
        console.error('Failed to store user mapping:', mappingError);
      }

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: userData.id,
          username: userData.username,
          display_name: userData.name,
          email: userData.email,
          avatar_url: userData.avatar_urls?.['96'] || null,
          token: authData.token,
          supabase_user_id: supabaseUser?.user?.id
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } else if (action === 'register') {
      // Get admin credentials from environment
      const adminToken = Deno.env.get('WORDPRESS_ADMIN_TOKEN');
      
      if (!adminToken) {
        console.error('WORDPRESS_ADMIN_TOKEN not configured');
        return new Response(JSON.stringify({
          success: false,
          message: 'Server configuratie fout'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Check if token is in username:password format
      if (!adminToken.includes(':')) {
        console.error('WORDPRESS_ADMIN_TOKEN must be in format username:password');
        return new Response(JSON.stringify({
          success: false,
          message: 'Server configuratie fout - ongeldige token format'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Create Basic Authentication header
      const basicAuthHeader = `Basic ${btoa(adminToken)}`;
      
      console.log('Attempting WordPress user registration with Basic auth...');

      // Register new user in WordPress
      const registerResponse = await fetch(`${WORDPRESS_API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': basicAuthHeader
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          name: display_name || username,
          roles: ['subscriber'] // Default role
        })
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        console.log('WordPress registration failed:', registerData);
        
        // Provide more specific error messages
        let errorMessage = 'Registratie mislukt';
        
        if (registerData.code === 'existing_user_login') {
          errorMessage = 'Deze gebruikersnaam is al in gebruik';
        } else if (registerData.code === 'existing_user_email') {
          errorMessage = 'Dit e-mailadres is al geregistreerd';
        } else if (registerData.code === 'rest_user_invalid_email') {
          errorMessage = 'Ongeldig e-mailadres';
        } else if (registerData.message) {
          errorMessage = registerData.message;
        }
        
        return new Response(JSON.stringify({
          success: false,
          message: errorMessage
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      console.log('WordPress registration successful:', registerData);

      return new Response(JSON.stringify({
        success: true,
        message: 'Account succesvol aangemaakt'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      message: 'Ongeldige actie'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('WordPress auth error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Server fout'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
