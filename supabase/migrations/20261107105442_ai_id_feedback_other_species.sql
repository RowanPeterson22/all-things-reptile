-- Applied to the atr project (ledcvbyiqkygcdleucqo) on 7 Nov 2026 via the Supabase MCP.
-- Free-text species name when the tester picks "other" (not one of the app's 46).
alter table public.id_feedback
  add column correct_species_other text check (char_length(correct_species_other) <= 120);
