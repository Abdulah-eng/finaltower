'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface SiteSettings {
  id: string;
  header_title: string;
  header_logo: string;
  footer_text: string;
  model_path: string;
  env_map_path: string;
}

const defaultSettings: SiteSettings = {
  id: 'main',
  header_title: 'Corporate Interactive Experience',
  header_logo: '/logos/Arabian Holding Group - Iraq.png',
  footer_text: '© 2024 Tower of Companies',
  model_path: '/models/colleseum_final.glb',
  env_map_path: '/potsdamer_platz_1k.hdr',
};

const SettingsContext = createContext<{ settings: SiteSettings; loading: boolean }>({
  settings: defaultSettings,
  loading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'main')
        .single();
      
      if (!error && data) {
        setSettings(data);
      } else {
        console.error("Failed to fetch settings, using defaults");
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
