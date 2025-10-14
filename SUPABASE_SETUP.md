# Configuration Supabase - Guide Etape par Etape

## Probleme Actuel
Le test Supabase echoue probablement car:
- La table `listings` n'existe pas encore
- Les policies RLS ne sont pas configurees
- Les buckets de storage ne sont pas crees

## Solution: Initialiser la Base de Donnees

### Etape 1: Acceder au SQL Editor

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous a votre compte
3. Selectionnez votre projet: **pwpjcjxosjgdkcvantoo**
4. Dans le menu lateral gauche, cliquez sur **SQL Editor**

### Etape 2: Executer le Script SQL

1. Cliquez sur **New query**
2. Ouvrez le fichier `scripts/setup-database.sql` de ce projet
3. Copiez TOUT le contenu du fichier
4. Collez-le dans l'editeur SQL de Supabase
5. Cliquez sur **Run** (ou appuyez sur Ctrl+Enter)

Le script va creer:
- ✅ Table `sellers` (vendeurs)
- ✅ Table `listings` (annonces)
- ✅ Table `media` (photos/videos)
- ✅ Table `leads` (contacts)
- ✅ Policies RLS (securite)
- ✅ Index (performance)
- ✅ Donnees de test

### Etape 3: Creer les Buckets de Storage

1. Dans le menu lateral, cliquez sur **Storage**
2. Cliquez sur **Create bucket**
3. Creez ces 3 buckets:

#### Bucket 1: listing-images
- Name: `listing-images`
- Public: ✅ **OUI**
- File size limit: 10 MB
- Allowed MIME types: `image/jpeg,image/jpg,image/png,image/webp`

#### Bucket 2: listing-docs
- Name: `listing-docs`
- Public: ❌ **NON** (prive)
- File size limit: 5 MB
- Allowed MIME types: `application/pdf,image/jpeg,image/jpg,image/png`

#### Bucket 3: avatars
- Name: `avatars`
- Public: ✅ **OUI**
- File size limit: 2 MB
- Allowed MIME types: `image/jpeg,image/jpg,image/png,image/webp`

### Etape 4: Configurer les Policies de Storage

Pour chaque bucket, vous devez ajouter des policies:

#### Pour listing-images et avatars (publics):

```sql
-- Allow public read access
CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

-- Allow authenticated uploads
CREATE POLICY "Authenticated can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listing-images' AND auth.role() = 'authenticated');

-- Allow service role full access
CREATE POLICY "Service role can manage"
ON storage.objects FOR ALL
USING (bucket_id = 'listing-images' AND auth.role() = 'service_role');
```

Remplacez 'listing-images' par 'avatars' pour le bucket avatars.

#### Pour listing-docs (prive):

```sql
-- Only service role can access
CREATE POLICY "Service role can manage docs"
ON storage.objects FOR ALL
USING (bucket_id = 'listing-docs' AND auth.role() = 'service_role');
```

### Etape 5: Verifier l'Installation

1. Retournez sur votre application: `http://localhost:3000/test-api`
2. Cliquez sur **Tester** pour Supabase
3. Vous devriez voir:
   - ✅ Connection: OK
   - ✅ Database: connected
   - ✅ Listings count: 1 (donnee de test)
   - ✅ Storage: 3 buckets

## Verification Rapide via SQL

Pour verifier que tout est bien cree, executez cette requete dans le SQL Editor:

```sql
-- Verifier les tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('sellers', 'listings', 'media', 'leads');

-- Verifier les donnees
SELECT COUNT(*) as total_listings FROM listings;
SELECT COUNT(*) as total_sellers FROM sellers;

-- Verifier les buckets
SELECT * FROM storage.buckets;
```

## Problemes Courants

### Erreur: "relation listings does not exist"
➡️ Vous n'avez pas execute le script SQL. Retournez a l'Etape 2.

### Erreur: "permission denied"
➡️ Les policies RLS ne sont pas configurees. Verifiez l'Etape 2 (le script inclut les policies).

### Erreur: "bucket not found"
➡️ Les buckets de storage n'existent pas. Suivez l'Etape 3.

### Le test fonctionne mais count = 0
➡️ Normal si vous n'avez pas de vraies annonces. Les donnees de test sont optionnelles.

## Prochaines Etapes

Une fois Supabase configure:
1. ✅ Tous les tests sur `/test-api` devraient etre verts
2. ✅ Le formulaire de contact pourra enregistrer les leads
3. ✅ L'upload d'images fonctionnera
4. ✅ Les API BFF seront operationnelles

## Support

Si vous rencontrez des problemes:
1. Verifiez les logs Supabase (Dashboard > Logs)
2. Verifiez que votre projet Supabase n'est pas en pause
3. Verifiez que la facturation est activee (plan gratuit suffit)
