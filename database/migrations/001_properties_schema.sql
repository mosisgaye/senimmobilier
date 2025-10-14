-- =====================================================
-- MIGRATION: Schéma optimisé pour vente de terrains
-- Date: 2025-10-11
-- Description: Table properties complète pour Fatimmo
-- =====================================================

-- 1. Supprimer la table existante si nécessaire (ATTENTION: perte de données!)
-- DROP TABLE IF EXISTS properties CASCADE;

-- 2. Créer ou modifier la table properties
CREATE TABLE IF NOT EXISTS properties (
  -- Identifiants
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Informations de base
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL, -- URL-friendly: terrain-750m2-almadies-dakar
  description TEXT NOT NULL,
  property_type VARCHAR(50) NOT NULL, -- 'land', 'house', 'apartment', 'villa', 'office'
  transaction_type VARCHAR(20) NOT NULL, -- 'sale', 'rent'
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'sold', 'suspended', 'expired'

  -- Prix et paiement
  price DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'FCFA',
  price_negotiable BOOLEAN DEFAULT true,
  payment_plans JSONB DEFAULT '[]', -- Ex: [{"name": "3 mois", "deposit": 30, "installments": 3}]
  discount_percentage INTEGER DEFAULT 0,
  original_price DECIMAL(15, 2), -- Prix avant remise

  -- Localisation
  country VARCHAR(100) DEFAULT 'Sénégal',
  region VARCHAR(100), -- Ex: Dakar, Thiès
  city VARCHAR(100) NOT NULL, -- Ex: Dakar, Saly, Mbour
  district VARCHAR(100), -- Ex: Almadies, Plateau, Ouakam
  address TEXT,
  latitude DECIMAL(10, 8), -- GPS
  longitude DECIMAL(11, 8), -- GPS
  distance_to_main_road INTEGER, -- En mètres
  nearby_amenities JSONB DEFAULT '[]', -- ['École', 'Mosquée', 'Supermarché']

  -- Caractéristiques terrain (spécifique terrains)
  surface_area DECIMAL(10, 2) NOT NULL, -- En m²
  surface_unit VARCHAR(10) DEFAULT 'm²',
  frontage DECIMAL(10, 2), -- Façade en mètres
  depth DECIMAL(10, 2), -- Profondeur en mètres
  shape VARCHAR(50), -- 'rectangular', 'irregular', 'square'
  slope VARCHAR(50), -- 'flat', 'gentle', 'steep'
  soil_type VARCHAR(100), -- 'sandy', 'clay', 'laterite'
  zoning VARCHAR(100), -- 'residential', 'commercial', 'mixed', 'industrial'

  -- Caractéristiques bâtiments (pour maisons/villas)
  bedrooms INTEGER,
  bathrooms INTEGER,
  living_rooms INTEGER,
  kitchens INTEGER,
  garages INTEGER,
  floors INTEGER,
  year_built INTEGER,

  -- État et viabilisation
  is_titled BOOLEAN DEFAULT false, -- Terrain titré (TF)
  title_deed_number VARCHAR(100), -- Numéro TF
  is_bounded BOOLEAN DEFAULT false, -- Borné
  is_serviced BOOLEAN DEFAULT false, -- Viabilisé
  has_water BOOLEAN DEFAULT false,
  has_electricity BOOLEAN DEFAULT false,
  has_sewage BOOLEAN DEFAULT false,
  has_paved_road BOOLEAN DEFAULT false,
  access_road VARCHAR(100), -- 'paved', 'unpaved', 'track'

  -- Références cadastrales
  cadastral_reference VARCHAR(100),
  plot_number VARCHAR(100), -- Numéro parcelle
  section VARCHAR(50),
  block VARCHAR(50),
  lot_number VARCHAR(50),

  -- Médias
  images JSONB DEFAULT '[]', -- URLs des images
  primary_image VARCHAR(500), -- Image principale
  video_url VARCHAR(500), -- Vidéo drone
  virtual_tour_url VARCHAR(500), -- Visite 360°
  floor_plans JSONB DEFAULT '[]', -- Plans
  documents JSONB DEFAULT '[]', -- [{name: 'TF', url: '...', type: 'pdf'}]

  -- Disponibilité
  is_available BOOLEAN DEFAULT true,
  available_from DATE,
  is_exclusive BOOLEAN DEFAULT false, -- Exclusivité agence

  -- Marketing et visibilité
  featured BOOLEAN DEFAULT false, -- En vedette
  featured_until TIMESTAMP,
  promoted BOOLEAN DEFAULT false,
  promoted_until TIMESTAMP,
  priority INTEGER DEFAULT 0, -- Ordre d'affichage (plus élevé = plus visible)

  -- SEO
  seo_title VARCHAR(300),
  seo_description TEXT,
  seo_keywords JSONB DEFAULT '[]', -- ['terrain dakar', 'parcelle almadies']
  meta_tags JSONB DEFAULT '{}',

  -- Analytics
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP,

  -- Contact
  show_owner_info BOOLEAN DEFAULT false,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  contact_whatsapp VARCHAR(20),

  -- Propriétaire/Agent
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  agency_commission DECIMAL(5, 2), -- Pourcentage commission

  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  sold_at TIMESTAMP,
  deleted_at TIMESTAMP, -- Soft delete

  -- Vérification admin
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP,

  -- Métadonnées additionnelles
  metadata JSONB DEFAULT '{}', -- Champs personnalisés futurs

  -- Contraintes
  CONSTRAINT valid_price CHECK (price >= 0),
  CONSTRAINT valid_surface CHECK (surface_area > 0),
  CONSTRAINT valid_discount CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('sale', 'rent')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'sold', 'suspended', 'expired'))
);

