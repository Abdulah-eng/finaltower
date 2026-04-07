'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decorative Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#0a0a0a] border border-[#d4af37]/20 rounded-2xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-serif font-bold text-white mb-2 tracking-tight">Admin Portal</h1>
            <div className="h-1 w-12 bg-[#d4af37] mx-auto mb-6"></div>
            <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">Tower of Companies</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#d4af37] mb-2 font-bold ml-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl focus:outline-none focus:border-[#d4af37]/50 text-white transition-all duration-300"
                placeholder="admin@tower.com"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#d4af37] mb-2 font-bold ml-1">Secret Key</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl focus:outline-none focus:border-[#d4af37]/50 text-white transition-all duration-300"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl flex items-center gap-3">
                <span className="text-lg">⚠</span> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#d4af37] text-black font-bold uppercase tracking-[0.2em] text-xs py-4 rounded-xl hover:bg-white hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? 'Authenticating...' : 'Enter Dashboard'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-700 tracking-[0.1em] font-light leading-relaxed">
              Proprietary System. Unauthorized access will be flagged and reported.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
