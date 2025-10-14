# 📊 Mapping Base de Données - Fatimmo

## ✅ Structure RÉELLE de la Table `listings`

### Champs Principaux

| Champ DB | Type | Description | Exemple |
|----------|------|-------------|---------|
| `id` | UUID | Identifiant unique | `f0884a24-...` |
| `slug` | VARCHAR(255) | URL SEO-friendly | `terrain-titr-500m-almadies-vue-mer` |
| `seller_id` | UUID | Référence à `sellers` | `...` |
| `title` | VARCHAR(255) | Titre de l'annonce | `"Terrain Titré 500m² Almadies Vue Mer"` |
| `excerpt` | VARCHAR(200) | Résumé court | `"Magnifique terrain titré..."` |
| `description` | TEXT | Description complète | - |
| `description_html` | TEXT | Description HTML | - |

### Prix et Surface

| Champ DB | Type | Contrainte | Exemple |
|----------|------|------------|---------|
| `price_fcfa` | NUMERIC(14,0) | NOT NULL, > 0 | `75000000` |
| `price_period` | VARCHAR(20) | `month` ou `year` (pour location) | `null` |
| `price_negotiable` | BOOLEAN | Défaut: `true` | `true` |
| `area_sqm` | INTEGER | NOT NULL, > 0 | `500` |
| `price_per_sqm` | NUMERIC(14,2) | Calculé automatiquement | `150000.00` |

### Type et Statut

| Champ DB | Type | Valeurs Possibles |
|----------|------|-------------------|
| `intent` | VARCHAR(10) | `sale`, `rent` |
| `category` | VARCHAR(50) | `urbain`, `residentiel`, `agricole`, `commercial`, `rural` |
| `legal_status` | VARCHAR(50) | `titre_foncier`, `bail`, `deliberation`, `autre` |
| `status` | VARCHAR(20) | `draft`, `published`, `archived`, `sold`, `rented` |

### Localisation

| Champ DB | Type | Description | Exemple |
|----------|------|-------------|---------|
| `city` | VARCHAR(100) | Ville | `"Dakar"` |
| `region` | VARCHAR(100) | Région | `"Dakar"` |
| `neighborhood` | VARCHAR(100) | Quartier | `"Almadies"` |
| `address` | TEXT | Adresse complète | - |
| `distance_ref` | VARCHAR(100) | Référence de distance | `"48 min de Dakar"` |
| `lat` | DOUBLE PRECISION | Latitude | `14.7392` |
| `lng` | DOUBLE PRECISION | Longitude | `-17.5022` |
| `geom` | GEOMETRY(Polygon) | Géométrie PostGIS | - |
| `show_exact_location` | BOOLEAN | Afficher position exacte | `false` |

### Features (JSONB) ⚠️ IMPORTANT

**Structure RÉELLE dans la base:**

```json
{
  "bordered": true,
  "serviced": true,
  "soil_type": "sablonneux",
  "zoning": "residential",
  "slope": "flat",
  "title_deed_available": true
}
```

**Mapping UI → DB:**

| Nom UI (Frontend) | Nom DB (JSONB) | Type | Description |
|-------------------|----------------|------|-------------|
| `Viabilisé` | `serviced` | `boolean` | Eau + Électricité disponibles |
| `Borné` | `bordered` | `boolean` | Terrain borné |
| `Titre Foncier Dispo` | `title_deed_available` | `boolean` | TF disponible |
| `Type de sol` | `soil_type` | `string` | `sablonneux`, `argileux`, etc. |
| `Zonage` | `zoning` | `string` | `residential`, `commercial`, `agricultural` |
| `Pente` | `slope` | `string` | `flat`, `gentle`, `moderate` |

### Proximity (JSONB)

**Structure:**

```json
{
  "beach": "500m",
  "school": "2km",
  "hospital": "3km",
  "market": "1.5km"
}
```

### Badges (ARRAY)

```sql
badges: text[] = '{"Titre Foncier", "Viabilisé", "Vue Mer", "Sécurisé"}'
```

**Badges spéciaux pour le frontend:**
- `verified` → Badge vert "Vérifié"
- `featured` → Badge violet "⭐ Vedette"
- `new` → Badge rouge "Nouveau"

### Médias

| Champ DB | Type | Description |
|----------|------|-------------|
| `cover_image_url` | TEXT | Image de couverture principale |

**Table `media` (relation):**
- `url` - URL de l'image/vidéo
- `type` - `image`, `video`, `drone`, `panorama`
- `is_cover` - Boolean
- `display_order` - Ordre d'affichage

### Analytics

| Champ DB | Type | Défaut |
|----------|------|--------|
| `view_count` | INTEGER | `0` |
| `favorite_count` | INTEGER | `0` |
| `contact_count` | INTEGER | `0` |

### SEO

| Champ DB | Type |
|----------|------|
| `meta_description` | TEXT |
| `meta_keywords` | TEXT[] |
| `neighborhood_info` | TEXT |

### Timestamps

| Champ DB | Type | Description |
|----------|------|-------------|
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Dernière modification |
| `published_at` | TIMESTAMPTZ | Date de publication |

---

## 🔗 Relations

### `sellers` (1-N)

```sql
seller_id → sellers.id
```

**Champs sellers:**
- `type`: `agency` | `owner`
- `name`: Nom
- `phone_e164`: Format international (+221...)
- `email`: Email
- `verified`: Boolean
- `whatsapp_number`: Numéro WhatsApp

### `media` (1-N)

```sql
listing_id → listings.id
```

---

## 🎯 Requête Complète Recommandée

```typescript
const { data } = await supabase
  .from('listings')
  .select(`
    *,
    seller:sellers(
      type,
      name,
      verified,
      phone_e164,
      whatsapp_number
    ),
    media(
      url,
      type,
      is_cover,
      display_order,
      title
    )
  `)
  .eq('status', 'published')
  .eq('intent', 'sale')
  .order('created_at', { ascending: false })
```

---

## ⚠️ Points d'Attention

### 1. Features JSONB
❌ **NE PAS utiliser:**
- `road_access`, `water`, `electricity`, `near_sea`, `fenced`

✅ **UTILISER:**
- `bordered`, `serviced`, `title_deed_available`, `soil_type`, `zoning`, `slope`

### 2. Format Téléphone
- Toujours en E.164: `+221771234567`
- Pas d'espaces, pas de tirets

### 3. Filtres sur JSONB
```typescript
// ✅ Correct
query.contains('features', { bordered: true })

// ❌ Incorrect
query.eq('features.bordered', true)
```

### 4. Prix
- Toujours en FCFA entier (pas de décimales)
- Utiliser `price_fcfa`, pas `price`

---

## 📝 Checklist de Conformité

- [x] Utiliser `price_fcfa` au lieu de `price`
- [x] Utiliser `area_sqm` au lieu de `surface_area`
- [x] Features: `bordered` pas `bounded`
- [x] Features: `serviced` pas `water` + `electricity`
- [x] Features: `title_deed_available` pas `has_title`
- [x] Statut légal: `titre_foncier`, `bail`, `deliberation`, `autre`
- [x] Catégories: `urbain`, `residentiel`, `agricole`, `commercial`, `rural`
- [x] Intent: `sale`, `rent`
- [x] Jointure `seller:sellers(...)` dans le SELECT

---

*Dernière mise à jour: 2025-10-12*
*Base: PostgreSQL via Supabase*
