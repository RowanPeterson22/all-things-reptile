-- Applied to the atr project (ledcvbyiqkygcdleucqo) on 7 Nov 2026 via the Supabase MCP.
-- Least privilege for service_role: only DML.
revoke truncate, references, trigger on table public.beta_testers from service_role;
revoke truncate, references, trigger on table public.id_feedback  from service_role;

-- Explicit deny for client roles (documents intent; RLS already denies with no policies).
create policy "no client access" on public.beta_testers as restrictive for all to anon, authenticated using (false) with check (false);
create policy "no client access" on public.id_feedback  as restrictive for all to anon, authenticated using (false) with check (false);

-- This project was created with the legacy auto-grant defaults. Opt in to the new
-- behaviour so future public tables/functions/sequences are not exposed by default.
alter default privileges for role postgres in schema public revoke select, insert, update, delete, truncate, references, trigger on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke usage, select, update on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke execute on functions from public;
