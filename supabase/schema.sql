create extension if not exists pgcrypto;

create table if not exists public.manga (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  native_title text, author text, artist text, description text, cover_url text,
  country text not null default 'JP', language text not null default 'ja', genres text[] default '{}',
  status text not null default 'ongoing', release_date date, official_url text,
  featured boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(), manga_id uuid not null references public.manga(id) on delete cascade,
  chapter_number numeric(10,2) not null, title text, url text, cover_url text, release_date date,
  language text not null default 'ja', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(manga_id, chapter_number, language)
);
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  excerpt text, content text, image_url text, country text not null default 'JP', source_name text,
  source_url text, published_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create table if not exists public.publishers (
  id uuid primary key default gen_random_uuid(), name text unique not null, country text, logo_url text,
  website_url text, description text, created_at timestamptz not null default now()
);
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('admin','editor')), created_at timestamptz not null default now()
);

alter table public.manga enable row level security;
alter table public.chapters enable row level security;
alter table public.news enable row level security;
alter table public.publishers enable row level security;
alter table public.profiles enable row level security;

-- Public content is readable. Writes require an authenticated session.
drop policy if exists "Public can read manga" on public.manga;
create policy "Public can read manga" on public.manga for select using (true);
drop policy if exists "Public can read chapters" on public.chapters;
create policy "Public can read chapters" on public.chapters for select using (true);
drop policy if exists "Authenticated users can insert chapters" on public.chapters;
create policy "Authenticated users can insert chapters" on public.chapters for insert to authenticated with check (true);
drop policy if exists "Authenticated users can update chapters" on public.chapters;
create policy "Authenticated users can update chapters" on public.chapters for update to authenticated using (true) with check (true);
drop policy if exists "Authenticated users can delete chapters" on public.chapters;
create policy "Authenticated users can delete chapters" on public.chapters for delete to authenticated using (true);
drop policy if exists "Public can read news" on public.news;
create policy "Public can read news" on public.news for select using (true);
drop policy if exists "Public can read publishers" on public.publishers;
create policy "Public can read publishers" on public.publishers for select using (true);
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Authenticated users can insert manga" on public.manga;
create policy "Authenticated users can insert manga" on public.manga for insert to authenticated with check (true);
drop policy if exists "Authenticated users can update manga" on public.manga;
create policy "Authenticated users can update manga" on public.manga for update to authenticated using (true) with check (true);
drop policy if exists "Authenticated users can insert news" on public.news;
create policy "Authenticated users can insert news" on public.news for insert to authenticated with check (true);
drop policy if exists "Authenticated users can update news" on public.news;
create policy "Authenticated users can update news" on public.news for update to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public) values ('manga-covers','manga-covers',true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('chapter-covers','chapter-covers',true) on conflict (id) do nothing;
drop policy if exists "Public can view manga covers" on storage.objects;
create policy "Public can view manga covers" on storage.objects for select using (bucket_id='manga-covers');
drop policy if exists "Authenticated can upload manga covers" on storage.objects;
create policy "Authenticated can upload manga covers" on storage.objects for insert to authenticated with check (bucket_id='manga-covers');
drop policy if exists "Authenticated can update manga covers" on storage.objects;
create policy "Authenticated can update manga covers" on storage.objects for update to authenticated using (bucket_id='manga-covers');
drop policy if exists "Authenticated can delete manga covers" on storage.objects;
create policy "Authenticated can delete manga covers" on storage.objects for delete to authenticated using (bucket_id='manga-covers');
drop policy if exists "Public can view chapter covers" on storage.objects;
create policy "Public can view chapter covers" on storage.objects for select using (bucket_id='chapter-covers');
drop policy if exists "Authenticated can upload chapter covers" on storage.objects;
create policy "Authenticated can upload chapter covers" on storage.objects for insert to authenticated with check (bucket_id='chapter-covers');
drop policy if exists "Authenticated can update chapter covers" on storage.objects;
create policy "Authenticated can update chapter covers" on storage.objects for update to authenticated using (bucket_id='chapter-covers');
drop policy if exists "Authenticated can delete chapter covers" on storage.objects;
create policy "Authenticated can delete chapter covers" on storage.objects for delete to authenticated using (bucket_id='chapter-covers');
