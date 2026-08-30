-- 005_update_company_users_for_invites.sql

-- user_id nullable for pending invites
alter table public.company_users alter column user_id drop not null;

-- email column for invite tracking + display
alter table public.company_users add column if not exists email text;

-- fast invite lookup by email
create index if not exists idx_company_users_email on public.company_users(email);
