-- 1. Create the companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    introduction TEXT,
    full_description TEXT,
    logo TEXT, -- This will hold the storage path or URL
    mesh_names TEXT[] DEFAULT '{}',
    beacon_position FLOAT8[] DEFAULT '{0,0,0}',
    door_model TEXT,
    website TEXT,
    content JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Allow anyone to read companies
CREATE POLICY "Allow public read-only access"
ON public.companies FOR SELECT
USING (true);

-- Allow authenticated users (admin) full access
CREATE POLICY "Allow admin full access"
ON public.companies FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 4. Set up Storage for Logos
-- Create a bucket for company logos if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to logos
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

-- Allow authenticated users to upload/manage logos
CREATE POLICY "Admin CRUD Access"
ON storage.objects FOR ALL
USING (bucket_id = 'logos' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- 5. Helper function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Create the site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY,
    header_title TEXT,
    header_logo TEXT,
    footer_text TEXT,
    model_path TEXT,
    env_map_path TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Insert default initial settings
INSERT INTO public.site_settings (id, header_title, header_logo, footer_text, model_path, env_map_path) 
VALUES (
    'main', 
    'Corporate Interactive Experience', 
    '/logos/Arabian Holding Group - Iraq.png', 
    '© 2024 Tower of Companies', 
    '/models/colleseum_final.glb', 
    '/potsdamer_platz_1k.hdr'
) ON CONFLICT (id) DO NOTHING;

-- 8. Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 9. Create Policies for Settings
CREATE POLICY "Allow public read access"
ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Allow admin full access"
ON public.site_settings FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 10. Create bucket for 3D assets and HDR maps
INSERT INTO storage.buckets (id, name, public, file_size_limit) 
VALUES ('assets', 'assets', true, 52428800) -- Allow up to 50MB for models
ON CONFLICT (id) DO NOTHING;

-- 11. Asset bucket policies
CREATE POLICY "Public Read Access Assets"
ON storage.objects FOR SELECT USING (bucket_id = 'assets');

CREATE POLICY "Admin CRUD Access Assets"
ON storage.objects FOR ALL
USING (bucket_id = 'assets' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
