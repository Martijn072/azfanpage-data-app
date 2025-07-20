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
      console.log('🚀 Starting WordPress registration process...');
      console.log('📝 Registration data:', { username, email, display_name });

      // Get admin credentials from environment
      const adminToken = Deno.env.get('WORDPRESS_ADMIN_TOKEN');
      
      if (!adminToken) {
        console.error('❌ WORDPRESS_ADMIN_TOKEN not configured');
        return new Response(JSON.stringify({
          success: false,
          message: 'Server configuratie fout'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      console.log('🔑 Admin token found, validating format...');

      // Check if token is in username:password format
      if (!adminToken.includes(':')) {
        console.error('❌ WORDPRESS_ADMIN_TOKEN must be in format username:password');
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
      console.log('🔐 Basic auth header created successfully');
      
      // Test WordPress REST API with comprehensive security plugin detection
      console.log('🔍 Testing WordPress REST API with Really Simple Security detection...');
      try {
        // Test multiple endpoints to detect plugin interference
        const endpoints = [
          { name: 'users', url: `${WORDPRESS_API_BASE}/users` },
          { name: 'root', url: 'https://www.azfanpage.nl/wp-json/' },
          { name: 'wp-info', url: `${WORDPRESS_API_BASE}` }
        ];

        for (const endpoint of endpoints) {
          console.log(`🔍 Testing ${endpoint.name} endpoint...`);
          const testResponse = await fetch(endpoint.url, {
            method: 'GET',
            headers: {
              'Authorization': basicAuthHeader,
              'Content-Type': 'application/json',
              'User-Agent': 'AZ-Fanpage-Registration/1.0'
            }
          });
          
          console.log(`📊 ${endpoint.name} response status:`, testResponse.status);
          
          if (!testResponse.ok) {
            const testError = await testResponse.text();
            console.log(`❌ ${endpoint.name} test failed:`, testError);
            
            // Detect Really Simple Security specific blocks
            if (testError.includes('really-simple-ssl') || testError.includes('security') || testResponse.status === 403) {
              return new Response(JSON.stringify({
                success: false,
                message: 'WordPress security plugin (mogelijk Really Simple Security) blokkeert REST API toegang. Controleer plugin instellingen.',
                debug: {
                  detected_issue: 'Security plugin blocking REST API',
                  status: testResponse.status,
                  endpoint: endpoint.name,
                  error: testError.substring(0, 200),
                  solution: 'Ga naar Really Simple Security → Settings → deactiveer "Block REST API" of voeg Supabase domein toe aan whitelist'
                }
              }), {
                status: 403,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            }
            
            if (testResponse.status === 401) {
              return new Response(JSON.stringify({
                success: false,
                message: 'WordPress authenticatie mislukt. Controleer Application Password instellingen.',
                debug: {
                  status: testResponse.status,
                  error: testError.substring(0, 200),
                  solution: 'Maak een nieuw Application Password aan in WordPress admin'
                }
              }), {
                status: 401,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            }
          } else {
            console.log(`✅ ${endpoint.name} endpoint is accessible`);
          }
        }
        
        console.log('✅ All REST API endpoints are accessible');
      } catch (testError) {
        console.error('💥 REST API test error:', testError);
        return new Response(JSON.stringify({
          success: false,
          message: 'Kan WordPress API niet bereiken. Mogelijk netwerk of DNS probleem.',
          debug: {
            error: testError.message,
            solution: 'Controleer WordPress site toegankelijkheid en DNS instellingen'
          }
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      console.log('🔄 Attempting WordPress user registration...');

      // Prepare registration payload with additional headers for security plugins
      const registrationPayload = {
        username: username,
        email: email,
        password: password,
        name: display_name || username,
        roles: ['subscriber']
      };
      
      console.log('📦 Registration payload:', registrationPayload);

      // Register new user in WordPress with headers that bypass common security plugins
      const registerResponse = await fetch(`${WORDPRESS_API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': basicAuthHeader,
          'User-Agent': 'AZ-Fanpage-Registration/1.0',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(registrationPayload)
      });

      console.log('📡 WordPress API response status:', registerResponse.status);

      const registerData = await registerResponse.json();
      console.log('📄 WordPress API response:', JSON.stringify(registerData, null, 2));

      if (!registerResponse.ok) {
        console.log('❌ WordPress registration failed with status:', registerResponse.status);
        
        // Enhanced error detection for security plugins
        let errorMessage = 'Registratie mislukt';
        let solution = '';
        
        if (registerData.code === 'existing_user_login') {
          errorMessage = 'Deze gebruikersnaam is al in gebruik';
        } else if (registerData.code === 'existing_user_email') {
          errorMessage = 'Dit e-mailadres is al geregistreerd';
        } else if (registerData.code === 'rest_user_invalid_email') {
          errorMessage = 'Ongeldig e-mailadres';
        } else if (registerData.code === 'rest_cannot_create_user') {
          errorMessage = 'Geen toestemming om gebruikers aan te maken';
          solution = 'Dit wordt vaak veroorzaakt door Really Simple Security plugin. Ga naar WordPress Admin → Really Simple Security → Settings → schakel "Block REST API" uit of voeg dit domein toe aan de whitelist.';
        } else if (registerData.code === 'rest_forbidden' || registerResponse.status === 403) {
          errorMessage = 'WordPress security plugin blokkeert registratie';
          solution = 'Really Simple Security of vergelijkbare plugin blokkeert API toegang. Controleer plugin instellingen.';
        } else if (registerData.message) {
          errorMessage = registerData.message;
        }
        
        return new Response(JSON.stringify({
          success: false,
          message: errorMessage,
          debug: {
            status: registerResponse.status,
            wordpress_error: registerData,
            solution: solution || 'Controleer WordPress instellingen en plugin configuratie'
          }
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      console.log('✅ WordPress registration successful!');

      // Auto-login after successful registration
      console.log('🔄 Auto-login after registration...');
      
      try {
        const loginResponse = await fetch(`${WORDPRESS_AUTH_BASE}/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: email,
            password: password
          })
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          console.log('✅ Auto-login successful');
          
          return new Response(JSON.stringify({
            success: true,
            message: 'Account succesvol aangemaakt en ingelogd',
            user: {
              id: registerData.id,
              username: registerData.username,
              display_name: registerData.name,
              email: registerData.email,
              token: loginData.token
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } else {
          console.log('⚠️ Auto-login failed, but registration successful');
        }
      } catch (loginError) {
        console.error('💥 Auto-login error:', loginError);
      }

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
    console.error('💥 WordPress auth error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Server fout',
      debug: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
