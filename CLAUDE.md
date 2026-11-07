# All Things Reptile — App

React PWA, live at app.allthingsreptile.com.au. Australian reptile keeping reference.
Owner: Rowan Peterson, Amphibian Pty Ltd. Hosted on Vercel; pushes to `main` deploy to production, every other branch gets a preview URL.

## Current work: structural refactor (branch `refactor/split-app`)

`src/App.js` (~4,280 lines) is being split into a proper structure. **No visual or behavioural change** until the refactor merges. The gate for merging: the branch preview renders identically to production and `npm run build` passes with no new warnings.

Target layout:

```
src/
  App.jsx                  routing shell only
  constants/colours.js     the C object
  data/                    species.js, categories.js, careGuides.js, glossary.js, states.js
  components/              shared UI (StatGrid, TempBar, WarnBox, FoodItem, HealthItem, ShopBtn, SectionLabel, LegalTab, InsectCard, LevelBadge, SplashScreen)
  screens/                 Browse, Care, Legal, Glossary, Identify, SearchResults
  pages/species/<group>/   one file per species
  pages/care/              one file per care guide
```

Order: constants and data → shared components → screens → species and care pages → App.jsx cleanup → React Router (real per-species URLs).

Work in small commits, one stage per pull request. Never push to `main` directly.

## Decisions (signed off 7 Nov 2026 — do not relitigate)

- **D1** ATR goes public at store launch. Never mention Pop-up Chameleon (PUC) in app copy; the brands are separate.
- **D2** Palette: `#D25815` orange, `#A8A8A8` grey, `#000000` black. `C.green` and `C.gold` retire during the design pass, not the refactor. Note: in the current code `C.green` actually holds the orange (`#d15917`) — keep values as-is during the refactor.
- **D3** Inline styles (`style={{}}`) only, through the refactor. The design pass will introduce design tokens plus CSS Modules — not before.
- **D4** Species slugs are hyphenated and identical across app route, Shopify handle and URL, e.g. `black-headed-monitor`. The old IDs (`blackheadedmonitor`, `ridgetailed`, etc.) get mapped when React Router lands.
- **D5** Shopify is the species master. Husbandry content moves from JSX into Shopify Species metaobjects once; after that the app pulls species data from Shopify at build time. Until that pipeline exists, `data/species.js` mirrors the Shopify Species fields.
- **D6** No Firebase, no Sanity. Supabase for accounts and app data; Shopify metaobjects for content.
- **D7** One ATR login (Supabase Auth), linked to the Shopify customer by email. Breeders are a role on that login.
- **D8** Pygmy Mulga Monitor 45–60°C and Sand Monitor 50–65°C basking ranges stay as recorded (flagged for Rowan's review).
- **D9** AI species ID ships with the relaunch. Every result is labelled a suggestion and warns never to handle a wild snake based on it.
- **D10** Target: app relaunch 29 Jan 2027.

## Content rules (non-negotiable)

- 46 species: 15 snakes, 9 lizards, 6 geckos, 6 monitors, 4 turtles, 6 frogs. Australian natives only — no Leopard Geckos or other exotics.
- Black-headed Monitor and Black-headed Python are different species; never let their IDs collide.
- Licence grids use each authority's own **licence names** as they appear on its website today (NSW Companion / Class 1 / Advanced licence; VIC Basic / Advanced licence; QLD Standard / Specialised / Advanced licence; SA Basic / Specialist permit; WA Pet keeper's licence; TAS Herpetofauna permit; ACT keeper licence, case by case; NT permit to keep). **Never** show species class codes (no NSW R-codes, QLD Class 1/2 species, VIC schedule numbers, WA categories). Every jurisdiction carries a "verify with your authority" disclaimer, and medium/low-confidence cells add "confirm with authority".
- Species-by-state availability was researched against every state's official keepable-species list in November 2026 (review page: ATR Licence Matrix artifact). Re-run that research before changing a grid by hand.
- TAS is always red/unavailable for non-TAS native species.
- Monitors need a 50–60°C basking surface (see D8 for the two exceptions) — feature it prominently on monitor pages.
- NSW no longer issues licences instantly; officially at least 8 weeks, often longer — warn clearly on the Licencing screen (the NSW record carries the warning). Don't quote 90 days; there's no official source for it.
- ACT: since 15 May 2026 no native reptiles are exempt. QLD, WA and ACT have no exempt reptiles; VIC, SA and NT have some.
- Licence facts in `data/states.js` were checked against official sources in November 2026; re-check before relying on them and update the date in each `verifyDisclaimer`.
- Wood Roaches are the primary feeder roach. **Dubia roaches are illegal in Australia** (not on the federal Live Import List; DCCEEW seizure June 2026) — never recommend them as a feeder; the Feeder Guide carries a warning instead. BSFL are sold as Calci-worms in Australia.
- Australian English throughout (colour, licence/license as noun/verb, enclosure, etc.).

## Supabase

Projects created from 30 Oct 2026 onward don't expose new `public` tables to the Data API automatically. Every migration that creates a table must include explicit `GRANT`s for the roles that need it, plus RLS enabled with policies.

## Shopify

Store: allthingsreptile.com.au (`all-things-reptile-2`, `w1xh0a-xk.myshopify.com`). Unattended jobs write to Shopify only through the ATR Data Sync app credentials (`SHOPIFY_ATR_STORE`, `SHOPIFY_ATR_CLIENT_ID`, `SHOPIFY_ATR_CLIENT_SECRET`, set in the ATR cloud environment), never through the shared Shopify connector. Before any write, query `shop { myshopifyDomain }` and stop if it isn't `w1xh0a-xk.myshopify.com`. Never publish a theme, never write to the live theme, never touch the PUC store. Theme edits go in custom-prefixed files only; never edit stock Pursuit files.
