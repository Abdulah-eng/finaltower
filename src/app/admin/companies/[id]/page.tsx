'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';

export default function EditCompanyPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<any>({
    name: '',
    description: '',
    introduction: '',
    website: '',
    logo: '',
    content: []
  });

  useEffect(() => {
    if (params.id && params.id !== 'new') {
      fetchCompany();
    } else {
      setLoading(false);
    }
  }, [params.id]);

  const fetchCompany = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!error) {
      setCompany(data);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('companies')
      .upsert(company);

    if (error) {
      alert(error.message);
    } else {
      router.push('/admin');
    }
    setSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, file);

    if (uploadError) {
      alert(uploadError.message);
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);
      
      setCompany({ ...company, logo: publicUrl });
    }
  };

  const updateContent = (index: number, field: string, value: any) => {
    const newContent = [...company.content];
    newContent[index] = { ...newContent[index], [field]: value };
    setCompany({ ...company, content: newContent });
  };

  const addContentSection = () => {
    setCompany({
      ...company,
      content: [...company.content, { title: '', body: '', list: [] }]
    });
  };

  const removeContentSection = (index: number) => {
    const newContent = company.content.filter((_: any, i: number) => i !== index);
    setCompany({ ...company, content: newContent });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">
            {params.id === 'new' ? 'New Company' : 'Edit Profile'}
          </h1>
          <div className="h-1 w-12 bg-[#d4af37]"></div>
        </div>
        <div className="flex gap-4">
           <button 
            type="button"
            onClick={() => router.push('/admin')}
            className="px-6 py-3 border border-white/10 text-gray-400 font-bold uppercase tracking-widest text-[10px] rounded-full hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-[#d4af37] text-black font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-white transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <form className="space-y-8">
        {/* Identity Section */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 space-y-6">
          <h2 className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-bold">Identity & Branding</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Entity ID</label>
              <input 
                type="text" 
                value={company.id}
                onChange={(e) => setCompany({ ...company, id: e.target.value })}
                className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-white focus:outline-none focus:border-[#d4af37]/50"
                placeholder="Unique ID (e.g. arabian_group)"
                disabled={params.id !== 'new'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Company Name</label>
              <input 
                type="text" 
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-white focus:outline-none focus:border-[#d4af37]/50"
              />
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Corporate Logo</label>
             <div className="flex items-center gap-8">
               <div className="w-24 h-24 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center p-4">
                 {company.logo ? (
                   <img src={company.logo} alt="Preview" className="max-w-full max-h-full object-contain" />
                 ) : (
                   <span className="text-white/20 text-xs">NO LOGO</span>
                 )}
               </div>
               <div className="flex-1">
                 <input 
                   type="file" 
                   onChange={handleLogoUpload}
                   className="hidden" 
                   id="logo-upload"
                   accept="image/*"
                 />
                 <label 
                   htmlFor="logo-upload"
                   className="inline-block bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-xs font-bold tracking-widest cursor-pointer hover:bg-white hover:text-black transition-all"
                 >
                   Upload New Image
                 </label>
                 <p className="text-[9px] text-gray-600 mt-2 uppercase tracking-widest">Recommended: PNG with transparent background</p>
               </div>
             </div>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 space-y-6">
          <h2 className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-bold">Corporate Narrative</h2>
          
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Hero Description</label>
            <textarea 
              value={company.description}
              onChange={(e) => setCompany({ ...company, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-white focus:outline-none focus:border-[#d4af37]/50 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Introduction Statement</label>
            <textarea 
              value={company.introduction}
              onChange={(e) => setCompany({ ...company, introduction: e.target.value })}
              className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-white focus:outline-none focus:border-[#d4af37]/50 min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Official Website</label>
            <input 
              type="url" 
              value={company.website}
              onChange={(e) => setCompany({ ...company, website: e.target.value })}
              className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-white focus:outline-none focus:border-[#d4af37]/50"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-bold ml-8">Information Architecture</h2>
            <button 
              type="button"
              onClick={addContentSection}
              className="text-[9px] uppercase tracking-widest font-bold text-[#d4af37] border border-[#d4af37]/30 px-4 py-2 rounded-full hover:bg-[#d4af37] hover:text-black transition-all"
            >
              + Add Section
            </button>
          </div>

          {company.content?.map((section: any, index: number) => (
            <div key={index} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 relative group">
              <button 
                type="button"
                onClick={() => removeContentSection(index)}
                className="absolute top-4 right-4 text-red-500/50 hover:text-red-500 text-xs py-1 px-2 uppercase tracking-tighter"
              >
                Delete Section
              </button>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Section Title</label>
                  <input 
                    type="text" 
                    value={section.title}
                    onChange={(e) => updateContent(index, 'title', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-white focus:outline-none focus:border-[#d4af37]/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Section Body</label>
                  <textarea 
                    value={section.body}
                    onChange={(e) => updateContent(index, 'body', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-white focus:outline-none focus:border-[#d4af37]/50 min-h-[100px]"
                  />
                </div>
                {/* List Items Editor (Simplified) */}
                <div className="space-y-2">
                   <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">List Items (One per line)</label>
                   <textarea 
                    value={section.list?.join('\n')}
                    onChange={(e) => updateContent(index, 'list', e.target.value.split('\n'))}
                    className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-white focus:outline-none focus:border-[#d4af37]/50 min-h-[100px]"
                   />
                </div>
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
