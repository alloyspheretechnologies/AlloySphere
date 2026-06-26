"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { profileService } from "@/lib/services/profile.service";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function InvestorProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [investorData, setInvestorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myProfileId, setMyProfileId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const { data } = await profileService.getProfile(id);
      if (!data) return;
      setProfile(data);

      const supabase = getSupabaseBrowserClient();
      const { data: invData } = await supabase
        .from('investor_profiles')
        .select('*')
        .eq('user_id', id)
        .maybeSingle();
      
      setInvestorData(invData);

      const { data: myProf } = await profileService.getCurrentProfile();
      if (myProf) setMyProfileId(myProf.id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-20 text-on-surface-variant">Investor not found</div>;
  }

  return (
    <div className="w-full max-w-[800px] mx-auto animate-in fade-in pb-12">
      <Link href="/discover" className="text-sm text-on-surface-variant hover:text-white mb-4 inline-flex items-center gap-1 transition-colors">
        <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
      </Link>

      <div className="glass-panel p-8 rounded-2xl border border-white/10 relative overflow-hidden mb-6">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-500/10 to-transparent" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-end">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-24 h-24 rounded-2xl object-cover border-4 border-surface-container" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-emerald-500/20 border-4 border-surface-container flex items-center justify-center text-4xl font-bold text-emerald-400 shadow-lg">
              {profile.name?.charAt(0)}
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
            <p className="text-sm text-emerald-400 uppercase font-bold tracking-wider">{investorData?.firm_name || 'Angel Investor'}</p>
            <p className="text-on-surface-variant mt-1">{profile.headline || 'No headline provided'}</p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={async () => {
                if (!myProfileId) return;
                const supabase = getSupabaseBrowserClient();
                const { data: existing } = await supabase.rpc('find_or_create_dm', {
                  p_user_a: myProfileId,
                  p_user_b: id,
                });
                if (existing) {
                  router.push(`/messages/${existing}`);
                } else {
                  const { data: conv } = await supabase
                    .from('conversations')
                    .insert({ created_by: myProfileId, type: 'direct' })
                    .select('id')
                    .single();
                  if (conv) {
                    await supabase.from('conversation_participants').insert([
                      { conversation_id: conv.id, user_id: myProfileId },
                      { conversation_id: conv.id, user_id: id },
                    ]);
                    router.push(`/messages/${conv.id}`);
                  }
                }
              }}
              className="px-4 py-2 bg-white/5 text-white rounded-xl text-sm font-semibold border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">chat</span> Message
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Criteria</h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-on-surface-variant block mb-1">Ticket Size</span>
                <span className="text-white font-bold">
                  {investorData?.check_size_min ? `$${(investorData.check_size_min/1000)}k` : 'Any'} - 
                  {investorData?.check_size_max ? `$${(investorData.check_size_max/1000)}k` : 'Any'}
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block mb-1">Portfolio</span>
                <span className="text-white font-bold">{investorData?.portfolio_count || 0} Startups</span>
              </div>
            </div>
          </div>
          
          {profile.location && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">Location</h3>
              <p className="text-on-surface flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">location_on</span>
                {profile.location}
              </p>
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Investment Thesis</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
              {investorData?.investment_thesis || profile.bio || "No investment thesis provided."}
            </p>
          </div>

          {investorData?.preferred_industries && investorData.preferred_industries.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Preferred Industries</h3>
              <div className="flex flex-wrap gap-2">
                {investorData.preferred_industries.map((ind: string) => (
                  <span key={ind} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-on-surface">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {investorData?.preferred_stages && investorData.preferred_stages.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Preferred Stages</h3>
              <div className="flex flex-wrap gap-2">
                {investorData.preferred_stages.map((stg: string) => (
                  <span key={stg} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-on-surface capitalize">
                    {stg.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex gap-4">
             {investorData?.website && (
                <a href={investorData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-emerald-400 hover:underline">
                  <span className="material-symbols-outlined text-[18px]">language</span> Firm Website
                </a>
             )}
             {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-emerald-400 hover:underline">
                  <span className="material-symbols-outlined text-[18px]">link</span> LinkedIn
                </a>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
