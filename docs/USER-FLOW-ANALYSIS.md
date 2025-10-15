# Analyse du Flux Utilisateur - SenImmobilier

## 📊 Structure de la Base de Données

### Tables principales analysées

#### 1. **auth.users** (Supabase Auth)
- Gestion de l'authentification
- Stocke : email, password, user_metadata, app_metadata
- `user_metadata` contient : first_name, last_name, user_type (buyer/seller)

#### 2. **sellers** (Vendeurs/Agences)
```sql
Colonnes clés:
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- type (agency | owner)
- name (nom de l'agence ou du propriétaire)
- phone_e164 (+221XXXXXXXXX)
- email
- verified (boolean)
- logo_url
- bio
- active_listings_count
```

**Relation importante** : `sellers.user_id → auth.users.id`
- Un user peut devenir seller en créant une entrée dans `sellers`

#### 3. **listings** (Annonces de terrains)
```sql
Colonnes clés:
- id (uuid, PK)
- slug (unique, auto-généré)
- seller_id (FK → sellers)
- title, description, excerpt
- intent (sale | rent)
- category (urbain, residentiel, agricole, commercial, rural)
- price_fcfa (numeric)
- area_sqm (integer)
- legal_status (titre_foncier, bail, deliberation, autre)
- city, region, neighborhood
- lat, lng, geom (PostGIS)
- features (jsonb: serviced, bordered, title_deed_available, etc.)
- proximity (jsonb: beach, school, etc.)
- badges (text[])
- status (draft | published | archived | sold | rented)
- cover_image_url
```

#### 4. **media** (Photos/Vidéos)
```sql
Colonnes clés:
- id (uuid, PK)
- listing_id (FK → listings)
- url
- type (image | video | drone | panorama)
- is_cover (boolean, unique per listing)
- display_order
```

#### 5. **documents** (Documents légaux)
```sql
Colonnes clés:
- id (uuid, PK)
- listing_id (FK → listings)
- url
- kind (titre_foncier, plan_bornage, deliberation, bail, autre)
- title
- verified (boolean)
- verified_by, verified_at
```

---

## 🎯 Flux Utilisateur Complet

### Phase 1 : Inscription / Connexion

#### A. Page d'inscription (`/register`)

**Données à collecter** :
```typescript
{
  // Authentification (auth.users)
  email: string
  password: string

  // Métadonnées user (user_metadata)
  first_name: string
  last_name: string
  user_type: 'buyer' | 'seller' // Important !

  // Si user_type = 'seller', collecter aussi:
  seller_type: 'agency' | 'owner'
  seller_name: string // Nom agence ou nom complet
  phone: string // Format E.164: +221XXXXXXXXX
  whatsapp: string (optionnel)
}
```

**Flux d'inscription** :
1. ✅ Formulaire : Email, Mot de passe, Prénom, Nom, Type (Acheteur/Vendeur)
2. ✅ Si Vendeur → champs supplémentaires (Type vendeur, Téléphone)
3. ✅ `supabase.auth.signUp()` avec metadata
4. ✅ Si user_type = 'seller' → Créer entrée dans table `sellers`
5. ✅ Email de confirmation envoyé
6. ✅ Redirection vers `/dashboard` ou `/terrains`

#### B. Page de connexion (`/login`)

**Flux simple** :
1. ✅ Email + Password
2. ✅ `supabase.auth.signInWithPassword()`
3. ✅ Vérifier si `sellers.user_id = auth.uid()`
4. ✅ Redirection selon profil :
   - Seller → `/dashboard`
   - Buyer → `/terrains`

---

### Phase 2 : Tableau de bord Vendeur

#### Page `/dashboard`

**Sections** :
1. **Statistiques**
   - Nombre d'annonces actives
   - Nombre de vues totales
   - Nombre de contacts reçus
   - Nombre de favoris

2. **Liste des annonces**
   - Brouillons (draft)
   - Publiées (published)
   - Archivées (archived)
   - Vendues (sold)

3. **Actions rapides**
   - ➕ Créer une annonce
   - ✏️ Modifier une annonce
   - 🗑️ Supprimer une annonce
   - 📊 Voir les statistiques

**Requête pour récupérer les annonces du vendeur** :
```typescript
// Récupérer seller_id depuis auth.user
const { data: seller } = await supabase
  .from('sellers')
  .select('id')
  .eq('user_id', user.id)
  .single()

// Récupérer les listings
const { data: listings } = await supabase
  .from('listings')
  .select(`
    *,
    media(url, type, is_cover, display_order)
  `)
  .eq('seller_id', seller.id)
  .order('created_at', { ascending: false })
```

