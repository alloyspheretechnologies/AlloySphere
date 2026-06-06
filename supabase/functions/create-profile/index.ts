// supabase/functions/create-profile/index.ts
// Deno Edge Function: Create or update a user profile
// Triggered after Google OAuth signup

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, name, avatar_url, role, username, bio, headline, skills } = await req.json();

    if (!user_id || !name) {
      return new Response(
        JSON.stringify({ error: 'user_id and name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if profile exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user_id)
      .single();

    let result;
    if (existing) {
      // Update existing profile
      result = await supabase
        .from('profiles')
        .update({ name, avatar_url, role, username, bio, headline, skills })
        .eq('user_id', user_id)
        .select()
        .single();
    } else {
      // Create new profile
      result = await supabase
        .from('profiles')
        .insert({ user_id, name, avatar_url, role: role ?? 'talent', username, bio, headline, skills })
        .select()
        .single();
    }

    if (result.error) throw result.error;

    return new Response(
      JSON.stringify({ data: result.data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
