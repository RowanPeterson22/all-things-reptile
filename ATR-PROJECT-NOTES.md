# All Things Reptile — Project Notes
**For use when starting a new chat session**
Last updated: April 2026

---

## Project Overview
A React PWA (Progressive Web App) — the definitive Australian reptile keeping reference app.
**Owner:** Rowan Peterson / Amphibian Pty Ltd
**Live URL:** app.allthingsreptile.com.au
**GitHub:** github.com/RowanPeterson22/all-things-reptile
**Local directory:** ~/all-things-reptiles
**Main working file:** src/App.js (single file React app — all code lives here)

---

## Tech Stack
- **Frontend:** React (Create React App), single file src/App.js, inline styles only
- **Hosting:** Vercel (Hobby/free plan), auto-deploys on git push
- **Domain:** app.allthingsreptile.com.au via TPP Wholesale DNS (CNAME to Vercel)
- **Version control:** GitHub — RowanPeterson22/all-things-reptile
- **Deploy:** One-word alias `deploy` in terminal (git add/commit/push → Vercel auto-deploys)
- **PWA:** Installable on iPhone, safe area insets for notch/status bar

**Planned future stack:**
- Supabase — user accounts & database (Phase 2)
- Sanity.io — headless CMS (future)
- Firebase — push notifications (Phase 3)
- Shopify — commerce integration (Phase 5)

---

## Brand & Design
- **Primary colour:** #d15917 (desert orange) — stored as C.orange
- **Secondary colour:** #1e3a2f (dark green) — stored as C.green
- **Gold accent:** #c8963c — stored as C.gold
- **Font:** DM Sans / system-ui
- **Logo:** /public/AllThingsReptile_Logo.png (also /public/AllThingsFrogs_Logo.png)
- **Layout:** Full-width mobile-first, fixed bottom navigation bar
- **All CSS:** Inline styles via style={{}} — no external CSS files

**Key UI components (defined in App.js):**
- `SpeciesPage` — tabbed species page wrapper
- `StatGrid` — quick stats grid
- `TempBar` — temperature gradient bars
- `WarnBox` — warning/info callout boxes (types: red, gold, blue)
- `FoodItem` — feeding item rows
- `HealthItem` — health issue cards
- `ShopBtn` — call to action buttons
- `SectionLabel` — section headings
- `LegalTab` — licencing tab with 8-state grid (uses STATE_COLOURS)
- `InsectCard` — feeder guide insect comparison cards

---

## App Structure
**Bottom navigation tabs:** Browse | Care | Licencing | ID Reptile | Glossary
**Routing:** PAGE_MAP object maps page IDs to React components. `setPage('pageId')` navigates, `setPage(null)` returns home.

**Key arrays:**
- `SPECIES[]` — all species with id, name, latin, type, emoji, bg, level, page
- `CATEGORIES[]` — browse category tiles (lizard, snake, gecko, turtle, frog, monitor)
- `CARE_GUIDES[]` — care guide tiles with page references
- `STATE_COLOURS{}` — per-state colour scheme used on licencing grids
- `GLOSSARY_TERMS[]` — 57 glossary terms

---

## All Species (47 total — all pages built)