---

### Phase 3 : Création d'Annonce

#### Page `/dashboard/listings/new`

**Formulaire multi-étapes** :

#### **Étape 1 : Informations de base** ✅
```typescript
{
  title: string // Max 255 caractères
  description: string // Texte long
  excerpt: string // Max 200 caractères pour SEO
  intent: 'sale' | 'rent'
  category: 'urbain' | 'residentiel' | 'agricole' | 'commercial' | 'rural'
}
```

#### **Étape 2 : Prix et Surface** 💰
```typescript
{
  price_fcfa: number // > 0
  price_negotiable: boolean
  price_period: 'month' | 'year' // Requis si intent = 'rent'
  area_sqm: number // > 0, en m²
}
```

#### **Étape 3 : Localisation** 📍
```typescript
{
  city: string // Ex: Dakar, Mbour, Saly
  region: string // Ex: Dakar, Thiès
  neighborhood: string // Quartier (optionnel)
  address: string // Adresse complète (optionnel)
  distance_ref: string // Ex: "500m de la plage"

  // Coordonnées GPS
  lat: number // Latitude
  lng: number // Longitude
  show_exact_location: boolean // Afficher position exacte
}
```

**💡 Suggestion** : Intégrer Google Maps pour :
- Sélectionner la position sur la carte
- Auto-complétion d'adresse
- Calculer automatiquement lat/lng

#### **Étape 4 : Statut Légal** 📄
```typescript
{
  legal_status: 'titre_foncier' | 'bail' | 'deliberation' | 'autre'
}
```

#### **Étape 5 : Caractéristiques** ✨
```typescript
{
  features: {
    serviced: boolean // Viabilisé (eau + électricité)
    bordered: boolean // Borné
    title_deed_available: boolean // TF disponible
    soil_type: string // Type de sol
    zoning: string // Zone (residential, commercial, etc.)
    slope: 'flat' | 'gentle' | 'moderate'
  },

  proximity: {
    beach: string // Ex: "500m"
    school: string
    hospital: string
    market: string
    mosque: string
    // etc.
  }
}
```

#### **Étape 6 : Photos** 📸
```typescript
{
  media: [
    {
      url: string // URL Supabase Storage
      type: 'image' | 'video' | 'drone' | 'panorama'
      is_cover: boolean // 1 seule cover image
      display_order: number
      title: string (optionnel)
    }
  ]
}
```

**Upload d'images** :
1. ✅ Upload vers Supabase Storage bucket: `listing-images`
2. ✅ Format : JPG, PNG, WebP (max 10MB)
3. ✅ Comprimer avant upload
4. ✅ Ordre drag & drop pour `display_order`
5. ✅ Sélectionner image de couverture

#### **Étape 7 : Documents Légaux** 📑
```typescript
{
  documents: [
    {
      url: string // URL Supabase Storage
      kind: 'titre_foncier' | 'plan_bornage' | 'deliberation' | 'bail' | 'autre'
      title: string
      description: string (optionnel)
    }
  ]
}
```

**Upload de documents** :
1. ✅ Upload vers Supabase Storage bucket: `listing-docs`
2. ✅ Format : PDF, JPG, PNG (max 5MB)
3. ✅ Documents sensibles → non publics par défaut
4. ✅ Vérification admin après upload

#### **Étape 8 : Aperçu et Publication** 👁️
```typescript
{
  status: 'draft' | 'published'
  badges: string[] // Ex: ['verified', 'featured', 'new']
}
```

**Actions** :
- ✅ **Enregistrer comme brouillon** → status = 'draft'
- ✅ **Publier** → status = 'published', published_at = now()

---

## 🔐 Sécurité et Permissions (RLS)

### Policies Supabase existantes

#### **sellers**
```sql
✅ anon_read_sellers: Tout le monde peut lire
✅ sellers_own_read: Le seller peut lire ses propres infos
✅ sellers_own_update: Le seller peut modifier ses propres infos
```

#### **listings**
```sql
✅ anon_read_published: Tout le monde peut lire les annonces published
✅ listings_seller_read: Le seller peut lire toutes ses annonces
✅ listings_seller_insert: Le seller peut créer une annonce
✅ listings_seller_update: Le seller peut modifier ses annonces
✅ listings_seller_delete: Le seller peut supprimer ses annonces
```

#### **media**
```sql
✅ anon_read_media: Tout le monde peut lire les médias
✅ media_seller_all: Le seller a accès complet à ses médias
```

#### **documents**
```sql
✅ documents_public_read: Lecture publique des docs d'annonces published
✅ documents_seller_all: Le seller a accès complet à ses documents
```

