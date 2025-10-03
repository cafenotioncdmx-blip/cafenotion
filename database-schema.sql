-- Enable pgcrypto extension for UUID generation
create extension if not exists pgcrypto;

-- Create orders table
create table orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,        -- WhatsApp in E.164 format
  drink text not null,
  notes text,
  status text not null check (status in ('queued','in_progress','ready','delivered')) default 'queued',
  pickup_code text not null,
  ready_at timestamptz,
  delivered_at timestamptz
);

-- Enable Row Level Security
alter table orders enable row level security;

-- Deny all access by default (we'll use service key for API routes)
create policy deny_all on orders for all using (false);

-- Create indexes for better performance
create index idx_orders_status on orders(status);
create index idx_orders_created_at on orders(created_at);
create index idx_orders_pickup_code on orders(pickup_code);
