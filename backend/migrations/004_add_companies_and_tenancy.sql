-- 004_add_companies_and_tenancy.sql

-- 1. Companies table
create table if not exists public.companies (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references auth.users(id),
    name text not null,
    gstin text,
    pan text,
    business_type text,
    industry text,
    address text,
    city text,
    state text,
    pincode text,
    country text default 'India',
    phone text,
    email text,
    website text,
    bank_name text,
    bank_account_no text,
    ifsc_code text,
    financial_year_start date,
    logo_url text,
    created_at timestamptz not null default now()
);

-- 2. Company-User membership
create table if not exists public.company_users (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references public.companies(id) on delete cascade,
    user_id uuid not null references auth.users(id),
    role text not null default 'Admin',
    status text not null default 'Active',
    created_at timestamptz not null default now(),
    unique(company_id, user_id)
);

-- 3. Nullable company_id on every business table
alter table public.inventory        add column if not exists company_id uuid references public.companies(id);
alter table public.invoices          add column if not exists company_id uuid references public.companies(id);
alter table public.sales_invoices   add column if not exists company_id uuid references public.companies(id);
alter table public.challans         add column if not exists company_id uuid references public.companies(id);
alter table public.vendors          add column if not exists company_id uuid references public.companies(id);
alter table public.parties          add column if not exists company_id uuid references public.companies(id);
alter table public.stock_movements  add column if not exists company_id uuid references public.companies(id);

-- 4. Indexes for tenant scoping
create index if not exists idx_company_users_user_id on public.company_users(user_id);
create index if not exists idx_company_users_company_id on public.company_users(company_id);
create index if not exists idx_inventory_company_id on public.inventory(company_id);
create index if not exists idx_invoices_company_id on public.invoices(company_id);
create index if not exists idx_sales_invoices_company_id on public.sales_invoices(company_id);
create index if not exists idx_challans_company_id on public.challans(company_id);
create index if not exists idx_vendors_company_id on public.vendors(company_id);
create index if not exists idx_parties_company_id on public.parties(company_id);
create index if not exists idx_stock_movements_company_id on public.stock_movements(company_id);