-- 3. Index pour performance et SEO
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_transaction_type ON properties(transaction_type);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_surface_area ON properties(surface_area);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_properties_is_available ON properties(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(city, district);

-- Index composé pour recherche populaire
CREATE INDEX IF NOT EXISTS idx_properties_search ON properties(
  transaction_type,
  property_type,
  city,
  status
) WHERE is_available = true AND deleted_at IS NULL;

-- Index géospatial pour recherche par proximité (si PostGIS disponible)
-- CREATE INDEX idx_properties_geolocation ON properties USING GIST (ST_MakePoint(longitude, latitude));

-- Full-text search (recherche textuelle)
CREATE INDEX IF NOT EXISTS idx_properties_fulltext ON properties
USING GIN (to_tsvector('french', title || ' ' || description));

-- 4. Trigger pour mise à jour automatique updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Trigger pour générer slug automatiquement si non fourni
CREATE OR REPLACE FUNCTION generate_property_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Créer slug depuis titre + ville
    base_slug := lower(
      regexp_replace(
        unaccent(NEW.title || '-' || NEW.city),
        '[^a-z0-9]+', '-', 'g'
      )
    );
    base_slug := trim(both '-' from base_slug);

    -- Vérifier unicité et ajouter numéro si nécessaire
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM properties WHERE slug = final_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := final_slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_property_slug_trigger ON properties;
CREATE TRIGGER generate_property_slug_trigger
  BEFORE INSERT OR UPDATE OF title, city ON properties
  FOR EACH ROW
  EXECUTE FUNCTION generate_property_slug();

-- 6. Fonction pour incrémenter les vues
CREATE OR REPLACE FUNCTION increment_property_views(property_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE properties
  SET
    views_count = views_count + 1,
    last_viewed_at = NOW()
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Commentaires sur les colonnes importantes
COMMENT ON TABLE properties IS 'Table principale des propriétés/terrains à vendre ou louer';
COMMENT ON COLUMN properties.slug IS 'URL-friendly identifier pour SEO';
COMMENT ON COLUMN properties.is_titled IS 'Terrain avec Titre Foncier (TF)';
COMMENT ON COLUMN properties.is_bounded IS 'Terrain avec bornage officiel';
COMMENT ON COLUMN properties.is_serviced IS 'Viabilisé (eau, électricité, assainissement)';
COMMENT ON COLUMN properties.zoning IS 'Type de zonage urbain autorisé';
COMMENT ON COLUMN properties.payment_plans IS 'Plans de paiement disponibles (JSON)';
COMMENT ON COLUMN properties.nearby_amenities IS 'Commodités à proximité (JSON array)';

-- 8. Données par défaut pour testing (optionnel - à commenter en production)
-- INSERT INTO properties (user_id, title, description, property_type, transaction_type, price, city, surface_area, is_titled, slug)
-- VALUES
-- ((SELECT id FROM users LIMIT 1), 'Terrain 750m² Almadies', 'Magnifique terrain viabilisé...', 'land', 'sale', 45000000, 'Dakar', 750, true, 'terrain-750m2-almadies-dakar');
