-- Insérer des vendeurs d'exemple
INSERT INTO sellers (type, name, phone_e164, email, verified, rating, review_count, bio, website, whatsapp_number)
VALUES
  (
    'agency',
    'Fatimmo Immobilier',
    '+221776543210',
    'contact@fatimmo.sn',
    true,
    4.8,
    45,
    'Agence immobilière leader au Sénégal, spécialisée dans la vente de terrains titrés.',
    'https://fatimmo.sn',
    '+221776543210'
  ),
  (
    'owner',
    'Mamadou Diop',
    '+221775678901',
    'mamadou.diop@email.com',
    true,
    4.5,
    12,
    'Propriétaire de plusieurs terrains à Dakar et Thiès.',
    NULL,
    '+221775678901'
  ),
  (
    'agency',
    'Sénégal Immobilier Pro',
    '+221774561230',
    'contact@senegalimmopro.com',
    true,
    4.6,
    28,
    'Experts en immobilier côtier et touristique.',
    'https://senegalimmopro.com',
    '+221774561230'
  );

-- Récupérer les IDs des vendeurs
DO $$
DECLARE
  seller_1_id UUID;
  seller_2_id UUID;
  seller_3_id UUID;
BEGIN
  -- Récupérer les IDs
  SELECT id INTO seller_1_id FROM sellers WHERE email = 'contact@fatimmo.sn';
  SELECT id INTO seller_2_id FROM sellers WHERE email = 'mamadou.diop@email.com';
  SELECT id INTO seller_3_id FROM sellers WHERE email = 'contact@senegalimmopro.com';

  -- Insérer les annonces
  INSERT INTO listings (
    seller_id, title, description, intent, category, price_fcfa, area_sqm,
    legal_status, city, region, neighborhood, lat, lng, show_exact_location,
    features, proximity, badges, cover_image_url, status, published_at
  )
  VALUES
    -- Annonce 1: Almadies
    (
      seller_1_id,
      'Terrain Titré 500m² Almadies Vue Mer',
      E'Magnifique terrain titré de 500m² situé dans le quartier prestigieux des Almadies à Dakar.\n\n🌊 Situation exceptionnelle avec vue sur l\'océan Atlantique\n📜 Titre foncier en règle - Propriété sécurisée\n🏗️ Zone résidentielle de standing\n💡 Viabilisé : Eau, électricité, assainissement\n🛣️ Accès goudronné, sécurité 24h/24',
      'sale',
      'residentiel',
      75000000,
      500,
      'titre_foncier',
      'Dakar',
      'Dakar',
      'Almadies',
      14.7392,
      -17.5022,
      true,
      '{"bordered": true, "serviced": true, "soil_type": "sablonneux", "zoning": "residential", "slope": "flat", "title_deed_available": true}'::jsonb,
      '{"beach": "500m", "school": "2km", "hospital": "3km", "market": "1.5km"}'::jsonb,
      ARRAY['Titre Foncier', 'Viabilisé', 'Vue Mer', 'Sécurisé'],
      'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=1200&h=800&fit=crop',
      'published',
      NOW()
    ),
    -- Annonce 2: Mbour
    (
      seller_2_id,
      'Terrain 300m² Mbour Proche Mer',
      E'Terrain viabilisé à Mbour, à proximité immédiate de la plage. Parfait pour investissement locatif ou résidence secondaire.\n\n🏖️ À 200m de la plage\n💡 Électricité et eau disponibles\n📜 Bail de 99 ans (en cours de titre)\n🌳 Environnement calme et verdoyant',
      'sale',
      'residentiel',
      18000000,
      300,
      'bail',
      'Mbour',
      'Thiès',
      'Mbour Centre',
      14.4196,
      -16.9605,
      false,
      '{"bordered": true, "serviced": true, "soil_type": "sablonneux", "slope": "flat"}'::jsonb,
      '{"beach": "200m", "restaurant": "300m", "market": "1km"}'::jsonb,
      ARRAY['Viabilisé', 'Proche Mer', 'Négociable'],
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop',
      'published',
      NOW()
    ),
    -- Annonce 3: Saly
    (
      seller_3_id,
      'Grand Terrain 1000m² Saly Zone Touristique',
      E'Vaste terrain de 1000m² dans la prestigieuse zone touristique de Saly Portudal. Emplacement exceptionnel pour projet hôtelier ou résidence de luxe.\n\n⭐ Zone touristique classée\n📜 Titre foncier\n🏖️ À 800m de la plage\n🏌️ Proche du golf de Saly\n🏪 Toutes commodités à proximité',
      'sale',
      'commercial',
      50000000,
      1000,
      'titre_foncier',
      'Saly',
      'Thiès',
      'Saly Portudal',
      14.4520,
      -17.0324,
      true,
      '{"bordered": true, "serviced": true, "soil_type": "sablonneux", "zoning": "commercial", "slope": "flat", "title_deed_available": true}'::jsonb,
      '{"beach": "800m", "golf": "1.5km", "hotel": "500m", "restaurant": "400m"}'::jsonb,
      ARRAY['Titre Foncier', 'Zone Touristique', 'Commercial', 'Viabilisé'],
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop',
      'published',
      NOW()
    ),
    -- Annonce 4: Pikine
    (
      seller_1_id,
      'Terrain Résidentiel 200m² Pikine',
      E'Terrain borné dans un quartier résidentiel en plein développement à Pikine. Excellent rapport qualité-prix pour première acquisition.\n\n💰 Prix accessible\n📍 Bien situé, accès facile\n🏘️ Quartier résidentiel dynamique\n🚌 Transport en commun à proximité',
      'sale',
      'urbain',
      8000000,
      200,
      'deliberation',
      'Pikine',
      'Dakar',
      'Pikine Guédiawaye',
      14.7547,
      -17.3986,
      false,
      '{"bordered": true, "serviced": false, "soil_type": "argileux", "slope": "flat"}'::jsonb,
      '{"school": "500m", "market": "800m", "mosque": "300m"}'::jsonb,
      ARRAY['Prix Accessible', 'Négociable', 'Borné'],
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop',
      'published',
      NOW()
    ),
    -- Annonce 5: Thiès Agricole
    (
      seller_2_id,
      'Terrain Agricole 2 Hectares Thiès',
      E'Grande parcelle agricole de 2 hectares (20,000m²) située à Thiès. Sol fertile, parfait pour exploitation maraîchère ou agricole.\n\n🌾 Sol riche et fertile\n💧 Accès à l\'eau (forage possible)\n🚜 Terrain plat, facile à cultiver\n🛣️ Accès par route goudronnée\n📜 Titre foncier',
      'sale',
      'agricole',
      35000000,
      20000,
      'titre_foncier',
      'Thiès',
      'Thiès',
      NULL,
      14.7889,
      -16.9324,
      true,
      '{"bordered": true, "serviced": false, "soil_type": "argileux_fertile", "zoning": "agricultural", "slope": "flat", "title_deed_available": true, "water_access": true}'::jsonb,
      '{"village": "2km", "road": "Bordure route goudronnée"}'::jsonb,
      ARRAY['Titre Foncier', 'Agricole', 'Grande Surface', 'Sol Fertile'],
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop',
      'published',
      NOW()
    ),
    -- Annonce 6: Ngor Luxe
    (
      seller_3_id,
      'Terrain de Luxe 800m² Ngor Vue Panoramique',
      E'Terrain d\'exception de 800m² dans le quartier ultra-prisé de Ngor. Vue panoramique spectaculaire sur l\'océan et l\'île de Ngor.\n\n🌊 Vue panoramique exceptionnelle\n📜 Titre foncier sécurisé\n🏘️ Zone résidentielle haut standing\n💎 Emplacement unique et rare\n🔒 Sécurité maximale 24h/24',
      'sale',
      'residentiel',
      120000000,
      800,
      'titre_foncier',
      'Dakar',
      'Dakar',
      'Ngor',
      14.7503,
      -17.5153,
      true,
      '{"bordered": true, "serviced": true, "soil_type": "rocheux", "zoning": "residential_luxury", "slope": "moderate", "title_deed_available": true, "ocean_view": true}'::jsonb,
      '{"beach": "300m", "restaurant": "500m", "hotel_5_stars": "1km"}'::jsonb,
      ARRAY['Luxe', 'Titre Foncier', 'Vue Mer', 'Ngor', 'Exclusif'],
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
      'published',
      NOW()
    ),
    -- Annonce 7: Toubab Dialaw
    (
      seller_1_id,
      'Terrain 350m² Toubab Dialaw Village Artistique',
      E'Charmant terrain de 350m² dans le village artistique de Toubab Dialaw, à 45km de Dakar.\n\n🎨 Village artistique authentique\n🌴 Ambiance nature et calme\n🏖️ Proche de la plage\n🌅 Cadre paradisiaque',
      'sale',
      'rural',
      12000000,
      350,
      'deliberation',
      'Toubab Dialaw',
      'Thiès',
      'Toubab Dialaw',
      14.5833,
      -17.0833,
      false,
      '{"bordered": true, "serviced": false, "soil_type": "sablonneux", "slope": "flat"}'::jsonb,
      '{"beach": "800m", "village": "Centre village"}'::jsonb,
      ARRAY['Nature', 'Artistique', 'Calme', 'Négociable'],
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop',
      'published',
      NOW()
    ),
    -- Annonce 8: Rufisque
    (
      seller_2_id,
      'Terrain Commercial 400m² Rufisque Centre',
      E'Emplacement commercial stratégique de 400m² au cœur de Rufisque. Forte visibilité et passage important.\n\n🏪 Axe commercial principal\n👁️ Très forte visibilité\n🚌 Arrêt transport devant\n📜 Titre foncier en cours',
      'sale',
      'commercial',
      22000000,
      400,
      'bail',
      'Rufisque',
      'Dakar',
      'Rufisque Centre',
      14.7167,
      -17.2667,
      true,
      '{"bordered": true, "serviced": true, "soil_type": "sablonneux", "zoning": "commercial", "slope": "flat", "high_visibility": true}'::jsonb,
      '{"bank": "200m", "market": "500m", "station": "300m"}'::jsonb,
      ARRAY['Commercial', 'Centre Ville', 'Viabilisé', 'Visibilité'],
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop',
      'published',
      NOW()
    );

  -- Ajouter des médias pour chaque annonce
  INSERT INTO media (listing_id, url, type, is_cover, title, display_order, width, height)
  SELECT
    l.id,
    l.cover_image_url,
    'image',
    true,
    'Photo principale',
    0,
    1200,
    800
  FROM listings l;

  -- Ajouter des images supplémentaires
  INSERT INTO media (listing_id, url, type, is_cover, title, display_order, width, height)
  SELECT
    l.id,
    'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=1200&h=800&fit=crop',
    'image',
    false,
    'Photo 2',
    1,
    1200,
    800
  FROM listings l;

  INSERT INTO media (listing_id, url, type, is_cover, title, display_order, width, height)
  SELECT
    l.id,
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop',
    'image',
    false,
    'Photo 3',
    2,
    1200,
    800
  FROM listings l;

END $$;

-- Afficher un résumé
SELECT
  'Vendeurs' as type,
  COUNT(*)::text as count
FROM sellers
UNION ALL
SELECT
  'Annonces' as type,
  COUNT(*)::text as count
FROM listings
UNION ALL
SELECT
  'Médias' as type,
  COUNT(*)::text as count
FROM media;
