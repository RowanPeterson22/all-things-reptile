-- Applied to the atr project (ledcvbyiqkygcdleucqo) on 7 Nov 2026 via the Supabase MCP.
-- Interim admin access for the /admin section, until the ATR login (D7) exists:
-- an admin is an active beta tester with is_admin = true. Every api/admin-* route
-- checks it server-side. Rowan's row was set to true by a one-off UPDATE (not here,
-- because migrations shouldn't carry people's data).

alter table public.beta_testers
  add column is_admin boolean not null default false;
comment on column public.beta_testers.is_admin is 'Can open /admin and call api/admin-* (interim, until the ATR login, D7). Admins cannot clear their own flag.';

-- Photo counts per species for the admin library, in one round trip instead of
-- paging every reference_photos row. Same access as the table: service_role only.
create or replace function public.admin_photo_counts()
returns table (species_slug text, active bigint, hidden bigint, rejected bigint, best bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select p.species_slug,
         count(*) filter (where p.status = 'active'),
         count(*) filter (where p.status = 'hidden'),
         count(*) filter (where p.status = 'rejected'),
         count(*) filter (where p.status = 'active' and p.is_best)
    from public.reference_photos p
   group by p.species_slug
$$;
comment on function public.admin_photo_counts() is 'Admin library: reference photo counts by species and status. service_role only.';

revoke all on function public.admin_photo_counts() from public, anon, authenticated;
grant execute on function public.admin_photo_counts() to service_role;
