-- Xiao Xiannu Digital Menu — Supabase production data layer
create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  customer text not null,
  phone text not null,
  order_type text not null check (order_type in ('Delivery','Pickup','Dine-In')),
  address text default '',
  location text default '',
  table_number text default '',
  requested_time text default '',
  notes text default '',
  delivery_fee numeric(12,2) not null default 0,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  status text not null default 'Order Received',
  driver text not null default 'Unassigned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.driver_locations (
  id uuid primary key default gen_random_uuid(),
  order_number text not null references public.orders(number) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  accuracy double precision,
  heading double precision,
  speed double precision,
  updated_at timestamptz not null default now(),
  unique(order_number)
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.driver_locations enable row level security;

-- Public demo policies. Replace with authenticated admin/driver policies before handling sensitive production data.
drop policy if exists "public read orders" on public.orders;
create policy "public read orders" on public.orders for select using (true);
drop policy if exists "public create orders" on public.orders;
create policy "public create orders" on public.orders for insert with check (true);
drop policy if exists "public update orders" on public.orders;
create policy "public update orders" on public.orders for update using (true) with check (true);

drop policy if exists "public read driver locations" on public.driver_locations;
create policy "public read driver locations" on public.driver_locations for select using (true);
drop policy if exists "public create driver locations" on public.driver_locations;
create policy "public create driver locations" on public.driver_locations for insert with check (true);
drop policy if exists "public update driver locations" on public.driver_locations;
create policy "public update driver locations" on public.driver_locations for update using (true) with check (true);

-- Enable realtime. Ignore duplicate publication errors if tables are already present.
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.driver_locations;
exception when duplicate_object then null; end $$;

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists driver_locations_order_number_idx on public.driver_locations(order_number);
