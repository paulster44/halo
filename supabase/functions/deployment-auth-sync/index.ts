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
        // Get the current deployment URL from the request headers
        const origin = req.headers.get('origin') || req.headers.get('referer');
        const currentDeploymentUrl = origin ? new URL(origin).origin : null;

        if (!currentDeploymentUrl) {
            throw new Error('Could not determine current deployment URL');
        }

        console.log(`Auto-configuring auth for: ${currentDeploymentUrl}`);

        // Call the auto-auth-config function
        const autoConfigResponse = await fetch(
            `${Deno.env.get('SUPABASE_URL')}/functions/v1/auto-auth-config`,
            {
                method: 'POST',
                headers: {
                    'Authorization': req.headers.get('authorization') || '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentDeploymentUrl: currentDeploymentUrl
                })
            }
        );

        const configResult = await autoConfigResponse.json();

        if (autoConfigResponse.ok) {
            return new Response(JSON.stringify({
                success: true,
                message: 'Authentication auto-configured on deployment',
                deploymentUrl: currentDeploymentUrl,
                configResult: configResult
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        } else {
            throw new Error(`Auto-config failed: ${JSON.stringify(configResult)}`);
        }

    } catch (error) {
        console.error('Deployment auto-config error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'DEPLOYMENT_AUTO_CONFIG_FAILED',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});