-- Add new columns to orders table (nullable first since table is now empty)
alter table orders add column if not exists company text;
alter table orders add column if not exists role text;
alter table orders add column if not exists company_size text;
alter table orders add column if not exists milk_type text;

-- Add check constraints
alter table orders add constraint check_company_size 
  check (company_size in ('0-10', '11-50', '51-100', '101-250', '251-1000', '1000+'));

alter table orders add constraint check_milk_type
  check (milk_type in ('Sin leche', 'Leche entera', 'Leche deslactosada', 'Leche de avena Oatly'));

-- Make columns NOT NULL (safe since table is empty)
alter table orders alter column company set not null;
alter table orders alter column role set not null;
alter table orders alter column company_size set not null;
alter table orders alter column milk_type set not null;

