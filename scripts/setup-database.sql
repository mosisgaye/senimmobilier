-- Setup Database Schema for SenImmobilier
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('agency', 'owner')),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone_e164 VARCHAR(50),
  whatsapp_number VARCHAR(50),
  logo_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,

  -- Basic info
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  description_html TEXT,
  excerpt TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'sold')),
  intent VARCHAR(50) DEFAULT 'sale' CHECK (intent IN ('sale', 'rent')),
  verified BOOLEAN DEFAULT false,

  -- Pricing
  price_fcfa BIGINT NOT NULL,

  -- Location
  city VARCHAR(100) NOT NULL,
  neighborhood VARCHAR(100),
  address TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  geom JSONB,

  -- Property details
  category VARCHAR(100) NOT NULL,
  area_sqm INTEGER NOT NULL,
  legal_status VARCHAR(100),

  -- Features
  features JSONB DEFAULT '[]'::jsonb,
  proximity JSONB DEFAULT '{}'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,

  -- Media
  cover_image_url TEXT,

  -- Stats
  views_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Create media table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type VARCHAR(50) CHECK (type IN ('image', 'video', 'document')),
  is_cover BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  title VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  visit_date TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'visited', 'converted', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage buckets (run in Supabase dashboard)
-- 1. Go to Storage section
-- 2. Create these buckets:
--    - listing-images (public)
--    - listing-docs (private)
--    - avatars (public)

-- Enable Row Level Security
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sellers
CREATE POLICY "Sellers are viewable by everyone"
  ON sellers FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage sellers"
  ON sellers FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for listings
CREATE POLICY "Published listings are viewable by everyone"
  ON listings FOR SELECT
  USING (status = 'published' OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage listings"
  ON listings FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for media
CREATE POLICY "Media are viewable by everyone"
  ON media FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage media"
  ON media FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for leads
CREATE POLICY "Service role can manage leads"
  ON leads FOR ALL
  USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price_fcfa);
CREATE INDEX IF NOT EXISTS idx_listings_slug ON listings(slug);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_media_listing ON media(listing_id);
CREATE INDEX IF NOT EXISTS idx_leads_property ON leads(property_id);

-- Insert sample data (optional)
-- Insert a sample seller
INSERT INTO sellers (id, type, name, email, phone_e164, verified)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'agency', 'Agence Immobiliere Dakar', 'contact@agence-dakar.sn', '+221771234567', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample listings
INSERT INTO listings (
  id, seller_id, title, slug, description, excerpt,
  status, intent, price_fcfa, city, neighborhood,
  category, area_sqm, legal_status, verified
)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Terrain Titre 500m2 Almadies Vue Mer',
    'terrain-titre-500m-almadies-vue-mer',
    'Magnifique terrain titre de 500m2 situe aux Almadies avec une vue imprenable sur la mer.',
    'Terrain titre 500m2 aux Almadies avec vue mer',
    'published',
    'sale',
    75000000,
    'Dakar',
    'Almadies',
    'residentiel',
    500,
    'titre_foncier',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Database schema created successfully!' as message;
