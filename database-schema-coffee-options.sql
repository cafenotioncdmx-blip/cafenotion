-- Create coffee_options table for managing available drinks
create table coffee_options (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null unique,
  display_name text not null,
  uses_milk boolean not null default true,
  enabled boolean not null default true,
  sort_order integer not null default 0
);

-- Insert default coffee options
insert into coffee_options (name, display_name, uses_milk, enabled, sort_order) values
('Espresso', '1 – Espresso', false, true, 1),
('Americano', '2 – Americano', false, true, 2),
('Flat White', '3 – Flat White', true, true, 3),
('Latte', '4 – Latte', true, true, 4),
('Iced Americano', '5 – Iced Americano', false, true, 5),
('Iced Latte', '6 – Iced Latte', true, true, 6),
('Iced Matcha Latte', '7 – Iced Matcha Latte', true, true, 7),
('Iced Horchata Matcha', '8 – Iced Horchata Matcha', true, true, 8),
('Iced Horchata Coffee', '9 – Iced Horchata Coffee', true, true, 9);

-- Enable Row Level Security
alter table coffee_options enable row level security;

-- Deny all access by default (we'll use service key for API routes)
create policy deny_all on coffee_options for all using (false);

-- Create indexes for better performance
create index idx_coffee_options_enabled on coffee_options(enabled);
create index idx_coffee_options_sort_order on coffee_options(sort_order);
