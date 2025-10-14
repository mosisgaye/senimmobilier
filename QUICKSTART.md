# 🚀 Quick Start - Fatimmo Database

## ✅ Ce qui a été fait

### 1. Base de données peuplée
- **3 vendeurs** (agences et propriétaires)
- **8 annonces de terrains** dans différentes villes du Sénégal
- **24 images** (3 par annonce)

### 2. Structure de données
- Table `sellers` : Informations sur les vendeurs
- Table `listings` : Les annonces de terrains
- Table `media` : Photos et vidéos des annonces

---

## 📊 Vérifier les données

```bash
# Se connecter à la base de données
psql postgresql://postgres.pwpjcjxosjgdkcvantoo:Mandriva123.@aws-0-eu-west-3.pooler.supabase.com:5432/postgres

# Voir toutes les annonces
SELECT title, city, price_fcfa FROM listings;

# Quitter
\q
```

---

## 🎨 Afficher sur le Frontend

### Option rapide : Modifier app/page.tsx

Remplacez `'properties'` par `'listings'` :

```typescript
// AVANT
const { data } = await supabase.from('properties').select('*')

// APRÈS
const { data } = await supabase.from('listings').select('*')
```

### Structure d'une annonce (listing)

```typescript
{
  id: "uuid",
  slug: "terrain-titre-500m-almadies-vue-mer",
  title: "Terrain Titré 500m² Almadies Vue Mer",
  description: "Magnifique terrain...",
  price_fcfa: 75000000,
  area_sqm: 500,
  city: "Dakar",
  region: "Dakar",
  neighborhood: "Almadies",
  category: "residentiel",
  legal_status: "titre_foncier",
  status: "published",
  badges: ["Titre Foncier", "Viabilisé", "Vue Mer"],
  cover_image_url: "https://...",
  features: { bordered: true, serviced: true },
  proximity: { beach: "500m", school: "2km" }
}
```

---

## 🔥 Exemples de Requêtes

### Récupérer toutes les annonces publiées

```typescript
const { data, error } = await supabase
  .from('listings')
  .select('*')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
```

### Avec vendeur et images

```typescript
const { data } = await supabase
  .from('listings')
  .select(`
    *,
    seller:sellers(*),
    media(*)
  `)
  .eq('status', 'published')
```

### Filtrer par ville

```typescript
const { data } = await supabase
  .from('listings')
  .select('*')
  .eq('city', 'Dakar')
  .eq('status', 'published')
```

### Filtrer par prix

```typescript
const { data } = await supabase
  .from('listings')
  .select('*')
  .gte('price_fcfa', 10000000)
  .lte('price_fcfa', 50000000)
```

---

## 📍 Les 8 annonces disponibles

1. **Almadies** - 75M FCFA - 500m² - Titre Foncier - Vue Mer
2. **Mbour** - 18M FCFA - 300m² - Bail - Proche Plage
3. **Saly** - 50M FCFA - 1000m² - Commercial - Zone Touristique
4. **Pikine** - 8M FCFA - 200m² - Prix Accessible
5. **Thiès** - 35M FCFA - 20,000m² (2 hectares) - Agricole
6. **Ngor** - 120M FCFA - 800m² - Luxe - Vue Panoramique
7. **Toubab Dialaw** - 12M FCFA - 350m² - Village Artistique
8. **Rufisque** - 22M FCFA - 400m² - Commercial Centre Ville

---

## 🛠️ Commandes Utiles

```bash
# Démarrer le serveur de développement
npm run dev

# Voir les données dans la console
psql "postgresql://postgres.pwpjcjxosjgdkcvantoo:Mandriva123.@aws-0-eu-west-3.pooler.supabase.com:5432/postgres" \\
  -c "SELECT title, city FROM listings;"

# Réinsérer les données si besoin
psql "postgresql://postgres.pwpjcjxosjgdkcvantoo:Mandriva123.@aws-0-eu-west-3.pooler.supabase.com:5432/postgres" \\
  -f database/migrations/004_seed_data.sql
```

---

## 📚 Documentation Complète

Consultez `GUIDE_DONNEES.md` pour:
- Guide complet d'insertion de données
- Création de composants React
- Exemples avancés
- Requêtes SQL complexes

---

## 🎯 Prochaine Étape

Ouvrez `app/page.tsx` et remplacez:
- `properties` → `listings`
- Adaptez les champs (ex: `surface_area` → `area_sqm`)

**Votre application est prête à afficher les données réelles !** 🎉
