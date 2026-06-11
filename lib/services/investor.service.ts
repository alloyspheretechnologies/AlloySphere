import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { InvestorProfile } from '@/lib/types';

export const investorService = {
  async getInvestorProfile(userId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('investor_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return { data: data as InvestorProfile | null, error };
  },

  async updateInvestorProfile(userId: string, updates: Partial<InvestorProfile>) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('investor_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    return { data: data as InvestorProfile | null, error };
  }
};
