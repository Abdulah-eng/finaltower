'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function GlobalSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    id: 'main',
    header_title: '',
    header_logo: '',
    footer_text: '',
    model_path: '',
    env_map_path: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'main')
      .single();

    if (!error && data) {
      setSettings(data);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('site_settings')
      .upsert(settings);

    if (error) {
      alert(error.message);
    } else {
      alert('Settings saved successfully. Refresh the main page to see changes.');
    }
    setSaving(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bucket: string, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use specific name for the file or unique name?
    // Using a timestamped name so the browser cache doesn't ignore it
    const fileExt = file.name.split('.').pop();
    const fileName = `${field}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      alert(`Upload failed: ${uploadError.message}`);
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      setSettings({ ...settings, [field]: publicUrl });
    }
  };

  if (loading) return <div>Loading Settings...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">
            Global Settings
          </h1>
          <div className="h-1 w-12 bg-[#d4af37]"></div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-[#d4af37] text-black font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-white transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <form className="space-y-8">
        {/* Header Settings */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 space-y-6">
          <h2 className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-bold">Header Configuration</h2>
          
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Header Title Text</label>
            <input 
              type="text" 
              value={settings.header_title || ''}
              onChange={(e) => setSettings({ ...settings, header_title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-white focus:outline-none focus:border-[#d4af37]/50"
              placeholder="e.g. Corporate Interactive Experience"
            />
          </div>

          <div className="space-y-4">
             <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Header Logo Target</label>
             <div className="flex items-center gap-8">
               <div className="w-24 h-24 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center p-4">
                 {settings.header_logo ? (
                   <img src={settings.header_logo} alt="Header Logo" className="max-w-full max-h-full object-contain" />
                 ) : (
                   <span className="text-white/20 text-xs text-center">NO LOGO</span>
                 )}
               </div>
               <div className="flex-1">
                 <input 
                   type="text" 
                   value={settings.header_logo || ''}
                   onChange={(e) => setSettings({ ...settings, header_logo: e.target.value })}
                   className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-white focus:outline-none focus:border-[#d4af37]/50 mb-3"
                   placeholder="Enter image URL or upload new"
                 />
                 <input 
                   type="file" 
                   onChange={(e) => handleFileUpload(e, 'logos', 'header_logo')}
                   className="hidden" 
                   id="header-logo-upload"
                   accept="image/*"
                 />
                 <label 
                   htmlFor="header-logo-upload"
                   className="inline-block bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-xs font-bold tracking-widest cursor-pointer hover:bg-white hover:text-black transition-all"
                 >
                   Upload New Image
                 </label>
               </div>
             </div>
          </div>
        </div>

        {/* Footer Settings */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 space-y-6">
          <h2 className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-bold">Footer Configuration</h2>
          
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Footer Copyright Text</label>
            <input 
              type="text" 
              value={settings.footer_text || ''}
              onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
              className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-white focus:outline-none focus:border-[#d4af37]/50"
              placeholder="e.g. © 2024 Tower of Companies"
            />
          </div>
        </div>

        {/* 3D Assets Settings */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 space-y-6">
          <h2 className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-bold">3D Source Files</h2>
          
          <div className="space-y-4">
             <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Tower 3D Model (.glb / .gltf)</label>
             <div className="flex-1">
               <input 
                 type="text" 
                 value={settings.model_path || ''}
                 onChange={(e) => setSettings({ ...settings, model_path: e.target.value })}
                 className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-white focus:outline-none focus:border-[#d4af37]/50 mb-3"
                 placeholder="Enter full URL or local path (e.g. /models/colleseum_final.glb)"
               />
               <input 
                 type="file" 
                 onChange={(e) => handleFileUpload(e, 'assets', 'model_path')}
                 className="hidden" 
                 id="model-upload"
                 accept=".glb,.gltf"
               />
               <label 
                 htmlFor="model-upload"
                 className="inline-block bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-xs font-bold tracking-widest cursor-pointer hover:bg-white hover:text-black transition-all"
               >
                 Upload New 3D Model (GLB)
               </label>
             </div>
          </div>

          <div className="space-y-4 mt-6">
             <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Environment Map (.hdr)</label>
             <div className="flex-1">
               <input 
                 type="text" 
                 value={settings.env_map_path || ''}
                 onChange={(e) => setSettings({ ...settings, env_map_path: e.target.value })}
                 className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-white focus:outline-none focus:border-[#d4af37]/50 mb-3"
                 placeholder="Enter full URL or local path (e.g. /potsdamer_platz_1k.hdr)"
               />
               <input 
                 type="file" 
                 onChange={(e) => handleFileUpload(e, 'assets', 'env_map_path')}
                 className="hidden" 
                 id="hdr-upload"
                 accept=".hdr"
               />
               <label 
                 htmlFor="hdr-upload"
                 className="inline-block bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-xs font-bold tracking-widest cursor-pointer hover:bg-white hover:text-black transition-all"
               >
                 Upload New HDR Map
               </label>
             </div>
          </div>

        </div>

      </form>
    </div>
  );
}
