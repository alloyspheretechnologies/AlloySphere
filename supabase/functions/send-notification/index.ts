// supabase/functions/send-notification/index.ts
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
    const { user_id, type, title, body, data } = await req.json();

    if (!user_id || !type || !title) {
      return new Response(JSON.stringify({ error: 'user_id, type, and title are required' }), { status: 400, headers: corsHeaders });
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({ user_id, type, title, body, data: data ?? {} })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ data: notification }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
