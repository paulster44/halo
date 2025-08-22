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
        console.log('Upload floor plan request received');
        console.log('Method:', req.method);
        console.log('Headers:', Object.fromEntries(req.headers.entries()));
        
        const requestBody = await req.json();
        console.log('Request body keys:', Object.keys(requestBody));
        
        const { imageData, fileName, title, description } = requestBody;

        if (!imageData || !fileName) {
            console.error('Missing required fields:', { hasImageData: !!imageData, hasFileName: !!fileName });
            throw new Error('Image data and filename are required');
        }

        if (!title) {
            console.error('Missing title field');
            throw new Error('Floor plan title is required');
        }
        
        console.log('Request validation passed:', { fileName, title, imageDataLength: imageData.length });

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        let userId = null;
        
        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'apikey': serviceRoleKey
                    }
                });
                
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    userId = userData.id;
                }
            } catch (error) {
                console.log('Could not get user from token:', error.message);
            }
        }

        // Extract base64 data from data URL
        const base64Data = imageData.split(',')[1];
        const mimeType = imageData.split(';')[0].split(':')[1];

        // Convert base64 to binary
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Create unique filename with timestamp
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}_${fileName}`;

        // Upload to Supabase Storage
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/floor-plans/${uniqueFileName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': mimeType,
                'x-upsert': 'true'
            },
            body: binaryData
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload failed: ${errorText}`);
        }

        // Get public URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/floor-plans/${uniqueFileName}`;

        // Get image dimensions (basic validation)
        let imageWidth = null;
        let imageHeight = null;
        
        // For basic validation, we'll estimate based on file size
        // In a production environment, you'd use proper image processing
        const estimatedPixels = binaryData.length / 3; // Rough estimate
        const estimatedSize = Math.sqrt(estimatedPixels);
        imageWidth = Math.round(estimatedSize);
        imageHeight = Math.round(estimatedSize);

        // Save floor plan metadata to database
        const floorPlanData = {
            user_id: userId,
            title: title,
            description: description || '',
            image_url: publicUrl,
            file_name: uniqueFileName,
            file_size: binaryData.length,
            image_width: imageWidth,
            image_height: imageHeight,
            analysis_status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/floor_plans`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(floorPlanData)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            // If database insert fails, try to clean up the uploaded file
            try {
                await fetch(`${supabaseUrl}/storage/v1/object/floor-plans/${uniqueFileName}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`
                    }
                });
            } catch (cleanupError) {
                console.error('Failed to cleanup uploaded file:', cleanupError);
            }
            throw new Error(`Database insert failed: ${errorText}`);
        }

        const floorPlan = await insertResponse.json();

        return new Response(JSON.stringify({
            data: {
                floorPlan: floorPlan[0],
                publicUrl: publicUrl,
                message: 'Floor plan uploaded successfully. Analysis will begin shortly.'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Floor plan upload error:', error);

        const errorResponse = {
            error: {
                code: 'FLOOR_PLAN_UPLOAD_FAILED',
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