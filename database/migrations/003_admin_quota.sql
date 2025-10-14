-- =====================================================
-- MIGRATION: Ajuster les quotas admin
-- Date: 2025-10-11
-- Description: Donner quota illimité aux admins
-- =====================================================

-- Mettre à jour le quota pour les admins (vous)
UPDATE users
SET
  monthly_ad_limit = 999999,
  max_properties = 999999,
  can_publish_ads = true,
  is_active = true
WHERE account_type = 'admin' OR email = 'mosisg7@gmail.com';

-- Vérifier le résultat
SELECT
  id,
  email,
  account_type,
  monthly_ad_limit,
  max_properties,
  current_month_ads,
  active_properties_count
FROM users
WHERE account_type = 'admin';
