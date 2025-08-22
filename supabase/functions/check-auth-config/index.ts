Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    
    if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL) {
      throw new Error('Missing Supabase configuration');
    }

    // Get the deployment URL dynamically from request headers or environment
    const { deploymentUrl } = await req.json();
    const PRODUCTION_URL = deploymentUrl || req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://wtzp9bm667ff.space.minimax.io';
    
    // Manual configuration instructions
    const configInstructions = {
      site_url: PRODUCTION_URL,
      additional_redirect_urls: [
        `${PRODUCTION_URL}/auth/callback`,
        `${PRODUCTION_URL}/auth/reset-password`,
        `${PRODUCTION_URL}/dashboard`
      ]
    };
    
    // Try to query current auth config
    let currentConfig = null;
    try {
      const authConfigResponse = await fetch(`${SUPABASE_URL}/rest/v1/auth_config`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY
        }
      });
      
      if (authConfigResponse.ok) {
        currentConfig = await authConfigResponse.json();
      }
    } catch (error) {
      console.log('Could not fetch current auth config:', error.message);
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Auth configuration URLs determined',
      productionUrl: PRODUCTION_URL,
      recommendedConfig: configInstructions,
      currentConfig,
      instructions: [
        '1. Go to Supabase Dashboard > Authentication > URL Configuration',
        '2. Set Site URL to: ' + PRODUCTION_URL,
        '3. Add these to Additional Redirect URLs:',
        '   - ' + PRODUCTION_URL + '/auth/callback',
        '   - ' + PRODUCTION_URL + '/auth/reset-password',
        '   - ' + PRODUCTION_URL + '/dashboard',
        '4. Save the configuration'
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});