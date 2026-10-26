-- Innovexa ERP: businesses and profiles, with row-level security.
-- Every signed-in user belongs to exactly one business (through profiles)
-- and can only see and change data that belongs to that business.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.businesses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) > 0),
  phone       text,
  address     text,
  gstin       text check (gstin is null or gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$'),
  upi_id      text check (upi_id is null or upi_id ~ '^[A-Za-z0-9._-]{2,256}@[A-Za-z]{2,64}$'),
  language    text not null default 'en',
  created_at  timestamptz not null default now()
);

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  business_id  uuid not null references public.businesses (id) on delete cascade,
  role         text not null default 'staff' check (role in ('owner', 'manager', 'staff'))
);

create index profiles_business_id_idx on public.profiles (business_id);

-- ---------------------------------------------------------------------------
-- Helpers used by the policies.
-- SECURITY DEFINER so they can read profiles without recursing into the
-- profiles RLS policies. Both return null/false when not signed in.
-- ---------------------------------------------------------------------------

create function public.current_business_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select business_id from public.profiles where id = (select auth.uid())
$$;

create function public.current_user_is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'owner'
  )
$$;

revoke execute on function public.current_business_id() from public, anon;
revoke execute on function public.current_user_is_owner() from public, anon;
grant execute on function public.current_business_id() to authenticated;
grant execute on function public.current_user_is_owner() to authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.businesses enable row level security;
alter table public.profiles   enable row level security;

-- businesses: members can read and update their own business.
-- No insert/delete policies: a business is created through
-- create_business_for_current_user() below.
create policy "Members can read their business"
  on public.businesses for select
  to authenticated
  using (id = (select public.current_business_id()));

create policy "Members can update their business"
  on public.businesses for update
  to authenticated
  using (id = (select public.current_business_id()))
  with check (id = (select public.current_business_id()));

-- profiles: members can see everyone in their business.
create policy "Members can read profiles in their business"
  on public.profiles for select
  to authenticated
  using (business_id = (select public.current_business_id()));

-- Only owners can change or remove profiles, and only within their business.
-- Other users cannot change their own role or move to another business.
create policy "Owners can update profiles in their business"
  on public.profiles for update
  to authenticated
  using (
    business_id = (select public.current_business_id())
    and (select public.current_user_is_owner())
  )
  with check (business_id = (select public.current_business_id()));

create policy "Owners can delete profiles in their business"
  on public.profiles for delete
  to authenticated
  using (
    business_id = (select public.current_business_id())
    and (select public.current_user_is_owner())
  );

-- ---------------------------------------------------------------------------
-- Onboarding: a signed-in user with no business creates one and becomes its
-- owner in a single step. This is a function rather than an insert policy,
-- because an insert policy on profiles would let a user attach themselves
-- to a business that is not theirs.
-- ---------------------------------------------------------------------------

create function public.create_business_for_current_user(
  p_name      text,
  p_phone     text default null,
  p_address   text default null,
  p_gstin     text default null,
  p_upi_id    text default null,
  p_language  text default 'en'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id     uuid := auth.uid();
  v_business_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not signed in';
  end if;

  if exists (select 1 from public.profiles where id = v_user_id) then
    raise exception 'User already belongs to a business';
  end if;

  insert into public.businesses (name, phone, address, gstin, upi_id, language)
  values (p_name, p_phone, p_address, p_gstin, p_upi_id, coalesce(p_language, 'en'))
  returning id into v_business_id;

  insert into public.profiles (id, business_id, role)
  values (v_user_id, v_business_id, 'owner');

  return v_business_id;
end;
$$;

revoke execute on function public.create_business_for_current_user(text, text, text, text, text, text) from public, anon;
grant execute on function public.create_business_for_current_user(text, text, text, text, text, text) to authenticated;
