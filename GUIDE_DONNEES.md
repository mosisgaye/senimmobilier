# 📚 Guide Complet - Insertion et Récupération des Données Fatimmo

Ce guide vous explique comment insérer et récupérer des données depuis votre base de données PostgreSQL Supabase pour les afficher sur le frontend.

## 📋 Table des Matières

1. [Structure de la Base de Données](#structure-de-la-base-de-données)
2. [Insertion de Données](#insertion-de-données)
3. [Récupération de Données](#récupération-de-données)
4. [Affichage sur le Frontend](#affichage-sur-le-frontend)
5. [Exemples Pratiques](#exemples-pratiques)

---

## 🗄️ Structure de la Base de Données

Votre base de données contient 3 tables principales:

### 1. Table `sellers` (Vendeurs)
```sql
- id: UUID (clé primaire)
- type: 'agency' | 'owner'
- name: Nom du vendeur
- phone_e164: Téléphone au format E.164 (+221...)
- email: Email
- verified: Boolean
- rating: Note (0-5)
- review_count: Nombre d'avis
- bio: Biographie
- website: Site web
- whatsapp_number: WhatsApp
```

### 2. Table `listings` (Annonces)
```sql
- id: UUID (clé primaire)
- seller_id: UUID (référence à sellers)
- slug: URL unique auto-généré
- title: Titre de l'annonce
- description: Description complète
- intent: 'sale' | 'rent'
- category: 'urbain' | 'residentiel' | 'agricole' | 'commercial' | 'rural'
- price_fcfa: Prix en FCFA
- price_negotiable: Boolean
- area_sqm: Surface en m²
- legal_status: 'titre_foncier' | 'bail' | 'deliberation' | 'autre'
- city: Ville
- region: Région
- neighborhood: Quartier
- lat, lng: Coordonnées GPS
- features: JSONB (caractéristiques)
- proximity: JSONB (proximités)
- badges: Array de texte
- status: 'draft' | 'published' | 'archived' | 'sold' | 'rented'
```

### 3. Table `media` (Médias)
```sql
- id: UUID (clé primaire)
- listing_id: UUID (référence à listings)
- url: URL de l'image/vidéo
- type: 'image' | 'video' | 'drone' | 'panorama'
- is_cover: Boolean (image de couverture)
- display_order: Ordre d'affichage
```

---

## 📥 Insertion de Données

### Méthode 1: Via SQL Direct (Recommandée pour bulk insert)

**Fichier créé:** `database/migrations/004_seed_data.sql`

```bash
# Exécuter le script SQL
psql "postgresql://postgres.pwpjcjxosjgdkcvantoo:Mandriva123.@aws-0-eu-west-3.pooler.supabase.com:5432/postgres" \\
  -f database/migrations/004_seed_data.sql
```

✅ **Déjà exécuté!** Vous avez maintenant:
- 3 vendeurs
- 8 annonces
- 24 médias

### Méthode 2: Via Script TypeScript

**Fichier créé:** `scripts/seed-database.ts`

**⚠️ Note:** Ce script nécessite des permissions RLS appropriées. Utilisez plutôt la méthode SQL pour l'instant.

```bash
npm run seed
```

### Méthode 3: Insérer une annonce manuellement

```sql
-- 1. D'abord, insérer ou sélectionner un vendeur
INSERT INTO sellers (type, name, phone_e164, email, verified)
VALUES ('owner', 'Jean Dupont', '+221771234567', 'jean@email.com', true)
RETURNING id;

-- 2. Insérer une annonce
INSERT INTO listings (
  seller_id,
  title,
  description,
  intent,
  category,
  price_fcfa,
  area_sqm,
  legal_status,
  city,
  region,
  status,
  published_at
) VALUES (
  'UUID-DU-VENDEUR',
  'Mon Terrain à Dakar',
  'Belle parcelle de terrain bien située',
  'sale',
  'residentiel',
  25000000,
  400,
  'titre_foncier',
  'Dakar',
  'Dakar',
  'published',
  NOW()
) RETURNING id, slug;

-- 3. Ajouter des images
INSERT INTO media (listing_id, url, type, is_cover, display_order)
VALUES
  ('UUID-DE-LANNONCE', 'https://...image1.jpg', 'image', true, 0),
  ('UUID-DE-LANNONCE', 'https://...image2.jpg', 'image', false, 1);
```

---

## 📤 Récupération de Données

### Option 1: Directement depuis le Frontend avec Supabase

**Fichier:** `lib/supabase.ts` (déjà configuré)

```typescript
import { supabase } from '@/lib/supabase'

// Récupérer toutes les annonces publiées
const { data, error } = await supabase
  .from('listings')
  .select(`
    *,
    seller:sellers(*),
    media(*)
  `)
  .eq('status', 'published')
  .order('created_at', { ascending: false })

if (data) {
  console.log('Annonces:', data)
}
```

### Option 2: Via SQL Direct

```bash
# Voir toutes les annonces
psql "postgresql://postgres.pwpjcjxosjgdkcvantoo:Mandriva123.@aws-0-eu-west-3.pooler.supabase.com:5432/postgres" \\
  -c "SELECT id, title, city, price_fcfa, area_sqm FROM listings WHERE status='published';"

# Voir une annonce avec son vendeur
psql "..." -c "
  SELECT l.title, l.price_fcfa, s.name as seller_name
  FROM listings l
  JOIN sellers s ON l.seller_id = s.id
  WHERE l.slug = 'terrain-titre-500m-almadies-vue-mer';
"

# Voir les médias d'une annonce
psql "..." -c "
  SELECT m.url, m.type, m.is_cover
  FROM media m
  JOIN listings l ON m.listing_id = l.id
  WHERE l.slug = 'terrain-titre-500m-almadies-vue-mer'
  ORDER BY m.display_order;
"
```

---

## 🎨 Affichage sur le Frontend

### Étape 1: Modifier `app/page.tsx`

Votre fichier `app/page.tsx` utilise déjà Supabase ! Il récupère les données de la table `properties` mais doit être mis à jour pour `listings`:

```typescript
// AVANT (ancienne structure)
const { data, error } = await supabase
  .from('properties')
  .select('*')

// APRÈS (nouvelle structure)
const { data, error } = await supabase
  .from('listings')
  .select(`
    *,
    seller:sellers(*),
    media(*)
  `)
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .limit(8)
```

### Étape 2: Créer un composant ListingCard

**Fichier:** `components/ListingCard.tsx`

```typescript
'use client'

import { motion } from 'framer-motion'
import { MapPin, Ruler, BadgeCheck } from 'lucide-react'

interface ListingCardProps {
  listing: {
    id: string
    slug: string
    title: string
    description: string
    price_fcfa: number
    area_sqm: number
    city: string
    neighborhood?: string
    badges: string[]
    cover_image_url?: string
    media?: Array<{ url: string; is_cover: boolean }>
  }
}

export default function ListingCard({ listing }: ListingCardProps) {
  const coverImage = listing.cover_image_url ||
    listing.media?.find(m => m.is_cover)?.url ||
    'https://via.placeholder.com/400x300'

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={coverImage}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {listing.badges && listing.badges.length > 0 && (
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {listing.badges.slice(0, 2).map((badge, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {listing.title}
        </h3>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">
            {listing.city}{listing.neighborhood ? `, ${listing.neighborhood}` : ''}
          </span>
        </div>

        <div className="flex items-center text-gray-600 mb-4">
          <Ruler className="h-4 w-4 mr-1" />
          <span className="text-sm">{listing.area_sqm} m²</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-2xl font-bold text-primary-600">
              {formatPrice(listing.price_fcfa)}
            </p>
          </div>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Voir détails
          </button>
        </div>
      </div>
    </motion.div>
  )
}
```

### Étape 3: Utiliser dans la page

```typescript
// app/page.tsx
import ListingCard from '@/components/ListingCard'

export default function Home() {
  const [listings, setListings] = useState([])

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    const { data } = await supabase
      .from('listings')
      .select(`*, seller:sellers(*), media(*)`)
      .eq('status', 'published')
      .limit(8)

    if (data) setListings(data)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
```

---

## 🎯 Exemples Pratiques

### Exemple 1: Rechercher par ville

```typescript
const { data } = await supabase
  .from('listings')
  .select('*')
  .eq('city', 'Dakar')
  .eq('status', 'published')
```

### Exemple 2: Filtrer par prix

```typescript
const { data } = await supabase
  .from('listings')
  .select('*')
  .gte('price_fcfa', 10000000)  // Prix minimum
  .lte('price_fcfa', 50000000)   // Prix maximum
  .eq('status', 'published')
```

### Exemple 3: Recherche par catégorie

```typescript
const { data } = await supabase
  .from('listings')
  .select('*')
  .eq('category', 'residentiel')
  .eq('intent', 'sale')
  .eq('status', 'published')
```

### Exemple 4: Obtenir les statistiques

```sql
-- Nombre d'annonces par ville
SELECT city, COUNT(*) as total
FROM listings
WHERE status = 'published'
GROUP BY city
ORDER BY total DESC;

-- Prix moyen par ville
SELECT city,
       AVG(price_fcfa) as prix_moyen,
       MIN(price_fcfa) as prix_min,
       MAX(price_fcfa) as prix_max
FROM listings
WHERE status = 'published'
GROUP BY city;

-- Top vendeurs
SELECT s.name, COUNT(l.id) as nb_annonces
FROM sellers s
JOIN listings l ON s.id = l.seller_id
WHERE l.status = 'published'
GROUP BY s.id, s.name
ORDER BY nb_annonces DESC;
```

---

## 🔧 Commandes Utiles

```bash
# Compter les enregistrements
psql "..." -c "SELECT COUNT(*) FROM listings;"

# Voir les dernières annonces
psql "..." -c "SELECT title, city, price_fcfa FROM listings ORDER BY created_at DESC LIMIT 5;"

# Supprimer toutes les données (ATTENTION!)
psql "..." -c "TRUNCATE sellers, listings, media CASCADE;"

# Réinsérer les données d'exemple
psql "..." -f database/migrations/004_seed_data.sql
```

---

## 🎓 Prochaines Étapes

1. ✅ Données insérées dans la base
2. 🔄 Modifier `app/page.tsx` pour utiliser `listings` au lieu de `properties`
3. 🎨 Créer le composant `ListingCard`
4. 🔍 Ajouter des filtres de recherche
5. 📱 Créer une page de détails pour chaque annonce
6. 📊 Ajouter un tableau de bord admin

---

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifiez que les données existent:
   ```bash
   psql "..." -c "SELECT COUNT(*) FROM listings;"
   ```

2. Vérifiez les permissions RLS dans Supabase Dashboard

3. Consultez les logs dans Supabase Dashboard > Database > Logs

---

## 🎉 Résumé

Vous avez maintenant:
- ✅ **3 vendeurs** dans la base de données
- ✅ **8 annonces** publiées avec toutes les informations
- ✅ **24 médias** (3 images par annonce)
- ✅ Structure complète pour ajouter plus de données
- ✅ Exemples de requêtes pour afficher sur le frontend

**La base de données est prête à être utilisée sur votre frontend Next.js!** 🚀