---

## 🛠️ Services CRUD à Créer

### 1. **Auth Service** (`lib/services/auth.ts`)
```typescript
// Inscription
signUp(email, password, metadata)
// Connexion
signIn(email, password)
// Déconnexion
signOut()
// Récupérer user
getUser()
// Créer profil seller
createSellerProfile(userId, data)
```

### 2. **Seller Service** (`lib/services/seller.ts`)
```typescript
// Récupérer seller depuis user_id
getSellerByUserId(userId)
// Mettre à jour profil
updateSellerProfile(sellerId, data)
// Récupérer statistiques
getSellerStats(sellerId)
```

### 3. **Listing Service** (`lib/services/listing.ts`)
```typescript
// CRUD Complet
createListing(sellerId, data)
updateListing(listingId, data)
deleteListing(listingId)
getListingById(id)
getListingsBySeller(sellerId)

// Gestion du statut
publishListing(listingId)
archiveListing(listingId)
markAsSold(listingId)

// Slug auto-généré par trigger DB
```

### 4. **Media Service** (`lib/services/media.ts`)
```typescript
// Upload image vers Supabase Storage
uploadImage(file, listingId): Promise<string> // retourne URL

// CRUD Media
createMedia(listingId, url, type, isCover, displayOrder)
deleteMedia(mediaId)
updateMediaOrder(listingId, mediaIds[])
setCoverImage(listingId, mediaId)
```

### 5. **Document Service** (`lib/services/document.ts`)
```typescript
// Upload document vers Supabase Storage
uploadDocument(file, listingId): Promise<string>

// CRUD Documents
createDocument(listingId, url, kind, title)
deleteDocument(docId)
```

### 6. **Storage Service** (`lib/services/storage.ts`)
```typescript
// Upload générique
uploadFile(bucket, path, file): Promise<string>
// Supprimer
deleteFile(bucket, path)
// Récupérer URL publique
getPublicUrl(bucket, path): string
```

---

## 📁 Structure des Pages et Composants

### Pages à créer

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx          // Page de connexion
│   ├── register/
│   │   └── page.tsx          // Page d'inscription
│   └── layout.tsx            // Layout auth (simple, sans header)
│
├── dashboard/
│   ├── page.tsx              // Vue d'ensemble
│   ├── listings/
│   │   ├── page.tsx          // Liste des annonces
│   │   ├── new/
│   │   │   └── page.tsx      // Créer une annonce (multi-step)
│   │   └── [id]/
│   │       ├── page.tsx      // Détails annonce
│   │       └── edit/
│   │           └── page.tsx  // Modifier annonce
│   ├── profile/
│   │   └── page.tsx          // Profil vendeur
│   └── layout.tsx            // Layout dashboard (sidebar)
```

### Composants à créer

```
components/
├── auth/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── AuthGuard.tsx         // Protéger les routes
│
├── dashboard/
│   ├── Sidebar.tsx
│   ├── StatsCards.tsx
│   └── ListingsTable.tsx
│
└── listing-form/
    ├── ListingFormWizard.tsx        // Multi-step form
    ├── Step1_BasicInfo.tsx
    ├── Step2_PriceArea.tsx
    ├── Step3_Location.tsx
    ├── Step4_LegalStatus.tsx
    ├── Step5_Features.tsx
    ├── Step6_Media.tsx
    ├── Step7_Documents.tsx
    └── Step8_Review.tsx
