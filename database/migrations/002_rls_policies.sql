-- =====================================================
-- MIGRATION: Row Level Security (RLS) Policies
-- Date: 2025-10-11
-- Description: Politiques de sécurité pour table properties
-- =====================================================

-- 1. Activer RLS sur la table properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Public properties are viewable by everyone" ON properties;
DROP POLICY IF EXISTS "Users can view their own properties" ON properties;
DROP POLICY IF EXISTS "Users can insert their own properties" ON properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete their own properties" ON properties;
DROP POLICY IF EXISTS "Admins can do everything" ON properties;

-- =====================================================
-- POLICIES POUR LECTURE (SELECT)
-- =====================================================

-- Policy 1: Tout le monde peut voir les propriétés actives et disponibles
CREATE POLICY "Anyone can view active properties"
ON properties FOR SELECT
USING (
  status = 'active'
  AND is_available = true
  AND deleted_at IS NULL
);

-- Policy 2: Les utilisateurs peuvent voir leurs propres propriétés (tous statuts)
CREATE POLICY "Users can view own properties"
ON properties FOR SELECT
USING (auth.uid() = user_id);

-- Policy 3: Les admins peuvent tout voir
CREATE POLICY "Admins can view all properties"
ON properties FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND account_type = 'admin'
  )
);

-- =====================================================
-- POLICIES POUR INSERTION (INSERT)
-- =====================================================

-- Policy 4: Les utilisateurs authentifiés peuvent créer des propriétés
CREATE POLICY "Authenticated users can create properties"
ON properties FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND is_active = true
    AND can_publish_ads = true
  )
);

-- Policy 5: Vérifier le quota mensuel
CREATE POLICY "Check monthly quota on insert"
ON properties FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- Admin n'a pas de limite
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND account_type = 'admin'
    )
    OR
    -- Vérifier que l'utilisateur n'a pas atteint son quota mensuel
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND current_month_ads < monthly_ad_limit
    )
  )
);

-- =====================================================
-- POLICIES POUR MISE À JOUR (UPDATE)
-- =====================================================

-- Policy 6: Les utilisateurs peuvent mettre à jour leurs propres propriétés
CREATE POLICY "Users can update own properties"
ON properties FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 7: Les admins peuvent tout mettre à jour
CREATE POLICY "Admins can update all properties"
ON properties FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND account_type = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND account_type = 'admin'
  )
);

-- =====================================================
-- POLICIES POUR SUPPRESSION (DELETE)
-- =====================================================

-- Policy 8: Les utilisateurs peuvent supprimer leurs propres propriétés
CREATE POLICY "Users can delete own properties"
ON properties FOR DELETE
USING (auth.uid() = user_id);

-- Policy 9: Les admins peuvent tout supprimer
CREATE POLICY "Admins can delete all properties"
ON properties FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND account_type = 'admin'
  )
);

-- =====================================================
-- FONCTION HELPER: Incrémenter le compteur d'annonces
-- =====================================================

CREATE OR REPLACE FUNCTION increment_user_ads_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrémenter le compteur du mois en cours et total
  UPDATE users
  SET
    current_month_ads = current_month_ads + 1,
    total_ads_posted = total_ads_posted + 1,
    active_properties_count = active_properties_count + 1
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour incrémenter après insertion
DROP TRIGGER IF EXISTS increment_ads_count_trigger ON properties;
CREATE TRIGGER increment_ads_count_trigger
  AFTER INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION increment_user_ads_count();

-- =====================================================
-- FONCTION: Décrémenter lors de suppression
-- =====================================================

CREATE OR REPLACE FUNCTION decrement_user_ads_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Décrémenter le compteur d'annonces actives
  UPDATE users
  SET active_properties_count = GREATEST(0, active_properties_count - 1)
  WHERE id = OLD.user_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour décrémenter après suppression
DROP TRIGGER IF EXISTS decrement_ads_count_trigger ON properties;
CREATE TRIGGER decrement_ads_count_trigger
  AFTER DELETE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION decrement_user_ads_count();

-- =====================================================
-- FONCTION: Reset compteur mensuel (à exécuter chaque mois)
-- =====================================================

CREATE OR REPLACE FUNCTION reset_monthly_ads_count()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET current_month_ads = 0
  WHERE current_month_ads > 0;

  RAISE NOTICE 'Compteurs mensuels réinitialisés pour tous les utilisateurs';
END;
$$ LANGUAGE plpgsql;

-- Pour exécuter manuellement: SELECT reset_monthly_ads_count();
-- Ou créer une cron job dans Supabase Dashboard

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue: Propriétés actives avec infos utilisateur
CREATE OR REPLACE VIEW v_active_properties AS
SELECT
  p.*,
  u.email as owner_email,
  u.first_name as owner_first_name,
  u.last_name as owner_last_name,
  u.phone as owner_phone,
  u.account_type as owner_account_type
FROM properties p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'active'
  AND p.is_available = true
  AND p.deleted_at IS NULL;

-- Vue: Statistiques par utilisateur
CREATE OR REPLACE VIEW v_user_properties_stats AS
SELECT
  u.id as user_id,
  u.email,
  u.first_name,
  u.last_name,
  COUNT(p.id) as total_properties,
  COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_properties,
  COUNT(CASE WHEN p.status = 'sold' THEN 1 END) as sold_properties,
  SUM(p.views_count) as total_views,
  SUM(p.inquiries_count) as total_inquiries,
  MAX(p.created_at) as last_property_date
FROM users u
LEFT JOIN properties p ON u.id = p.user_id AND p.deleted_at IS NULL
GROUP BY u.id, u.email, u.first_name, u.last_name;

-- =====================================================
-- GRANTS: Permissions pour authenticated users
-- =====================================================

-- Permettre aux utilisateurs authentifiés d'accéder aux vues
GRANT SELECT ON v_active_properties TO authenticated;
GRANT SELECT ON v_user_properties_stats TO authenticated;

-- Permettre l'exécution de la fonction d'incrémentation des vues
GRANT EXECUTE ON FUNCTION increment_property_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_property_views(UUID) TO anon;

-- =====================================================
-- COMMENTAIRES
-- =====================================================

COMMENT ON POLICY "Anyone can view active properties" ON properties IS
  'Permet à tout le monde (même non connecté) de voir les propriétés actives';

COMMENT ON POLICY "Users can view own properties" ON properties IS
  'Les utilisateurs connectés peuvent voir toutes leurs propres propriétés';

COMMENT ON POLICY "Check monthly quota on insert" ON properties IS
  'Vérifie que l''utilisateur n''a pas dépassé son quota mensuel avant de publier';

COMMENT ON FUNCTION reset_monthly_ads_count() IS
  'À exécuter le 1er de chaque mois pour réinitialiser les compteurs';
