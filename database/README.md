# 🗄️ Database Migrations - Fatimmo

Ce dossier contient les migrations SQL pour la base de données Fatimmo optimisée pour la vente de terrains au Sénégal.

## 📋 Ordre d'exécution des migrations

### 1. `001_properties_schema.sql`
**Schéma complet de la table properties**

Crée la table `properties` avec tous les champs nécessaires pour :
- Vente de terrains (TF, bornage, viabilisation)
- Géolocalisation GPS
- Médias (photos, vidéos drone, visites 360°)
- SEO (slug, meta tags, mots-clés)
- Analytics (vues, demandes, favoris)
- Paiements échelonnés

**Fonctionnalités incluses :**
- ✅ 60+ colonnes optimisées
- ✅ Index de performance
- ✅ Full-text search
- ✅ Trigger auto-update `updated_at`
- ✅ Génération automatique de slug SEO
- ✅ Fonction `increment_property_views()`

### 2. `002_rls_policies.sql`
**Row Level Security (RLS) - Sécurité**

Configure les politiques de sécurité :
- 👀 Lecture publique des propriétés actives
- 🔒 Utilisateurs voient leurs propres annonces
- ✏️ Modification réservée au propriétaire
- 👑 Admins ont tous les droits
- 📊 Vérification du quota mensuel

**Fonctionnalités incluses :**
- ✅ 9 policies RLS
- ✅ Gestion automatique des quotas
- ✅ Vues SQL utiles
- ✅ Fonction reset mensuel

### 3. `003_admin_quota.sql`
**Quota illimité pour admins**

Ajuste les limites pour les comptes admin :
- Quota mensuel : 999,999
- Propriétés max : 999,999

## 🚀 Comment exécuter les migrations

### Option 1 : Via Supabase Dashboard (Recommandé)

1. Allez sur https://app.supabase.com/project/pwpjcjxosjgdkcvantoo/editor
2. Cliquez sur "SQL Editor" dans le menu gauche
3. Cliquez sur "+ New query"
4. Copiez-collez le contenu de chaque fichier dans l'ordre
5. Cliquez sur "Run" pour exécuter

### Option 2 : Via psql (ligne de commande)

```bash
# Se connecter
psql postgresql://postgres.pwpjcjxosjgdkcvantoo:Mandriva123.@aws-0-eu-west-3.pooler.supabase.com:5432/postgres

# Exécuter les migrations
\i database/migrations/001_properties_schema.sql
\i database/migrations/002_rls_policies.sql
\i database/migrations/003_admin_quota.sql
```

### Option 3 : Via script Node.js

```bash
npm run migrate
```

## 📊 Structure de la table properties

### Catégories de champs

#### 🏷️ Identifiants
- `id`, `user_id`, `slug`

#### 📝 Informations de base
- `title`, `description`, `property_type`, `transaction_type`, `status`

#### 💰 Prix et paiement
- `price`, `payment_plans`, `discount_percentage`

#### 📍 Localisation
- `city`, `district`, `latitude`, `longitude`, `nearby_amenities`

#### 📐 Caractéristiques terrain
- `surface_area`, `is_titled`, `is_bounded`, `is_serviced`
- `soil_type`, `zoning`, `slope`

#### 🏛️ Légal
- `title_deed_number`, `cadastral_reference`, `plot_number`

#### 📸 Médias
- `images`, `video_url`, `virtual_tour_url`, `documents`

#### 🔍 SEO
- `seo_title`, `seo_description`, `seo_keywords`

#### 📊 Analytics
- `views_count`, `inquiries_count`, `favorites_count`

## 🔧 Fonctions utiles

### Incrémenter les vues
```sql
SELECT increment_property_views('property-uuid-here');
```

### Réinitialiser les compteurs mensuels
```sql
SELECT reset_monthly_ads_count();
```

### Voir les propriétés actives
```sql
SELECT * FROM v_active_properties;
```

### Statistiques par utilisateur
```sql
SELECT * FROM v_user_properties_stats;
```

## ⚠️ Notes importantes

1. **Backup avant migration** : Faites un backup de votre base avant d'exécuter
2. **Ordre obligatoire** : Respectez l'ordre des migrations
3. **Permissions** : Assurez-vous d'avoir les droits superuser
4. **RLS** : Les policies RLS sont activées par défaut

## 🔐 Sécurité

- ✅ RLS activé sur toutes les tables
- ✅ Seuls les admins peuvent modifier les propriétés des autres
- ✅ Vérification automatique des quotas
- ✅ Soft delete (conservation des données)

## 🐛 Dépannage

### Erreur: "relation already exists"
La table existe déjà. Utilisez `DROP TABLE properties CASCADE;` (⚠️ perte de données)

### Erreur: "permission denied"
Vous n'avez pas les droits. Connectez-vous en tant que postgres.

### RLS bloque mes requêtes
Vérifiez que vous êtes authentifié avec le bon user_id.

## 📞 Support

Pour toute question, contactez l'administrateur système.
