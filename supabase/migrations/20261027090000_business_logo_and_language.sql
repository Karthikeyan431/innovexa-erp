-- Innovexa ERP: business logo storage and language choice.
-- Logos live in a private storage bucket, one folder per business
-- ("<business_id>/logo"). Users can only read and write their own
-- business's folder.

-- ---------------------------------------------------------------------------
-- businesses: logo path and allowed languages
-- ---------------------------------------------------------------------------

alter table public.businesses
  add column logo_path text;

alter table public.businesses
  add constraint businesses_language_check check (language in ('ta', 'en'));

-- Fix: the original UPI check used {2,256}, but PostgreSQL regex repeat
-- counts cannot exceed 255, so any non-empty UPI ID failed with
-- "invalid regular expression".
alter table public.businesses
  drop constraint businesses_upi_id_check;

alter table public.businesses
  add constraint businesses_upi_id_check
  check (upi_id is null or upi_id ~ '^[A-Za-z0-9._-]{2,255}@[A-Za-z]{2,64}$');

-- ---------------------------------------------------------------------------
-- Storage bucket for logos (private, images only, max 2 MB)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-logos',
  'business-logos',
  false,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Storage policies: the first folder of the file path must be the user's
-- own business id.
-- ---------------------------------------------------------------------------

create policy "Members can read their business logo"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = (select public.current_business_id())::text
  );

create policy "Members can upload their business logo"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = (select public.current_business_id())::text
  );

create policy "Members can replace their business logo"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = (select public.current_business_id())::text
  )
  with check (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = (select public.current_business_id())::text
  );

create policy "Members can delete their business logo"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = (select public.current_business_id())::text
  );
