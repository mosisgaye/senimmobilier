-- ================================================
-- Migration: Création de la table leads
-- Description: Table pour stocker les contacts/leads depuis les annonces
-- Date: 2025-10-12
-- ================================================

-- Créer la table leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Informations du contact
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  wants_visit BOOLEAN DEFAULT false,

  -- Source du lead
  source VARCHAR(50) DEFAULT 'form', -- 'form', 'whatsapp', 'phone', 'email'

  -- Statut
  status VARCHAR(20) DEFAULT 'new', -- 'new', 'contacted', 'converted', 'closed'

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Index
  CONSTRAINT leads_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_leads_listing_id ON leads(listing_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- Permissions
GRANT SELECT, INSERT ON leads TO authenticated;
GRANT SELECT ON leads TO anon; -- Pour que l'API puisse créer des leads

-- RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut créer un lead
CREATE POLICY "Anyone can create leads" ON leads
  FOR INSERT
  WITH CHECK (true);

-- Policy: Les vendeurs peuvent voir leurs propres leads
CREATE POLICY "Sellers can view their leads" ON leads
  FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM listings WHERE seller_id = auth.uid()
    )
  );

-- Policy: Les admins peuvent tout voir
CREATE POLICY "Admins can view all leads" ON leads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Commentaires
COMMENT ON TABLE leads IS 'Stocke les demandes de contact depuis les annonces';
COMMENT ON COLUMN leads.listing_id IS 'Référence vers l''annonce concernée';
COMMENT ON COLUMN leads.wants_visit IS 'Le contact souhaite planifier une visite';
COMMENT ON COLUMN leads.source IS 'Canal d''origine du lead: form, whatsapp, phone, email';
COMMENT ON COLUMN leads.status IS 'Statut du lead: new, contacted, converted, closed';
