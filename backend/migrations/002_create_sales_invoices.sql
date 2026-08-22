create table if not exists public.sales_invoices (
    id uuid primary key default gen_random_uuid(),
    invoice_no text not null unique,
    party_name text not null,
    invoice_date date not null,
    items jsonb not null default '[]'::jsonb,
    subtotal numeric not null default 0,
    tax_amount numeric not null default 0,
    total_amount numeric not null default 0,
    created_at timestamptz not null default now()
);
