'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      if (!user && pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user && pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#d4af37] selection:text-black">
      {user && pathname !== '/admin/login' && (
        <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-[#d4af37] font-serif font-bold tracking-widest text-lg uppercase">Tower Admin</h1>
            <div className="h-4 w-px bg-white/10 mx-2"></div>
            <button 
              onClick={() => router.push('/admin')}
              className={`text-xs uppercase tracking-widest transition-colors ${pathname === '/admin' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Dashboard
            </button>
            <div className="h-4 w-px bg-white/10 mx-2"></div>
            <button 
              onClick={() => router.push('/admin/settings')}
              className={`text-xs uppercase tracking-widest transition-colors ${pathname === '/admin/settings' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Global Settings
            </button>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-[10px] uppercase tracking-widest text-red-500/70 hover:text-red-500 transition-colors border border-red-500/20 px-4 py-2 rounded-full hover:bg-red-500/5"
          >
            Logout
          </button>
        </nav>
      )}
      <main className={user && pathname !== '/admin/login' ? "pt-24" : ""}>
        {children}
      </main>
    </div>
  );
}
