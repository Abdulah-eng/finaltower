'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    if (!error) {
      setCompanies(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">Portfolio Manager</h1>
          <div className="h-1 w-12 bg-[#d4af37] mb-6"></div>
          <p className="text-gray-500 text-xs uppercase tracking-widest">Select a company to modify its content or logo</p>
        </div>
        <button 
          onClick={() => router.push('/admin/companies/new')}
          className="bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-[#d4af37] hover:text-black transition-all duration-300"
        >
          + Add New Company
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div 
            key={company.id}
            onClick={() => router.push(`/admin/companies/${company.id}`)}
            className="group relative bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5 transition-all duration-500 cursor-pointer overflow-hidden shadow-2xl"
          >
            {/* Hover Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] transition-transform duration-1000 group-hover:translate-x-[100%]"></div>
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-500 border border-white/5 bg-black/50">
                {company.logo ? (
                  <img 
                    src={company.logo} 
                    alt={company.name} 
                    className="w-full h-full object-contain filter brightness-110 group-hover:brightness-125"
                  />
                ) : (
                  <div className="text-[#d4af37] text-2xl font-serif">?</div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="text-white font-medium text-lg leading-tight group-hover:text-[#d4af37] transition-colors duration-300 truncate">
                  {company.name}
                </h3>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-1 truncate italic">
                  {company.description}
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                <span className="text-[#d4af37] text-xl">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {companies.length === 0 && (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl">
          <p className="text-gray-500 italic font-light">No companies found. Run the migration script or add one manually.</p>
        </div>
      )}
    </div>
  );
}