```

---

## 🎨 UX Recommandations

### Formulaire de création d'annonce

1. **Multi-step wizard** (8 étapes)
   - Barre de progression en haut
   - Boutons "Précédent" / "Suivant"
   - Sauvegarde automatique en brouillon
   - Validation à chaque étape

2. **Upload d'images**
   - Drag & drop
   - Preview immédiat
   - Ordre modifiable (drag & drop)
   - Sélection image de couverture
   - Compression automatique

3. **Sélection de localisation**
   - Carte interactive (Google Maps)
   - Recherche d'adresse
   - Marker déplaçable
   - Option "cacher localisation exacte"

4. **Caractéristiques**
   - Toggles pour features (serviced, bordered, etc.)
   - Inputs pour proximity (distances)
   - Auto-suggestions

5. **Aperçu avant publication**
   - Voir l'annonce comme les visiteurs
   - Modifier sections individuelles
   - Publier ou sauvegarder brouillon

---

## 🚀 Roadmap d'Implémentation

### Phase 1 : Auth & User Management (Priorité 1)
- [ ] Service auth (signup, signin, signout)
- [ ] Page /register avec formulaire complet
- [ ] Page /login
- [ ] Création automatique du profil seller
- [ ] AuthGuard pour protéger les routes

### Phase 2 : Dashboard (Priorité 1)
- [ ] Layout dashboard avec sidebar
- [ ] Page d'accueil dashboard (stats)
- [ ] Liste des annonces du vendeur
- [ ] Filtres par statut (draft, published, etc.)

### Phase 3 : Services CRUD (Priorité 1)
- [ ] Seller service
- [ ] Listing service
- [ ] Media service
- [ ] Document service
- [ ] Storage service

### Phase 4 : Création d'Annonce (Priorité 1)
- [ ] Multi-step form wizard
- [ ] Étape 1 : Infos de base
- [ ] Étape 2 : Prix et surface
- [ ] Étape 3 : Localisation (avec map)
- [ ] Étape 4 : Statut légal
- [ ] Étape 5 : Caractéristiques
- [ ] Étape 6 : Upload photos
- [ ] Étape 7 : Upload documents
- [ ] Étape 8 : Aperçu et publication

### Phase 5 : Édition d'Annonce (Priorité 2)
- [ ] Réutiliser le formulaire multi-step
- [ ] Pré-remplir avec données existantes
- [ ] Permettre modification partielle

### Phase 6 : Gestion des Médias (Priorité 2)
- [ ] Réordonner les photos (drag & drop)
- [ ] Supprimer des photos
- [ ] Changer l'image de couverture
- [ ] Compression automatique

### Phase 7 : Analytics (Priorité 3)
- [ ] Tracking des vues
- [ ] Tracking des contacts
- [ ] Tracking des favoris
- [ ] Graphiques de statistiques

---

## 📊 Données Exemple pour Tests

### User Seller
```json
{
  "email": "vendeur@senimmobilier.sn",
  "password": "Test1234!",
  "user_metadata": {
    "first_name": "Abdou",
    "last_name": "Diallo",
    "user_type": "seller"
  }
}
```

### Seller Profile
```json
{
  "type": "agency",
  "name": "Diallo Immobilier",
  "phone_e164": "+221771234567",
  "email": "contact@dialloimmobilier.sn",
  "whatsapp_number": "+221771234567"
}
```

### Listing Example
```json
{
  "title": "Terrain Résidentiel 500m² à Saly",
  "description": "Magnifique terrain de 500m² situé à Saly...",
  "excerpt": "Terrain résidentiel de 500m² à Saly, proche de la plage",
  "intent": "sale",
  "category": "residentiel",
  "price_fcfa": 25000000,
  "price_negotiable": true,
  "area_sqm": 500,
  "legal_status": "titre_foncier",
  "city": "Saly",
  "region": "Thiès",
  "neighborhood": "Saly Portudal",
  "lat": 14.4516,
  "lng": -17.0589,
  "features": {
    "serviced": true,
    "bordered": true,
    "title_deed_available": true,
    "soil_type": "sablonneux",
    "zoning": "residential",
    "slope": "flat"
  },
  "proximity": {
    "beach": "800m",
    "school": "1.5km",
    "hospital": "3km"
  },
  "status": "published"
}
```

---

## ✅ Checklist de Validation

Avant de déployer, vérifier :

### Authentification
- [ ] L'inscription crée bien un user dans auth.users
- [ ] L'inscription crée bien un seller si user_type = 'seller'
- [ ] La connexion fonctionne
- [ ] Le logout fonctionne
- [ ] Les routes protégées redirigent vers /login

### Dashboard
- [ ] Les stats s'affichent correctement
- [ ] La liste des annonces charge
- [ ] Les filtres fonctionnent (draft, published, etc.)

### Création d'Annonce
- [ ] Toutes les étapes s'affichent
- [ ] La validation fonctionne à chaque étape
- [ ] Les images s'uploadent correctement
- [ ] Les documents s'uploadent correctement
- [ ] Le slug se génère automatiquement
- [ ] L'annonce apparaît en brouillon
- [ ] La publication fonctionne
- [ ] L'annonce apparaît sur /terrains après publication

### Sécurité
- [ ] RLS empêche de modifier l'annonce d'un autre
- [ ] RLS empêche de voir les brouillons des autres
- [ ] Les uploads sont sécurisés
- [ ] Les tokens JWT sont valides

---

## 📞 Contact & Support

Pour toute question technique sur la base de données ou l'implémentation :
- Email : support@senimmobilier.sn
- Documentation Supabase : https://supabase.com/docs

---

**Version** : 1.0.0
**Date** : 2025-10-15
**Auteur** : Claude Code
