# Guide SEO - SenImmobilier

Ce document décrit toutes les optimisations SEO implémentées dans le projet SenImmobilier et comment les maintenir.

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Fichiers SEO générés automatiquement](#fichiers-seo-générés-automatiquement)
3. [Métadonnées et Open Graph](#métadonnées-et-open-graph)
4. [Schema.org JSON-LD](#schemaorg-json-ld)
5. [Optimisations des images](#optimisations-des-images)
6. [URLs canoniques](#urls-canoniques)
7. [Configuration requise](#configuration-requise)
8. [Checklist de déploiement](#checklist-de-déploiement)
9. [Outils de validation](#outils-de-validation)

---

## Vue d'ensemble

SenImmobilier est optimisé pour le SEO avec les meilleures pratiques Next.js 15 :

✅ **Sitemap.xml dynamique** - Généré automatiquement depuis la base de données
✅ **Robots.txt dynamique** - Configuration pour les moteurs de recherche
✅ **Metadata API** - Métadonnées riches sur toutes les pages
✅ **Schema.org JSON-LD** - Structured data pour Google Rich Results
✅ **Open Graph & Twitter Cards** - Prévisualisations sociales optimisées
✅ **Canonical URLs** - Prévention du duplicate content
✅ **Images optimisées** - AVIF/WebP, lazy loading, responsive
✅ **Performance** - Core Web Vitals optimisés

---

## Fichiers SEO générés automatiquement

### 1. robots.txt

**Fichier**: `app/robots.ts`

Génère automatiquement le fichier `/robots.txt` avec :
- Autorisation d'indexation pour tous les robots sauf GPTBot
- Blocage des routes sensibles (/api/, /admin/, /login, etc.)
- Référence au sitemap

```typescript
// Les règles sont dans app/robots.ts
```

**Test**: https://senimmobilier.sn/robots.txt

### 2. sitemap.xml

**Fichier**: `app/sitemap.ts`

Génère automatiquement le sitemap avec :
- ✅ Pages statiques (accueil, terrains, contact, etc.)
- ✅ Tous les terrains publiés (récupérés depuis Supabase)
- ✅ Pages de filtrage par ville
- ✅ Dates de modification (lastModified)
- ✅ Fréquence de mise à jour (changeFrequency)
- ✅ Priorités adaptées

**Test**: https://senimmobilier.sn/sitemap.xml

**Revalidation**: Le sitemap se régénère automatiquement toutes les 5 minutes (grâce au `revalidate`)

---

## Métadonnées et Open Graph

### Configuration centrale

**Fichier**: `lib/seo-config.ts`

Contient :
- `defaultMetadata` : Métadonnées par défaut du site
- `generateTerrainMetadata()` : Génère les métadonnées pour un terrain
- `generateTerrainsListMetadata()` : Génère les métadonnées pour les listings

### Métadonnées implémentées

#### Page d'accueil
- **Title**: "SenImmobilier - Achat et Vente de Terrains au Sénégal"
- **Description**: Optimisée pour les mots-clés principaux
- **Keywords**: terrain Sénégal, Dakar, Saly, titre foncier, etc.
- **Open Graph**: Image 1200x630, informations complètes
- **Twitter Card**: summary_large_image

#### Page Terrains (liste)
- **Métadonnées dynamiques** selon les filtres (ville, catégorie)
- **Compteur de résultats** dans le title et description
- **URLs canoniques** pour chaque combinaison de filtres

#### Page détail d'un terrain
- **Title**: "Titre du terrain - Prix FCFA"
- **Description**: Générée depuis l'excerpt ou les infos du terrain
- **Keywords**: Ville, catégorie, statut légal
- **Image**: Cover image du terrain
- **URLs canoniques**

---

## Schema.org JSON-LD

### Composants créés

**Fichier**: `components/seo/JsonLd.tsx`

#### 1. RealEstateListingJsonLd
Schéma pour chaque terrain :
```json
{
  "@type": "RealEstateListing",
  "name": "Titre",
  "price": 15000000,
  "priceCurrency": "XOF",
  "address": {...},
  "geo": {...},
  "floorSize": {...},
  "seller": {...}
}
```

**Implémenté sur**: Page détail terrain (`app/terrains/[slug]/page.tsx`)

#### 2. OrganizationJsonLd
Schéma pour l'organisation SenImmobilier :
```json
{
  "@type": "RealEstateAgent",
  "name": "SenImmobilier",
  "url": "https://senimmobilier.sn",
  "logo": "...",
  "areaServed": ["Dakar", "Saly", "Mbour", "Thiès"]
}
```

**Implémenté sur**: Page d'accueil (`app/page.tsx`)

#### 3. WebSiteJsonLd
Schéma pour le site web avec SearchAction :
```json
{
  "@type": "WebSite",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://senimmobilier.sn/terrains?search={search_term_string}"
  }
}
```

**Implémenté sur**: Page d'accueil

#### 4. BreadcrumbJsonLd
Fil d'Ariane pour la navigation :
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [...]
}
```

**Implémenté sur**: Page détail terrain

### Bénéfices attendus

✅ **Rich Results** dans Google (prix, localisation, rating potentiel)
✅ **Featured Snippets** pour les recherches immobilières
✅ **Google Maps Integration** avec coordonnées GPS
✅ **Voice Search** optimisé avec structured data

---

## Optimisations des images

### Configuration Next.js

**Fichier**: `next.config.ts`

```typescript
images: {
  formats: ['image/avif', 'image/webp'],  // Formats modernes
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,  // Cache 60 secondes
}
```

### Implémentation par composant

| Composant | Sizes | Loading | Quality |
|-----------|-------|---------|---------|
| PropertyCard | `(max-width: 640px) 100vw, 33vw` | lazy (sauf 1ère) | 85 |
| TerrainCard | `(max-width: 640px) 100vw, 33vw` | lazy | 85 |
| TerrainGallery (hero) | `100vw` | priority | 90 |
| TerrainGallery (thumbs) | `64px` | lazy | 60 |
| HeroSection | `100vw` | priority | 90 |
| Header (logo) | width/height fixes | priority | 100 |

### Bénéfices

- **-50% de poids** avec AVIF/WebP
- **LCP optimisé** avec priority sur images above-the-fold
- **Lazy loading** pour images below-the-fold
- **Responsive** adapté à chaque device

---

## URLs canoniques

### Configuration

Toutes les pages ont des URLs canoniques configurées via :

```typescript
alternates: {
  canonical: 'https://senimmobilier.sn/page-url',
}
```

### Pages avec canonical

✅ Page d'accueil
✅ Page terrains (avec et sans filtres)
✅ Page détail terrain
✅ Pages statiques (contact, partenaires, pro)

### Prévention du duplicate content

- Les pages filtrées ont des canonicals uniques
- Les paramètres d'URL sont normalisés
- Les trailing slashes sont gérés automatiquement par Next.js

---

## Configuration requise

### 1. Variables d'environnement

Ajouter dans `.env.local` :

```bash
# Base URL pour production (OBLIGATOIRE pour SEO)
NEXT_PUBLIC_BASE_URL=https://senimmobilier.sn

# Google Search Console (optionnel)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code

# Social Media (optionnel mais recommandé)
NEXT_PUBLIC_TWITTER_HANDLE=@senimmobilier
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/senimmobilier
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/senimmobilier
```

### 2. Image Open Graph

Créer une image `/public/images/og-image.jpg` :
- **Dimensions**: 1200 x 630 pixels
- **Format**: JPG ou PNG
- **Poids**: < 300KB
- **Contenu**: Logo + slogan + visuel terrain

---

## Checklist de déploiement

### Avant le déploiement

- [ ] Définir `NEXT_PUBLIC_BASE_URL` dans Vercel/serveur
- [ ] Créer l'image Open Graph (`og-image.jpg`)
- [ ] Vérifier que Supabase est accessible
- [ ] Tester en local : `npm run build`

### Après le déploiement

- [ ] Vérifier `/robots.txt` sur le domaine
- [ ] Vérifier `/sitemap.xml` sur le domaine
- [ ] Soumettre le sitemap à Google Search Console
- [ ] Soumettre le sitemap à Bing Webmaster Tools
- [ ] Vérifier les métadonnées avec Facebook Debugger
- [ ] Vérifier les métadonnées avec Twitter Card Validator
- [ ] Tester les rich results avec Google Rich Results Test
- [ ] Configurer Google Analytics (optionnel)

---

## Outils de validation

### 1. Google Search Console
- URL: https://search.google.com/search-console
- **Actions** :
  - Ajouter la propriété senimmobilier.sn
  - Soumettre le sitemap
  - Vérifier l'indexation
  - Surveiller les erreurs

### 2. Google Rich Results Test
- URL: https://search.google.com/test/rich-results
- **Test** : Chaque page de terrain individuelle
- **Vérifier** : RealEstateListing schema

### 3. Facebook Sharing Debugger
- URL: https://developers.facebook.com/tools/debug/
- **Test** : Page d'accueil + quelques terrains
- **Vérifier** : Image, title, description

### 4. Twitter Card Validator
- URL: https://cards-dev.twitter.com/validator
- **Test** : Page d'accueil + quelques terrains
- **Vérifier** : Large image card

### 5. Schema.org Validator
- URL: https://validator.schema.org/
- **Test** : Copier le HTML source d'une page
- **Vérifier** : Aucune erreur dans le JSON-LD

### 6. PageSpeed Insights
- URL: https://pagespeed.web.dev/
- **Test** : Page d'accueil + page terrain
- **Cible** :
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

---

## Maintenance continue

### Hebdomadaire
- Vérifier les erreurs dans Google Search Console
- Surveiller les performances dans PageSpeed Insights

### Mensuel
- Analyser le trafic organique
- Identifier les pages à améliorer
- Mettre à jour les keywords si besoin

### Trimestriel
- Audit SEO complet
- Vérifier les backlinks
- Optimiser les contenus sous-performants

---

## Ressources supplémentaires

- [Next.js SEO Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org Real Estate](https://schema.org/RealEstateListing)
- [Core Web Vitals](https://web.dev/vitals/)

---

**Dernière mise à jour**: 2025-10-15
**Version**: 1.0.0
