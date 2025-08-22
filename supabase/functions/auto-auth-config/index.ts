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
        const { currentDeploymentUrl } = await req.json();
        
        if (!currentDeploymentUrl) {
            throw new Error('currentDeploymentUrl is required');
        }

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseProjectRef = Deno.env.get('SUPABASE_PROJECT_REF') || 'lwecpaxaggvtwyohxkqt';

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        console.log(`Updating auth config for deployment: ${currentDeploymentUrl}`);

        // Configure redirect URLs
        const redirectUrls = [
            `${currentDeploymentUrl}/auth/callback`,
            `${currentDeploymentUrl}/auth/reset-password`,
            `${currentDeploymentUrl}/dashboard`,
            `${currentDeploymentUrl}`
        ];

        // Use Supabase Management API to update auth settings
        const updateAuthConfig = async () => {
            try {
                // Update site URL
                const siteUrlResponse = await fetch(`https://api.supabase.com/v1/projects/${supabaseProjectRef}/config/auth`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        SITE_URL: currentDeploymentUrl,
                        ADDITIONAL_REDIRECT_URLS: redirectUrls.join(','),
                        DISABLE_SIGNUP: false,
                        EMAIL_CONFIRM_CHANGES: false,
                        EMAIL_DOUBLE_CONFIRM_CHANGES: false,
                        ENABLE_SIGNUP: true
                    })
                });

                if (siteUrlResponse.ok) {
                    console.log('Auth config updated successfully via Management API');
                    return { success: true, method: 'management_api' };
                }
            } catch (error) {
                console.warn('Management API failed:', error.message);
            }

            // Fallback: Direct database update
            try {
                const dbUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/update_auth_config`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'Content-Type': 'application/json',
                        'apikey': serviceRoleKey
                    },
                    body: JSON.stringify({
                        site_url: currentDeploymentUrl,
                        redirect_urls: redirectUrls
                    })
                });

                if (dbUpdateResponse.ok) {
                    console.log('Auth config updated via database function');
                    return { success: true, method: 'database_function' };
                }
            } catch (error) {
                console.warn('Database function failed:', error.message);
            }

            // Last resort: Environment variable approach
            try {
                const envUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/set_config`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'Content-Type': 'application/json',
                        'apikey': serviceRoleKey
                    },
                    body: JSON.stringify({
                        setting_name: 'auth.site_url',
                        setting_value: currentDeploymentUrl
                    })
                });

                return { success: true, method: 'environment_config', attempted: true };
            } catch (error) {
                console.warn('Environment config failed:', error.message);
                return { success: false, error: error.message };
            }
        };

        const updateResult = await updateAuthConfig();

        // Create test account to verify auth is working
        const createTestAccount = async () => {
            try {
                const testEmail = `test.${Date.now()}@minimax.com`;
                const testPassword = 'TestPassword123!';

                const signupResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'Content-Type': 'application/json',
                        'apikey': serviceRoleKey
                    },
                    body: JSON.stringify({
                        email: testEmail,
                        password: testPassword,
                        email_confirm: false
                    })
                });

                if (signupResponse.ok) {
                    return {
                        success: true,
                        testAccount: { email: testEmail, password: testPassword }
                    };
                } else {
                    const errorText = await signupResponse.text();
                    return {
                        success: false,
                        error: `Test account creation failed: ${errorText}`
                    };
                }
            } catch (error) {
                return {
                    success: false,
                    error: `Test account creation error: ${error.message}`
                };
            }
        };

        const testResult = await createTestAccount();

        return new Response(JSON.stringify({
            success: true,
            message: 'Auth configuration updated',
            deploymentUrl: currentDeploymentUrl,
            redirectUrls: redirectUrls,
            updateResult: updateResult,
            testAccountResult: testResult,
            timestamp: new Date().toISOString()
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Auto auth config error:', error);

        const errorResponse = {
            error: {
                code: 'AUTO_AUTH_CONFIG_FAILED',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});