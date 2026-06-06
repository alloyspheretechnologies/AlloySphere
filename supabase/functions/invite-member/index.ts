// supabase/functions/invite-member/index.ts
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
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const { startup_id, invitee_user_id, role } = await req.json();
    if (!startup_id || !invitee_user_id) {
      return new Response(JSON.stringify({ error: 'startup_id and invitee_user_id required' }), { status: 400, headers: corsHeaders });
    }

    // Verify inviter is admin/owner
    const { data: inviterProfile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
    const { data: membership } = await supabase
      .from('startup_members')
      .select('role')
      .eq('startup_id', startup_id)
      .eq('user_id', inviterProfile?.id)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return new Response(JSON.stringify({ error: 'Not authorized to invite' }), { status: 403, headers: corsHeaders });
    }

    // Create invitation
    const { data: member, error } = await supabase
      .from('startup_members')
      .insert({ startup_id, user_id: invitee_user_id, role: role ?? 'member', status: 'invited' })
      .select()
      .single();

    if (error) throw error;

    // Send notification to invitee
    const { data: startup } = await supabase.from('startups').select('name').eq('id', startup_id).single();
    await supabase.from('notifications').insert({
      user_id: invitee_user_id,
      type: 'member_invited',
      title: `You've been invited to ${startup?.name}`,
      body: `You've been invited to join as a ${role ?? 'member'}`,
      data: { startup_id, membership_id: member.id },
    });

    return new Response(JSON.stringify({ data: member }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
