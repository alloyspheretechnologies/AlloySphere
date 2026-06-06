// supabase/functions/audit-log/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { actor_id, action, target_type, target_id, before_data, after_data } = await req.json();

    if (!action) {
      return new Response(JSON.stringify({ error: 'action is required' }), { status: 400, headers: corsHeaders });
    }

    // Extract IP and user agent from request
    const ip_address = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null;
    const user_agent = req.headers.get('user-agent') || null;

    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        actor_id,
        action,
        target_type,
        target_id,
        before_data,
        after_data,
        ip_address,
        user_agent,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ data }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
