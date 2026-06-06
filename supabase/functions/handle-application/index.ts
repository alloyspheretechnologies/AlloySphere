// supabase/functions/handle-application/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  applied: ['reviewing', 'withdrawn'],
  reviewing: ['interview', 'rejected', 'withdrawn'],
  interview: ['accepted', 'rejected', 'withdrawn'],
  accepted: [],
  rejected: [],
  withdrawn: [],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const { application_id, new_status } = await req.json();
    if (!application_id || !new_status) {
      return new Response(JSON.stringify({ error: 'application_id and new_status required' }), { status: 400, headers: corsHeaders });
    }

    // Get application
    const { data: app, error: fetchError } = await supabase
      .from('applications')
      .select('*, opportunity:opportunities(title)')
      .eq('id', application_id)
      .single();

    if (fetchError || !app) {
      return new Response(JSON.stringify({ error: 'Application not found' }), { status: 404, headers: corsHeaders });
    }

    // Validate state transition
    const validNext = VALID_TRANSITIONS[app.status] ?? [];
    if (!validNext.includes(new_status)) {
      return new Response(
        JSON.stringify({ error: `Cannot transition from ${app.status} to ${new_status}` }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Update application (triggers handle notifications)
    const { data: updated, error } = await supabase
      .from('applications')
      .update({ status: new_status, reviewed_at: new Date().toISOString() })
      .eq('id', application_id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ data: updated }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
