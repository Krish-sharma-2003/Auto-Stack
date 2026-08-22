create table if not exists public.challans (
    id uuid primary key default gen_random_uuid(),
    challan_no text not null unique,
    party_name text not null,
    challan_date date not null,
    delivery_address text not null,
    transport_name text,
    vehicle_no text,
    items jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now()
);
