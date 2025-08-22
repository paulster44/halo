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

        // Test 1: Check if projects table exists and is accessible
        const tableCheckResponse = await fetch(`${SUPABASE_URL}/rest/v1/projects?limit=1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_ROLE_KEY
            }
        });
        
        const tableCheckResult = {
            status: tableCheckResponse.status,
            statusText: tableCheckResponse.statusText,
            accessible: tableCheckResponse.ok
        };
        
        if (!tableCheckResponse.ok) {
            const errorText = await tableCheckResponse.text();
            tableCheckResult.error = errorText;
        }

        // Test 2: Test creating a project (will be deleted immediately)
        let projectCreateTest = null;
        try {
            const testProjectData = {
                project_name: `DB_TEST_${Date.now()}`,
                description: 'Database connectivity test project',
                automation_tier: 'basic',
                estimated_cost: 0,
                project_status: 'draft',
                user_id: '00000000-0000-0000-0000-000000000000' // Test UUID
            };

            const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(testProjectData)
            });

            projectCreateTest = {
                status: createResponse.status,
                statusText: createResponse.statusText,
                success: createResponse.ok
            };

            if (createResponse.ok) {
                const createdProject = await createResponse.json();
                projectCreateTest.projectId = createdProject[0]?.id;
                
                // Clean up: Delete the test project
                if (createdProject[0]?.id) {
                    await fetch(`${SUPABASE_URL}/rest/v1/projects?id=eq.${createdProject[0].id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                            'apikey': SUPABASE_SERVICE_ROLE_KEY
                        }
                    });
                }
            } else {
                const errorText = await createResponse.text();
                projectCreateTest.error = errorText;
            }
        } catch (error) {
            projectCreateTest = {
                success: false,
                error: error.message
            };
        }

        // Test 3: Check RLS policies
        let rlsTest = null;
        try {
            const rlsResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_table_policies`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_ROLE_KEY
                },
                body: JSON.stringify({ table_name: 'projects' })
            });
            
            rlsTest = {
                status: rlsResponse.status,
                available: rlsResponse.ok
            };
        } catch (error) {
            rlsTest = {
                available: false,
                error: error.message
            };
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Database connectivity test completed',
            timestamp: new Date().toISOString(),
            tests: {
                tableAccessibility: tableCheckResult,
                projectCreation: projectCreateTest,
                rlsPolicies: rlsTest
            },
            summary: {
                databaseConnected: tableCheckResult.accessible,
                projectsTableWorking: projectCreateTest?.success || false,
                allTestsPassed: tableCheckResult.accessible && (projectCreateTest?.success || false)
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Database test error:', error);

        const errorResponse = {
            error: {
                code: 'DATABASE_TEST_FAILED',
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