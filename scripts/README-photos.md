# Reference photo library

Private, confirmed photos per species for the AI species ID (`lib/identify.js` on
`feature/ai-id` will compare new photos against them). The photos are never
published. Only the server key (`service_role`) can read or write them.

- Table: `public.reference_photos` in the `atr` Supabase project (`ledcvbyiqkygcdleucqo`).
  RLS is on, `anon`/`authenticated` are denied, and `service_role` has SELECT/INSERT/UPDATE/DELETE only.
  Migration: `supabase/migrations/20261107123620_reference_photos.sql`.
- Bucket: `reference-photos` (private, JPEG only, 2 MB cap). Files go to
  `reference-photos/<species_slug>/<source>-<source_id>.jpg`. The `storage_path` column holds
  the part after the bucket name.

## Licence rules (non-negotiable)

- Import a photo only if **that photo's own licence** is **CC0, CC-BY or CC-BY-SA**.
  The observation's licence is ignored: an NC observation can have a CC-BY photo, and the other way round.
- Never import CC-BY-NC, -ND, -NC-SA, -NC-ND, all-rights-reserved, or a photo whose licence is unknown.
- Every row stores the photographer, licence code, licence URL, source, a link to the original
  page (`https://www.inaturalist.org/observations/<id>`) and the date imported (`created_at`).
  The full iNaturalist attribution string goes in `notes`.
- Official APIs only (iNaturalist API v1). Never scrape HTML pages.
- ALA (`--source ala`) is **not implemented**. We couldn't confirm that the biocache occurrence
  search can filter on each image's own licence; see the TODO in `scripts/lib/photoImport.mjs`.

## Running it

You need Node 18+, plus `SUPABASE_URL` and `SUPABASE_SECRET_KEY` for the atr project. The script
refuses any other project, with no override, and also checks the project ref inside a legacy JWT key.

```
node scripts/import-photos.mjs --app-only --dry-run   # 1. the app's 46: metadata only, writes the report
node scripts/import-photos.mjs --app-only             # 2. the app's 46 for real
node scripts/import-photos.mjs --resume               # 3. everything (tops up, skips full species)
node scripts/photo-stats.mjs                          # counts per species and group, plus gaps
```

Run them in that order. Step 3 may need more than one day (see the limits below). Re-run it
with `--resume` until the summary stops changing.

| Flag | Meaning |
|---|---|
| `--per-species N` | target photos per species, in total (default 30) |
| `--species a,b` | only these slugs |
| `--group frog` | only these groups (comma list: `skink`, `gecko`, `elapid`, `python`, `monitor`, `frog` …) |
| `--app-only` | only species with an `appSlug` |
| `--dry-run` | fetch taxa and observations, write the report, no downloads or uploads |
| `--resume` | top up species that already have rows; species already at N are skipped with no API calls |
| `--limit N` | stop after N species, to split a long run |
| `--max-requests N` | iNaturalist API requests allowed today (default 9000, hard max 9500) |
| `--refresh-taxa` | re-resolve taxa even if they're cached |

Without `--resume`, a real run refuses to start if any selected species already has rows.
A (`source`, `source_id`) pair is never imported twice, even across species (unique constraint plus a pre-check).

**What it does per species:**
1. Resolves an iNaturalist taxon from the scientific name, then each synonym (`/v1/taxa`, an exact
   name or `matched_term`, reptiles and amphibians only). The result is cached in
   `scripts/cache/inat-taxa.json`; commit that file.
2. Fetches `/v1/observations` with `taxon_id`, `place_id=6744` (Australia), `quality_grade=research`,
   `photo_license=cc0,cc-by,cc-by-sa`, `photos=true`, `order_by=votes` (up to 3 pages).
3. Re-checks each photo's own `license_code`, spreads its picks across observations and observers,
   and downloads the `medium` size (about 500 px).
4. Uploads the photo to Storage, then inserts the row. If the insert fails, it deletes the upload.

**Output:** a console summary, plus `scripts/out/import-report.json` (gitignored), rewritten after
each species. Per species, the report gives the photos found, imported (or would import), rejected by
licence, and failed, with any errors. The summary lists species with no taxon, zero photos or fewer than 5.

## Being polite to iNaturalist

- API: at most about 1 request per second (1.1 s spacing), and no more than 9,000 a day by default.
  The count persists per UTC day in `scripts/out/inat-budget.json`. When the budget runs out, the
  run stops cleanly; re-run the next day with `--resume`.
- Photo downloads are spaced 0.3 s apart and come from the open-data S3 bucket, not the API.
  iNaturalist asks that media downloads stay under about 5 GB an hour and 24 GB a day. A full
  run is roughly 1,363 × 30 × ~60 KB ≈ 2.5 GB, so it stays well under.
- Backs off on HTTP 429 and 5xx, honouring `Retry-After`.
- Sends the User-Agent `ATR-reference-import/1.0` with no personal email address.
- Budget: about 2–3 API requests per species (taxon plus 1–2 observation pages, more if it has to
  try synonyms), so about 3,000–4,000 for all 1,363 species, plus the downloads.

## Network domains it needs

- `api.inaturalist.org`
- `inaturalist-open-data.s3.amazonaws.com`
- `static.inaturalist.org`
- `ledcvbyiqkygcdleucqo.supabase.co` (the Supabase host)

## Tests

`src/__tests__/importPhotos.test.js` covers the script against a mocked fetch: the licence filter,
taxon from a synonym, de-duplication, resume, the project guard, cleanup when an insert fails, and backoff.
