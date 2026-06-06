// supabase/functions/create-startup/index.ts
// Deno Edge Function: Create a startup with workspace and owner membership

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Math.random().toString(36).substring(2, 6);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user from the auth token
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404, headers: corsHeaders });
    }

    const body = await req.json();
    const { name, industry, stage, description, website, visibility } = body;

    if (!name) {
      return new Response(JSON.stringify({ error: 'name is required' }), { status: 400, headers: corsHeaders });
    }

    const slug = generateSlug(name);

    // Create startup (triggers will auto-create workspace and add owner as member)
    const { data: startup, error } = await supabase
      .from('startups')
      .insert({
        owner_id: profile.id,
        name,
        slug,
        industry,
        stage: stage ?? 'idea',
        description,
        website,
        visibility: visibility ?? 'public',
      })
      .select()
      .single();

    if (error) throw error;

    // Log the activity
    await supabase.from('activity_logs').insert({
      user_id: profile.id,
      action: 'startup_created',
      entity_type: 'startup',
      entity_id: startup.id,
      metadata: { name: startup.name },
    });

    // Create audit log
    await supabase.from('audit_logs').insert({
      actor_id: profile.id,
      action: 'create_startup',
      target_type: 'startup',
      target_id: startup.id,
      after_data: startup,
    });

    return new Response(
      JSON.stringify({ data: startup }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
