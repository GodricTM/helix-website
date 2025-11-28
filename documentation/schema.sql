-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Contact Info & Global Settings
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  hours TEXT,
  offer TEXT,
  
  -- Helix Branding & Text
  "helixTitle" TEXT,
  "helixTitleHighlight" TEXT,
  "helixSubtitle" TEXT,
  "helixSubtitleHighlight" TEXT,
  "helixTagline" TEXT,
  "helixDescription" TEXT,
  "helixVideoUrl" TEXT,
  "aboutText" TEXT,
  
  -- Social Media
  "socialInstagram" TEXT,
  "socialFacebook" TEXT,
  "socialWhatsapp" TEXT,
  
  -- Structured Data
  "openingHoursSpec" JSONB,
  "sectionOrder" TEXT[],
  
  -- Images
  "cerakoteBeforeUrl" TEXT,
  "cerakoteAfterUrl" TEXT,
  "logoUrl" TEXT,
  
  -- Settings
  "showReviews" BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'midnight',
  "layoutStyle" TEXT DEFAULT 'default',
  "promotionEnabled" BOOLEAN DEFAULT false,
  "promotionText" TEXT,
  
  -- Cerakote Stock (Key: Color Code, Value: Boolean)
  cerakote_stock JSONB DEFAULT '{}'::jsonb,
  
  -- Video Settings
  show_extra_videos BOOLEAN DEFAULT true,
  
  -- Text Effects
  "helixTitleEffect" TEXT DEFAULT 'none',
  "helixTextEffect" TEXT DEFAULT 'none'
);

-- Insert default row if not exists (Application expects one row)
INSERT INTO contact_info (id) SELECT uuid_generate_v4() WHERE NOT EXISTS (SELECT 1 FROM contact_info);


-- 2. Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  "serviceDetails" TEXT,
  image TEXT,
  description TEXT,
  "completedDate" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Services
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  "isSpecialty" BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Messages (Contact Form)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread', -- 'unread', 'read'
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. User Roles (RBAC)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'editor')),
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Cerakote Products
CREATE TABLE IF NOT EXISTS cerakote_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================
-- Row Level Security (RLS) Policies
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cerakote_products ENABLE ROW LEVEL SECURITY;

-- Helper Function for RBAC
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public Read Access (Website Visitors)
CREATE POLICY "Public Read Contact Info" ON contact_info FOR SELECT USING (true);
CREATE POLICY "Public Read Projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public Read Services" ON services FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public Read Cerakote Products" ON cerakote_products FOR SELECT USING (true);

-- Authenticated/Admin Access (Simplified for brevity, ideally granular based on permissions)
-- Note: In a real deployment, you would check specific permissions (e.g., manage_content)

-- Contact Info: Editors+ can update
CREATE POLICY "Staff Update Contact Info" ON contact_info FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM user_roles));

-- Projects: Editors+ can manage
CREATE POLICY "Staff Manage Projects" ON projects FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles));

-- Services: Editors+ can manage
CREATE POLICY "Staff Manage Services" ON services FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles));

-- Reviews: Editors+ can manage
CREATE POLICY "Staff Manage Reviews" ON reviews FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles));

-- Cerakote Products: Editors+ can manage
CREATE POLICY "Staff Manage Cerakote Products" ON cerakote_products FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles));

-- Messages: Only authenticated staff can view/manage
CREATE POLICY "Staff Manage Messages" ON messages FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles));

-- User Roles: Only Super Admin can manage
CREATE POLICY "Super Admin Manage Roles" ON user_roles FOR ALL USING (is_super_admin());
CREATE POLICY "Users View Own Role" ON user_roles FOR SELECT USING (auth.uid() = user_id);