### Lizards & Dragons (9)
| Species | Latin | Level |
|---|---|---|
| Eastern Blue-tongue Skink | Tiliqua scincoides | Beginner |
| Northern Blue-tongue Skink | Tiliqua scincoides intermedia | Beginner |
| Blotched Blue-tongue Skink | Tiliqua nigrolutea | Beginner |
| Shingleback Lizard | Tiliqua rugosa | Intermediate |
| Central Bearded Dragon | Pogona vitticeps | Beginner |
| Eastern Bearded Dragon | Pogona barbata | Beginner |
| Pygmy Bearded Dragon (aka Rankins/Lawson's Dragon) | Pogona henrylawsoni | Beginner |
| Frilled-neck Lizard | Chlamydosaurus kingii | Intermediate |
| Eastern Water Dragon | Intellagama lesueurii | Intermediate |

### Geckos (6)
| Species | Latin | Level |
|---|---|---|
| Knob-tailed Gecko | Nephrurus spp. | Intermediate |
| Thick-tailed Gecko | Underwoodisaurus milii | Beginner |
| Marbled Velvet Gecko | Oedura marmorata | Beginner |
| Southern Leaf-tailed Gecko | Phyllurus platurus | Intermediate |
| Northern Spiny-tailed Gecko | Strophurus ciliaris | Beginner |
| Golden-tailed Gecko | Strophurus taenicauda | Beginner |

### Monitors (6)
| Species | Latin | Level |
|---|---|---|
| Ackie Monitor | Varanus acanthurus | Intermediate |
| Pygmy Mulga Monitor | Varanus gilleni | Intermediate |
| Black-headed Monitor | Varanus tristis | Intermediate |
| Ridge-tailed Monitor | Varanus baritji | Intermediate |
| Sand Monitor | Varanus gouldii | Advanced |
| Lace Monitor | Varanus varius | Advanced |

### Turtles (4)
| Species | Latin | Level |
|---|---|---|
| Eastern Long-necked Turtle | Chelodina longicollis | Intermediate |
| Broad-shelled Turtle | Chelodina expansa | Intermediate |
| Murray River Turtle | Emydura macquarii | Intermediate |
| Saw-shelled Turtle | Myuchelys latisternum | Intermediate |

### Pythons & Snakes (16)
| Species | Latin | Level |
|---|---|---|
| Children's Python | Antaresia childreni | Beginner |
| Stimson's Python | Antaresia stimsoni | Beginner |
| Spotted Python | Antaresia maculosa | Beginner |
| Pygmy Python | Antaresia perthensis | Beginner |
| Carpet Python | Morelia spilota | Intermediate |
| Jungle Carpet Python | Morelia spilota cheynei | Intermediate |
| Diamond Python | Morelia spilota spilota | Intermediate |
| Bredli Python | Morelia bredli | Intermediate |
| Woma Python | Aspidites ramsayi | Intermediate |
| Black-headed Python | Aspidites melanocephalus | Intermediate |
| Water Python | Liasis fuscus | Intermediate |
| Olive Python | Liasis olivaceus | Advanced |
| Amethystine Python | Simalia amethistina | Advanced |
| Rough-scaled Python | Morelia carinata | Advanced |
| Green Tree Python | Morelia viridis | Advanced |

### Frogs (6)
| Species | Latin | Level |
|---|---|---|
| Green Tree Frog | Litoria caerulea | Beginner |
| White-lipped Tree Frog | Litoria infrafrenata | Intermediate |
| Striped Marsh Frog | Limnodynastes peronii | Beginner |
| Eastern Dwarf Tree Frog | Litoria fallax | Beginner |
| Peron's Tree Frog | Litoria peronii | Beginner |
| Magnificent Tree Frog | Litoria splendida | Intermediate |

---

## Care Guides (all 6 complete)
1. ✅ Enclosure Setup & Sizing
2. ✅ Feeder Guide (insects, rodent stages, supplements, gut loading)
3. ✅ Temperature & Heating
4. ✅ Feeding & Nutrition
5. ✅ Handling & Socialising
6. ✅ Health & Illness
7. ✅ Shedding & Skin Care

---

## Other Screens
- ✅ Licencing screen — all 8 states, contact details, universal rules
- ✅ Glossary — 57 terms, searchable by category
- ✅ ID Reptile — UI only, AI integration pending
- ✅ Splash screen — animated, ATR + Frogs logos

---

## Important Content Rules
- **Australian species only** — Leopard Geckos removed (not legal in Australia)
- **Wood Roaches (Woodies)** are the primary feeder roach throughout — Dubias mentioned comparatively in Feeder Guide only
- **Licence grid** uses general descriptions (e.g. "Standard keeper licence") — NOT specific class numbers. Always include "verify with your authority" disclaimer
- **TAS** is always red/unavailable for non-TAS native species
- **BSFL** = Black Soldier Fly Larvae (sold as Calci-worms in Australia)
- **Monitors** all require 50–60°C basking surface temperature — this is critical and must be prominently featured

---

## Pending / Next Steps
1. **Fix app icons and favicon** — first priority
2. **Add NSW 90+ day licence processing time warning** to NSW state card in Licencing screen
3. **Search functionality** — global search across species, care guides, glossary
4. **Delete Vercel deploy hook** — causes occasional double deploy (low priority, currently stable)
5. **Phase 2** — Supabase user accounts, My Reptiles, state-based filtering, licence date tracker

---

## Future Phases
| Phase | Focus | Key Tech |
|---|---|---|
| 2 | User accounts, My Reptiles, profiles, state filtering | Supabase |
| 3 | Feeding schedules, reminders, shopping lists | Firebase |
| 4 | Breeder directory, expo calendar, vet finder, species ID AI | Supabase |
| 5 | Commerce, Pop-up Chameleon Shopify integration | Shopify |
| Future | Headless CMS for content management | Sanity.io |
| Future | Advertising banner adverts (revenue stream idea) | TBD |

---

## Important Research Task (Pre Phase 2)
Full verification of reptile keeping regulations per species per state is required before Phase 2 launch. Current licencing tabs use general descriptions with "check with authority" disclaimers. Need to verify:
- Official species lists for all 8 states
- Licence category per species per state
- State-specific restrictions
- Use breeder/vendor contacts from Hunter Valley reptile expo + direct calls to state wildlife authorities

## NSW Licencing Pain Point
NSW reptile licences currently take 90+ days to process. Major pain point for keepers and breeders at expos — buyers can't take animals home same day. App opportunity:
- Add 90+ day warning to NSW state card
- Build "How to apply" walkthrough guide for NSW
- Phase 2: licence application date tracker feature

---

## Business Context
- **Parent company:** Amphibian Pty Ltd (amphibian.com.au)
- **Pop-up Chameleon** (popupchameleon.com) — pop-up outdoor reptile enclosures; exhibits at reptile expos
- **All Things Frogs** — sub-brand (allthingsfrogs.com.au)
- **Love Your** — giftware brand concept (loveyourcat/dog/bird/fish/reptile.com.au)
- **DNS:** All domains via TPP Wholesale

---

## How to Work on This Project
1. Rowan uploads the current App.js to the chat
2. Claude copies it to /home/claude/atr-app-v3.jsx to work on
3. All changes made to /home/claude/atr-app-v3.jsx
4. Completed file copied to /mnt/user-data/outputs/App.js and presented for download
5. Rowan downloads, drags into ~/all-things-reptiles/src/ replacing the existing App.js
6. Types `deploy` in terminal to push to GitHub → Vercel auto-deploys
