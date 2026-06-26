import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { notificationService } from './notification.service';
import type { PitchRequest, PitchRequestInsert } from '@/lib/types';

export const pitchRequestService = {
  /**
   * Create a pitch request from an investor to a startup's founder
   */
  async createPitchRequest(data: PitchRequestInsert) {
    const supabase = getSupabaseBrowserClient();
    
    // Check if the investor already has a pending pitch request globally
    const { data: existing, error: checkError } = await supabase
      .from('pitch_requests')
      .select('id')
      .eq('investor_id', data.investor_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      return { data: null, error: { message: 'You can only have 1 pending pitch request at a time. Please wait for a response before sending another.', code: 'LIMIT_EXCEEDED' } as any };
    }

    const { data: request, error } = await supabase
      .from('pitch_requests')
      .insert(data)
      .select()
      .single();

    if (request && !error) {
      await notificationService.createNotification({
        user_id: data.founder_id,
        type: 'pitch_request_received',
        title: 'New Pitch Request',
        body: 'An investor has requested a pitch from your startup.',
        metadata: {
          pitch_request_id: request.id,
          startup_id: data.startup_id,
          investor_id: data.investor_id,
        },
        link: '/pitch-requests',
      });
    }

    return { data: request as PitchRequest | null, error };
  },

  /**
   * Get a single pitch request by ID
   */
  async getPitchRequest(requestId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('pitch_requests')
      .select('*, investor:profiles!pitch_requests_investor_id_fkey(id, name, avatar_url, headline), startup:startups!pitch_requests_startup_id_fkey(id, name, slug, logo_url, industry)')
      .eq('id', requestId)
      .single();

    return { data, error };
  },

  /**
   * Get outgoing pitch requests for an investor
   */
  async getMyPitchRequests(investorId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('pitch_requests')
      .select('*, startup:startups!pitch_requests_startup_id_fkey(id, name, slug, logo_url, industry, stage)')
      .eq('investor_id', investorId)
      .order('created_at', { ascending: false });

    return { data: data ?? [], error };
  },

  /**
   * Get incoming pitch requests for a founder (across all their startups)
   */
  async getIncomingPitchRequests(founderId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('pitch_requests')
      .select('*, investor:profiles!pitch_requests_investor_id_fkey(id, name, avatar_url, headline, role), startup:startups!pitch_requests_startup_id_fkey(id, name, slug)')
      .eq('founder_id', founderId)
      .order('created_at', { ascending: false });

    return { data: data ?? [], error };
  },

  /**
   * Check if investor already sent a pitch request for a startup
   */
  async hasPitchRequest(investorId: string, startupId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('pitch_requests')
      .select('id, status')
      .eq('investor_id', investorId)
      .eq('startup_id', startupId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return { data, exists: !!data, error };
  },

  /**
   * Founder responds to a pitch request (accept or decline)
   */
  async respondToPitchRequest(requestId: string, status: 'accepted' | 'declined', response?: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('pitch_requests')
      .update({
        status,
        response: response || null,
        responded_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select('*, investor:profiles!pitch_requests_investor_id_fkey(id, name), startup:startups!pitch_requests_startup_id_fkey(id, name)')
      .single();

    // Notify the investor about the response
    if (data && !error) {
      await notificationService.createNotification({
        user_id: data.investor_id,
        type: 'pitch_request_responded',
        title: `${(data as any).startup?.name} ${status} your pitch request`,
        body: response || `Your pitch request has been ${status}.`,
        metadata: {
          pitch_request_id: requestId,
          startup_id: data.startup_id,
          status,
        },
        link: '/investments',
      });
    }

    return { data: data as PitchRequest | null, error };
  },

  /**
   * Investor cancels/deletes their pitch request
   */
  async cancelPitchRequest(requestId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from('pitch_requests')
      .delete()
      .eq('id', requestId);

    return { error };
  },
};
