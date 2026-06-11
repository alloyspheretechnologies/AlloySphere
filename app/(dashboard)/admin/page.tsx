import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Verify Admin Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch Metrics
  const [{ count: usersCount }, { count: startupsCount }, { count: investorsCount }, { count: talentCount }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('startups').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'investor'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'talent'),
  ]);

  // Fetch Waitlist
  const { data: waitlist } = await supabase
    .from('beta_waitlist')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch Feedback
  const { data: feedback } = await supabase
    .from('platform_feedback')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Operations</h1>
        <p className="text-on-surface-variant">Manage the Closed Beta lifecycle.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: usersCount || 0, icon: 'group' },
          { label: 'Startups', value: startupsCount || 0, icon: 'rocket_launch' },
          { label: 'Investors', value: investorsCount || 0, icon: 'account_balance' },
          { label: 'Talent', value: talentCount || 0, icon: 'psychology' },
        ].map((metric) => (
          <div key={metric.label} className="bg-surface border border-white/5 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-on-surface-variant mb-1">{metric.label}</p>
              <h2 className="text-3xl font-bold text-white">{metric.value}</h2>
            </div>
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/50">
              <span className="material-symbols-outlined text-2xl">{metric.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Beta Waitlist */}
      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">Beta Waitlist</h2>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-sm text-on-surface-variant">
            <thead className="bg-white/5 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {waitlist?.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center">No pending applications.</td></tr>
              ) : (
                waitlist?.map((req: any) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{req.email}</td>
                    <td className="px-6 py-4 capitalize">{req.role}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'pending' && (
                        <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Approve</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Platform Feedback */}
      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">Platform Feedback</h2>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-sm text-on-surface-variant">
            <thead className="bg-white/5 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {feedback?.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center">No feedback yet.</td></tr>
              ) : (
                feedback?.map((fb: any) => (
                  <tr key={fb.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 capitalize font-medium text-white">{fb.type.replace('_', ' ')}</td>
                    <td className="px-6 py-4 max-w-md truncate">{fb.message}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/70">
                        {fb.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
