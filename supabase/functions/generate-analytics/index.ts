// supabase/functions/generate-analytics/index.ts
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
    const { startup_id, period_days } = await req.json();
    const days = period_days ?? 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Aggregate metrics
    const [tasks, applications, members, followers, events] = await Promise.all([
      supabase.from('tasks').select('status, created_at').gte('created_at', since.toISOString()),
      supabase.from('applications').select('status, applied_at').eq('startup_id', startup_id).gte('applied_at', since.toISOString()),
      supabase.from('startup_members').select('id').eq('startup_id', startup_id).eq('status', 'active'),
      supabase.from('startup_followers').select('id').eq('startup_id', startup_id),
      supabase.from('analytics_events').select('event_name, created_at').gte('created_at', since.toISOString()),
    ]);

    const metrics = {
      period_days: days,
      total_tasks: tasks.data?.length ?? 0,
      completed_tasks: tasks.data?.filter(t => t.status === 'done').length ?? 0,
      total_applications: applications.data?.length ?? 0,
      pending_applications: applications.data?.filter(a => a.status === 'applied').length ?? 0,
      accepted_applications: applications.data?.filter(a => a.status === 'accepted').length ?? 0,
      active_members: members.data?.length ?? 0,
      total_followers: followers.data?.length ?? 0,
      total_events: events.data?.length ?? 0,
      generated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify({ data: metrics }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
