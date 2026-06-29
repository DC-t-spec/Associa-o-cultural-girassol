create extension if not exists pgcrypto;

create or replace function public.update_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create table if not exists admin_profiles (id uuid primary key references auth.users(id) on delete cascade, email text, full_name text, role text default 'admin', created_at timestamptz default now(), updated_at timestamptz default now());
create or replace function public.is_admin(user_id uuid default auth.uid()) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.admin_profiles where id=user_id and role='admin') $$;

create table if not exists pages (id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, seo_title text, seo_description text, share_image_url text, is_published boolean default true, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists page_sections (id uuid primary key default gen_random_uuid(), page_slug text references pages(slug) on delete cascade, section_key text unique not null, section_name text not null, section_type text not null, order_index int default 0, is_active boolean default true, settings jsonb default '{}'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists section_fields (id uuid primary key default gen_random_uuid(), section_id uuid references page_sections(id) on delete cascade, field_key text not null, field_label text not null, field_type text not null check (field_type in ('text','textarea','richtext','image','video','file','url','color','number','boolean','date','select','json')), field_value text, field_json jsonb, order_index int default 0, created_at timestamptz default now(), updated_at timestamptz default now(), unique(section_id,field_key));
create table if not exists theme_settings (id uuid primary key default gen_random_uuid(), key text unique not null, value text, value_json jsonb, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists media_assets (id uuid primary key default gen_random_uuid(), title text not null, description text, file_url text not null, file_type text not null, mime_type text, alt_text text, storage_path text, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists navigation_items (id uuid primary key default gen_random_uuid(), location text not null check (location in ('main_menu','fiti_menu','footer_menu')), label text not null, url text not null, page_slug text, order_index int default 0, is_active boolean default true, is_external boolean default false, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists social_links (id uuid primary key default gen_random_uuid(), platform text not null, label text, url text not null, is_active boolean default true, order_index int default 0, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists timeline (id uuid primary key default gen_random_uuid(), year text, title text, description text, order_index int, is_active boolean default true, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists projects (id uuid primary key default gen_random_uuid(), title text, description text, image_url text, link text, featured boolean default false, is_active boolean default true, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists impact_stats (id uuid primary key default gen_random_uuid(), label text, value int, suffix text, order_index int, is_active boolean default true, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists gallery (id uuid primary key default gen_random_uuid(), title text, image_url text, category text, description text, alt_text text, is_active boolean default true, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists news (id uuid primary key default gen_random_uuid(), title text, slug text unique, summary text, content text, image_url text, category text, published boolean default false, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists partners (id uuid primary key default gen_random_uuid(), name text, logo_url text, category text, link text, show_on_home boolean default true, show_on_fiti boolean default false, is_active boolean default true, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists fiti_editions (id uuid primary key default gen_random_uuid(), year text, theme text, dates text, locations text, countries text, description text, curatorial_text text, poster_url text, active boolean default false, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists fiti_program (id uuid primary key default gen_random_uuid(), edition_id uuid references fiti_editions(id), date date, time text, title text, company text, country text, venue text, category text, synopsis text, duration text, age_rating text, image_url text, reservation_link text, is_active boolean default true, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists fiti_companies (id uuid primary key default gen_random_uuid(), edition_id uuid references fiti_editions(id), name text, country text, city text, description text, image_url text, social_link text, show_title text, is_active boolean default true, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists fiti_workshops (id uuid primary key default gen_random_uuid(), edition_id uuid references fiti_editions(id), title text, trainer text, date date, time text, venue text, vacancies text, target_audience text, description text, registration_link text, is_active boolean default true, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists fiti_archive (id uuid primary key default gen_random_uuid(), year text, theme text, dates text, description text, poster_url text, program_pdf_url text, gallery jsonb default '[]'::jsonb, video_url text, is_active boolean default true, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists contact_messages (id uuid primary key default gen_random_uuid(), name text, email text, phone text, subject text, message text, type text default 'contacto', status text default 'Novo', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists fiti_applications (id uuid primary key default gen_random_uuid(), type text, company_name text, country text, city text, contact_person text, email text, phone text, show_title text, synopsis text, duration text, team_size text, technical_needs text, video_link text, portfolio_link text, notes text, status text default 'Novo', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists content_revisions (id uuid primary key default gen_random_uuid(), content_type text not null, content_id uuid, previous_value jsonb, new_value jsonb, changed_by uuid, created_at timestamptz default now());

do $$ declare t text; begin foreach t in array array['admin_profiles','pages','page_sections','section_fields','theme_settings','media_assets','navigation_items','social_links','timeline','projects','impact_stats','gallery','news','partners','fiti_editions','fiti_program','fiti_companies','fiti_workshops','fiti_archive','contact_messages','fiti_applications','content_revisions'] loop execute format('alter table public.%I enable row level security', t); end loop; end $$;

do $$ declare t text; begin foreach t in array array['admin_profiles','pages','page_sections','section_fields','theme_settings','media_assets','navigation_items','social_links','timeline','projects','impact_stats','gallery','news','partners','fiti_editions','fiti_program','fiti_companies','fiti_workshops','fiti_archive','contact_messages','fiti_applications'] loop execute format('drop trigger if exists update_%I_updated_at on public.%I', t, t); execute format('create trigger update_%I_updated_at before update on public.%I for each row execute function public.update_updated_at()', t, t); end loop; end $$;

drop policy if exists "Admins manage admin profiles" on admin_profiles;
drop policy if exists "Public read pages" on pages;
drop policy if exists "Public read sections" on page_sections;
drop policy if exists "Public read fields" on section_fields;
drop policy if exists "Public read theme" on theme_settings;
drop policy if exists "Public can read theme settings" on theme_settings;
drop policy if exists "Public read navigation" on navigation_items;
drop policy if exists "Public read socials" on social_links;
drop policy if exists "Public read media" on media_assets;
drop policy if exists "Public can read media assets" on media_assets;
drop policy if exists "Public read published news" on news;
drop policy if exists "Public read active content" on timeline;
drop policy if exists "Public read active projects" on projects;
drop policy if exists "Public read active impact" on impact_stats;
drop policy if exists "Public read active gallery" on gallery;
drop policy if exists "Public read active partners" on partners;
drop policy if exists "Public read active fiti" on fiti_editions;
drop policy if exists "Public read active program" on fiti_program;
drop policy if exists "Public read active companies" on fiti_companies;
drop policy if exists "Public read active workshops" on fiti_workshops;
drop policy if exists "Public read active archive" on fiti_archive;
drop policy if exists "Public insert contact" on contact_messages;
drop policy if exists "Public insert applications" on fiti_applications;
do $$ declare t text; begin foreach t in array array['pages','page_sections','section_fields','theme_settings','media_assets','navigation_items','social_links','timeline','projects','impact_stats','gallery','news','partners','fiti_editions','fiti_program','fiti_companies','fiti_workshops','fiti_archive','contact_messages','fiti_applications','content_revisions'] loop execute format('drop policy if exists "Admin manage %I" on public.%I', t, t); end loop; end $$;
drop policy if exists "Public read site media" on storage.objects;
drop policy if exists "Admins manage site media" on storage.objects;
drop policy if exists "Authenticated upload site media" on storage.objects;
drop policy if exists "Authenticated update site media" on storage.objects;
drop policy if exists "Authenticated delete site media" on storage.objects;

create policy "Admins manage admin profiles" on admin_profiles for all using (public.is_admin() or auth.uid()=id) with check (public.is_admin() or auth.uid()=id);
create policy "Public read pages" on pages for select using (is_published=true);
create policy "Public read sections" on page_sections for select using (is_active=true);
create policy "Public read fields" on section_fields for select using (true);
create policy "Public can read theme settings" on theme_settings for select to anon, authenticated using (true);
create policy "Public read navigation" on navigation_items for select using (is_active=true);
create policy "Public read socials" on social_links for select using (is_active=true);
create policy "Public can read media assets" on media_assets for select to anon, authenticated using (true);
create policy "Public read published news" on news for select using (published=true);
create policy "Public read active content" on timeline for select using (is_active=true);
create policy "Public read active projects" on projects for select using (is_active=true);
create policy "Public read active impact" on impact_stats for select using (is_active=true);
create policy "Public read active gallery" on gallery for select using (is_active=true);
create policy "Public read active partners" on partners for select using (is_active=true);
create policy "Public read active fiti" on fiti_editions for select using (active=true);
create policy "Public read active program" on fiti_program for select using (is_active=true);
create policy "Public read active companies" on fiti_companies for select using (is_active=true);
create policy "Public read active workshops" on fiti_workshops for select using (is_active=true);
create policy "Public read active archive" on fiti_archive for select using (is_active=true);
create policy "Public insert contact" on contact_messages for insert with check (true);
create policy "Public insert applications" on fiti_applications for insert with check (true);

do $$ declare t text; begin foreach t in array array['pages','page_sections','section_fields','theme_settings','media_assets','navigation_items','social_links','timeline','projects','impact_stats','gallery','news','partners','fiti_editions','fiti_program','fiti_companies','fiti_workshops','fiti_archive','contact_messages','fiti_applications','content_revisions'] loop execute format('create policy "Admin manage %I" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t, t); end loop; end $$;

insert into storage.buckets (id,name,public) values ('site-media','site-media',true) on conflict (id) do update set public=true;
create policy "Public read site media" on storage.objects for select to anon, authenticated using (bucket_id='site-media');
create policy "Admins manage site media" on storage.objects for all using (bucket_id='site-media' and public.is_admin()) with check (bucket_id='site-media' and public.is_admin());

-- Supabase Storage policies for Media Library uploads.
-- Create a public bucket named site-media in Supabase Storage before uploading.
drop policy if exists "Authenticated upload site media" on storage.objects;
drop policy if exists "Authenticated update site media" on storage.objects;
drop policy if exists "Authenticated delete site media" on storage.objects;
create policy "Authenticated upload site media" on storage.objects for insert to authenticated with check (bucket_id = 'site-media');
create policy "Authenticated update site media" on storage.objects for update to authenticated using (bucket_id = 'site-media') with check (bucket_id = 'site-media');
create policy "Authenticated delete site media" on storage.objects for delete to authenticated using (bucket_id = 'site-media');
