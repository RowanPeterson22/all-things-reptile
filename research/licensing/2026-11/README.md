# Licensing research — November 2026

Raw extracts of each state and territory's official keepable reptile and frog lists, as researched 7–8 Nov 2026. Source of the app's licence grids and of `keepable` in `src/data/australianSpecies.json`.

- `full-<STATE>.json` — one row per listed species or group: `{group, common, latin, tier, official_tier, venomous, notes, source}`. `tier` is ATR's display wording (each authority's own licence names); `official_tier` is the authority's internal class or schedule and must never be shown in the app (see CLAUDE.md).
- `matrix.json` — the 46 app species × 8 states as shipped in the app's Licencing tabs.
- NSW's list is the Native Animal Keepers' Species List (reprinted Jan 2019; NSW says new additions are frozen).
- TAS: Tasmanian natives only, Herpetofauna permit; no list file.

Re-checked monthly by a scheduled task; the human-readable summary is the "Australian reptile & frog licensing: state reference" doc in the ATR project. When anything changes, add a new dated folder rather than editing this one.
