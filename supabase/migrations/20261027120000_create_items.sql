-- Innovexa ERP: items, with row-level security.
-- Every item belongs to one business. Users can only see, add, change and
-- delete items of their own business.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table public.items (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null default public.current_business_id()
                    references public.businesses (id) on delete cascade,
  name            text not null check (length(trim(name)) between 1 and 200),
  category        text check (category is null or length(trim(category)) between 1 and 100),
  unit            text not null default 'pcs'
                    check (unit in ('pcs', 'kg', 'g', 'l', 'ml', 'm', 'box', 'pack', 'dozen')),
  purchase_price  numeric(12, 2) check (purchase_price is null or purchase_price >= 0),
  selling_price   numeric(12, 2) not null check (selling_price >= 0),
  gst_rate        numeric(5, 2) not null default 0 check (gst_rate between 0 and 100),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index items_business_id_idx on public.items (business_id);

-- No two items with the same name (ignoring case) in one business.
create unique index items_business_name_key on public.items (business_id, lower(name));

-- Keep updated_at current on every change.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.items enable row level security;

create policy "Members can read their business items"
  on public.items for select
  to authenticated
  using (business_id = (select public.current_business_id()));

create policy "Members can add items to their business"
  on public.items for insert
  to authenticated
  with check (business_id = (select public.current_business_id()));

create policy "Members can update their business items"
  on public.items for update
  to authenticated
  using (business_id = (select public.current_business_id()))
  with check (business_id = (select public.current_business_id()));

create policy "Members can delete their business items"
  on public.items for delete
  to authenticated
  using (business_id = (select public.current_business_id()));
