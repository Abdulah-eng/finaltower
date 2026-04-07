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
