'use client';

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { usePathname } from 'next/navigation';

export function FeedbackWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'bug' | 'feature_request' | 'ux_issue' | 'general'>('bug');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status directly from Supabase (not auth store) to avoid hydration timing issues
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Don't show to unauthenticated users
  if (!isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    const supabase = getSupabaseBrowserClient();
    
    // Get the user directly at submit time for reliable auth.uid() matching
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user || authError) {
      console.error("[Feedback] Auth error — user not found:", authError);
      alert("You must be signed in to submit feedback. Please refresh and try again.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from('platform_feedback').insert({
      user_id: user.id,
      type,
      message,
      url: window.location.href,
    });

    setIsSubmitting(false);
    
    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setMessage('');
      }, 2000);
    } else {
      console.error("[Feedback] Submission failed:", error.message, error.details, error.hint);
      alert("Failed to submit feedback. Please try again.");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-surface border border-white/10 shadow-2xl rounded-2xl w-[320px] overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-white/5 p-4 flex items-center justify-between border-b border-white/5">
            <h3 className="font-bold text-white text-sm">Send Feedback</h3>
            <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          <div className="p-4">
            {success ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-2xl">check</span>
                </div>
                <h4 className="text-white font-bold mb-1">Feedback Sent!</h4>
                <p className="text-xs text-on-surface-variant">Thank you for helping us improve AlloySphere.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-on-surface-variant font-medium mb-1.5 block">What is this regarding?</label>
                  <select 
                    value={type} 
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full bg-surface-container-high border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="bug">Report a Bug</option>
                    <option value="feature_request">Feature Request</option>
                    <option value="ux_issue">UX / Design Issue</option>
                    <option value="general">General Feedback</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-on-surface-variant font-medium mb-1.5 block">Details</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what happened or what you'd like to see..."
                    required
                    className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-white/30 min-h-[100px] resize-none"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting || !message.trim()}
                  className="w-full py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 bg-blue-500 hover:bg-blue-400 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-110 active:scale-95"
          title="Send Feedback"
        >
          <span className="material-symbols-outlined text-[24px]">chat</span>
        </button>
      )}
    </div>
  );
}

