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
    // Create a test account using Supabase Admin API
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    
    if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL) {
      throw new Error('Missing Supabase configuration');
    }

    // Create user via Admin API
    const createUserResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        email: 'newuser@test.com',
        password: 'NewPass123!',
        email_confirm: true,
        user_metadata: {
          full_name: 'New Test User'
        }
      })
    });
    
    if (!createUserResponse.ok) {
      const errorText = await createUserResponse.text();
      console.error('Failed to create user:', errorText);
      throw new Error(`Failed to create user: ${errorText}`);
    }
    
    const userData = await createUserResponse.json();
    console.log('User created:', userData);
    
    // Create profile record
    const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        id: userData.id,
        email: 'newuser@test.com',
        full_name: 'New Test User',
        user_role: 'client'
      })
    });
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Failed to create profile:', errorText);
      // Don't throw here, user creation was successful
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Test account created successfully',
      credentials: {
        email: 'newuser@test.com',
        password: 'NewPass123!'
      },
      userId: userData.id
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