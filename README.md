# JPMangaatlas

Global manga discovery platform for Japan, USA, France and Brazil.

## Stack
- GitHub: source code
- Vercel: deployment
- Supabase Postgres: manga/news/publisher data
- Supabase Storage: public manga cover images
- Supabase Auth: admin/editor login

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Create an admin user in Supabase Authentication.
4. Copy `admin/config.example.js` to `admin/config.js` and add the Supabase URL + anon key. Do not commit private/service-role keys.
5. Deploy the repository to Vercel.
6. Open `/admin/` to sign in and add manga records with cover uploads.

## Content model
Manga records support title, native title, author, artist, description, cover, country, language, genres, status, release date and official URL. News and publisher tables are also included for the next development phase.

JPMangaatlas is intended for lawful manga discovery, news, metadata and official reading/purchase links; it does not provide unauthorized manga scans.
