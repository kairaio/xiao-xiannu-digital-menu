create extension if not exists pgcrypto;
create schema if not exists private;
create table if not exists public.profiles(id uuid primary key references auth.users(id) on delete cascade,role text not null default 'pending' check(role in('pending','admin','driver')),display_name text not null default 'Staff',created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.orders(id uuid primary key,number text not null unique check(number ~ '^XX[A-Z0-9]{6,18}$'),tracking_token uuid not null unique,customer text not null check(char_length(customer) between 1 and 120),phone text not null check(char_length(phone) between 3 and 40),order_type text not null check(order_type in('Delivery','Pickup','Dine-In')),address text not null default '',location_url text not null default '',table_number text not null default '',requested_time text not null default '',notes text not null default '',delivery_fee numeric(12,2) not null default 0 check(delivery_fee>=0),items jsonb not null check(jsonb_typeof(items)='array' and jsonb_array_length(items) between 1 and 100),subtotal numeric(12,2) not null check(subtotal>=0),total numeric(12,2) not null check(total>=subtotal),status text not null default 'Order Received' check(status in('Order Received','Confirmed','Preparing','Ready for Delivery','Driver Assigned','On Delivery','Arriving','Delivered','Rejected')),driver_id uuid references public.profiles(id) on delete set null,driver_name text not null default 'Unassigned',created_at timestamptz not null default now(),updated_at timestamptz not null default now(),constraint delivery_fields check(order_type<>'Delivery' or char_length(address)>0),constraint dine_in_fields check(order_type<>'Dine-In' or char_length(table_number)>0));
create table if not exists public.driver_locations(order_id uuid primary key references public.orders(id) on delete cascade,driver_id uuid not null references public.profiles(id) on delete cascade,latitude double precision not null check(latitude between -90 and 90),longitude double precision not null check(longitude between -180 and 180),accuracy double precision,heading double precision,speed double precision,updated_at timestamptz not null default now());
create index if not exists orders_created_at_idx on public.orders(created_at desc);create index if not exists orders_driver_id_idx on public.orders(driver_id);create index if not exists orders_status_idx on public.orders(status);
create or replace function private.current_staff_role() returns text language sql stable security definer set search_path='' as $$select role from public.profiles where id=(select auth.uid())$$;
create or replace function private.request_tracking_token() returns text language sql stable set search_path='' as $$select coalesce((nullif(current_setting('request.headers',true),'')::jsonb->>'x-tracking-token'),'')$$;
create or replace function private.request_tracking_phone() returns text language sql stable set search_path='' as $$select regexp_replace(coalesce((nullif(current_setting('request.headers',true),'')::jsonb->>'x-tracking-phone'),''),'\D','','g')$$;
create or replace function private.set_updated_at() returns trigger language plpgsql set search_path='' as $$begin new.updated_at=now();return new;end$$;
create or replace function private.protect_order_update() returns trigger language plpgsql security definer set search_path='' as $$
declare staff_role text; assigned_name text;
begin
  staff_role:=private.current_staff_role();
  if new.driver_id is distinct from old.driver_id then
    if new.driver_id is null then new.driver_name:='Unassigned';
    else
      select display_name into assigned_name from public.profiles where id=new.driver_id and role='driver';
      if assigned_name is null then raise exception 'Assigned account is not an active driver'; end if;
      new.driver_name:=assigned_name;
    end if;
  end if;
  if staff_role='driver' then
    if (to_jsonb(new)-array['status','updated_at']) is distinct from (to_jsonb(old)-array['status','updated_at']) then
      raise exception 'Drivers may only update order status';
    end if;
    if new.status not in('Driver Assigned','On Delivery','Arriving','Delivered') then
      raise exception 'Driver status is not permitted';
    end if;
  elsif staff_role<>'admin' then
    raise exception 'Staff access required';
  end if;
  return new;
end$$;
drop trigger if exists profiles_updated_at on public.profiles;create trigger profiles_updated_at before update on public.profiles for each row execute function private.set_updated_at();
drop trigger if exists orders_updated_at on public.orders;create trigger orders_updated_at before update on public.orders for each row execute function private.set_updated_at();
drop trigger if exists orders_protect_update on public.orders;create trigger orders_protect_update before update on public.orders for each row execute function private.protect_order_update();
create or replace function private.handle_new_staff_user() returns trigger language plpgsql security definer set search_path='' as $$begin insert into public.profiles(id,display_name) values(new.id,coalesce(nullif(new.raw_user_meta_data->>'display_name',''),split_part(new.email,'@',1),'Staff')) on conflict(id) do nothing;return new;end$$;
drop trigger if exists on_auth_user_created on auth.users;create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_staff_user();
insert into public.profiles(id,display_name) select id,coalesce(nullif(raw_user_meta_data->>'display_name',''),split_part(email,'@',1),'Staff') from auth.users on conflict(id) do nothing;
alter table public.profiles enable row level security;alter table public.orders enable row level security;alter table public.driver_locations enable row level security;
drop policy if exists "staff read profiles" on public.profiles;create policy "staff read profiles" on public.profiles for select to authenticated using(id=(select auth.uid()) or (select private.current_staff_role())='admin');
drop policy if exists "public create orders" on public.orders;create policy "public create orders" on public.orders for insert to anon,authenticated with check(status='Order Received' and driver_id is null and driver_name='Unassigned' and created_at>now()-interval '5 minutes' and created_at<now()+interval '1 minute');
drop policy if exists "customer track own order" on public.orders;create policy "customer track own order" on public.orders for select to anon using(tracking_token::text=(select private.request_tracking_token()) or(char_length((select private.request_tracking_phone()))>=6 and regexp_replace(phone,'\D','','g')=(select private.request_tracking_phone())));
drop policy if exists "staff read orders" on public.orders;create policy "staff read orders" on public.orders for select to authenticated using((select private.current_staff_role())='admin' or((select private.current_staff_role())='driver' and driver_id=(select auth.uid())) or tracking_token::text=(select private.request_tracking_token()));
drop policy if exists "admin update orders" on public.orders;create policy "admin update orders" on public.orders for update to authenticated using((select private.current_staff_role())='admin') with check((select private.current_staff_role())='admin');
drop policy if exists "driver update assigned orders" on public.orders;create policy "driver update assigned orders" on public.orders for update to authenticated using((select private.current_staff_role())='driver' and driver_id=(select auth.uid())) with check((select private.current_staff_role())='driver' and driver_id=(select auth.uid()));
drop policy if exists "customer read assigned driver location" on public.driver_locations;create policy "customer read assigned driver location" on public.driver_locations for select to anon using(exists(select 1 from public.orders o where o.id=order_id and(o.tracking_token::text=(select private.request_tracking_token()) or(char_length((select private.request_tracking_phone()))>=6 and regexp_replace(o.phone,'\D','','g')=(select private.request_tracking_phone())))));
drop policy if exists "staff read driver locations" on public.driver_locations;create policy "staff read driver locations" on public.driver_locations for select to authenticated using((select private.current_staff_role())='admin' or driver_id=(select auth.uid()));
drop policy if exists "driver publish own location" on public.driver_locations;create policy "driver publish own location" on public.driver_locations for insert to authenticated with check((select private.current_staff_role())='driver' and driver_id=(select auth.uid()) and exists(select 1 from public.orders o where o.id=order_id and o.driver_id=(select auth.uid())));
drop policy if exists "driver update own location" on public.driver_locations;create policy "driver update own location" on public.driver_locations for update to authenticated using((select private.current_staff_role())='driver' and driver_id=(select auth.uid())) with check((select private.current_staff_role())='driver' and driver_id=(select auth.uid()));
grant usage on schema public to anon,authenticated;grant usage on schema private to anon,authenticated;grant execute on function private.current_staff_role() to authenticated;grant execute on function private.request_tracking_token() to anon,authenticated;grant execute on function private.request_tracking_phone() to anon,authenticated;revoke all on function private.set_updated_at() from public,anon,authenticated;revoke all on function private.protect_order_update() from public,anon,authenticated;revoke all on function private.handle_new_staff_user() from public,anon,authenticated;
grant insert,select on public.orders to anon;grant insert,select,update on public.orders to authenticated;grant select on public.profiles to authenticated;grant select on public.driver_locations to anon;grant select,insert,update on public.driver_locations to authenticated;
do $$begin if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='orders') then alter publication supabase_realtime add table public.orders;end if;if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='driver_locations') then alter publication supabase_realtime add table public.driver_locations;end if;end$$;
-- Promote users after creating them in Authentication > Users:
-- update public.profiles set role='admin',display_name='Restaurant Admin' where id=(select id from auth.users where email='ADMIN_EMAIL');
-- update public.profiles set role='driver',display_name='Driver 1' where id=(select id from auth.users where email='DRIVER_EMAIL');
