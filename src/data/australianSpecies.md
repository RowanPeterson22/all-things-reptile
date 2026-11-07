# Australian species index (`australianSpecies.json`)

A master list of every native Australian reptile and frog, built on 7 November 2026. It feeds the AI ID species picker, the AI's list of valid names, a future species directory and the "legally keepable in Australia" list. Nothing imports it yet.

## Record shape

Each record has these fields:

- `slug`: hyphenated, from the common name (D4). A clash gets the species epithet added, e.g. `northern-barred-frog-schevilli`.
- `common` and `otherCommon`.
- `synonyms` (optional): older names, so search and the AI can match them.
- `group` and `family`.
- `states`, plus `statesComplete` (see the gaps below).
- `dangerouslyVenomous` and `marine`.
- `appSlug`.
- `keepable` and `keepableConfidence`.

The four app taxa that aren't species get their own records with `rank` (`subspecies` or `genus`) and `parent`:

- Northern Blue-tongue
- Diamond Python
- Jungle Carpet Python
- Knob-tailed Gecko (`Nephrurus spp.`)

Each `Nephrurus` species also carries `relatedAppSlug: "knob-tailed-gecko"`.

`appSlug` maps all 46 app species. The Black-headed Monitor (`Varanus tristis`) and the Black-headed Python (`Aspidites melanocephalus`) are separate records.

## Counts (species rank only)

| Group | Species |
|---|---|
| skink | 462 |
| gecko | 211 |
| elapid (land) | 106 |
| dragon | 101 |
| blind-snake | 49 |
| legless-lizard | 46 |
| monitor | 33 |
| sea-snake | 33 |
| turtle (freshwater) | 28 |
| python | 17 |
| colubrid (includes 5 Homalopsidae mangrove and water snakes) | 10 |
| sea-turtle | 6 |
| crocodile | 2 |
| file-snake | 2 |
| **Reptiles** | **1,106** |
| **Frogs** | **257** |
| **Total** | **1,363** (1,367 records) |

The Australian Society of Herpetologists' (ASH) list states 994 non-marine reptiles and 244 frogs. Our extra reptiles are mostly the 39 marine species. The rest come from naming differences between sources. Our frog total is the number of rows in the ASH frog table, which runs higher than the page's own header count.

## Sources (all checked 7 November 2026)

### Taxonomy and names

- **Australian Society of Herpetologists, Official List of Australian Species (May 2025):** https://iangbrennan.org/ausherps
  - Source for all frogs, the crocodiles, and the Carphodactylidae and Diplodactylidae geckos (as far as *Oedura*). The page as fetched stops partway through the squamates.
- **RepFocus Australian checklists, compiled from the Reptile Database (14 April 2023):** https://repfocus.dk/GEO/Australia.html
  - Turtles (`Australia_TES`), Pythonidae, Carphodactylidae, Colubridae, Acrochordidae, Homalopsidae, Elapidae part 2 (sea snakes) and Typhlopidae.
  - Also the Western Australia family pages and the Queensland lizard, snake and turtle pages.
- **Australia Endemic Reptiles Checklist, Reptile Database taxonomy (14 November 2018):** https://lntreasures.com/australiar.html
  - Skinks, dragons, Gekkonidae, Pygopodidae, Varanidae and endemic elapids.
- **Genus lists for *Suta* and *Vermicella*:** https://media.eol.org/pages/35310/articles and https://en.wikipedia.org/wiki/Vermicella

Where sources disagree, the newer name wins. The other name goes into `synonyms`, e.g. *Niveoscincus* → *Carinascincus* and *Oedura robusta* → *Amalosia robusta*. Widely used keeper names are preferred as `common` where they exist, e.g. Jacky Dragon. The 46 app species keep their app names.

### Distribution (`states`)

- **Frogs Australia Network state frog lists:** https://www.frogs.org.au/frogs (one page per state and the ACT). These are old names, mapped to ASH names.
- **RepFocus state checklists:** https://repfocus.dk/GEO/Queensland.html, https://repfocus.dk/GEO/Western_Australia.html and https://www.repfocus.dk/GEO/Tasmania.html

### Keepable status

These lists were researched in November 2026. Each record in the scratchpad `full-<STATE>.json` files cites its document.

- **NSW:** NSW Native Animal Keepers' Species List (OEH20160264, reprinted January 2019; the publication page notes a freeze on adding species). https://www.environment.nsw.gov.au/sites/default/files/nsw-native-animal-keepers-species-list.pdf
  - Licence classes come from https://www.environment.nsw.gov.au/licences-and-permits/wildlife-licences/native-animals-as-pets/apply-for-a-native-animal-keeper-licence
  - Companion-listed species → "Companion or Class 1 licence".
  - Reptile class 1 and amphibian class 1 → "Class 1 licence".
  - Every higher reptile or amphibian class → "Advanced licence".
  - The list has 331 reptile and frog rows. Hybrids, "species unknown" rows and subspecies rows are folded into their species.
- **VIC:** the no-licence list and the Wildlife Regulations schedules (Conservation Regulator, DEECA).
- **QLD:** the Nature Conservation (Animals) Regulation 2020 class lists (DETSI).
- **SA:** the DEW keeping-categories species list and the NPW (Wildlife) Regulations 2019, Schedule 6.
- **WA:** the DBCA pet keeper's licence species list.
- **ACT:** Conservator Guidelines 2024 (NI2024-486) and the Exempt Animals Declaration 2026 (DI2026-61).
- **NT:** the Parks & Wildlife Commission NT keeping rules and its venomous snake categories.
- **TAS:** NRE Tas. Only Tasmanian natives can be kept, under a Herpetofauna permit.
- **App species:** for the 46 app species, `keepable` is copied from the live app matrix (`matrix.json`, the grid on each species page).

## How a keepable cell was decided

Values use each authority's own licence names, as in CLAUDE.md:

- "Companion or Class 1 licence" / "Class 1 licence" / "Advanced licence"
- "Basic licence" / "Advanced licence"
- "Standard licence" / "Specialised licence"
- "Basic permit (one animal permit-free)" / "Specialist permit"
- "Pet keeper's licence" / "Pet keeper's licence (advanced)"
- "Herpetofauna permit"
- "Keeper licence (case by case)"
- "Permit to keep"

Exempt species read "No licence needed" (VIC) or "No permit needed" (SA, NT). Anything else is "Not on keepable list". Species class codes never appear in a value. App-species cells keep the app's wording, so a few extra values appear: "Basic or Advanced licence", "Import + keep permit (case by case)", "Permit to keep (varies by form)", and one "Check with authority" (Eastern Blue-tongue, NT).

Each state's list is matched on scientific name, allowing for synonyms, spelling and gender variants, and subspecies.

- A match through a subspecies or a genus entry (e.g. QLD "*Pseudechis* spp.") gets `keepableConfidence` "medium".
- **NSW, VIC, QLD and WA** are positive lists: unlisted means "Not on keepable list".
- **SA:** an unlisted reptile defaults to "Specialist permit" (low). DEW protects all Australian reptiles, and anything not on the exempt or basic lists is specialist. An unlisted frog is "No permit needed" (medium), because SA protects only threatened amphibians.
- **ACT:** there is no positive list, so every native reads "Keeper licence (case by case)" (low). The exceptions are crocodiles, sea turtles, sea snakes and all elapids, which are "Not on keepable list" under NI2024-486 s 2.1.1, plus the individually named exclusions.
- **NT:** NT frogs are "Permit to keep" (medium). Non-NT frogs and turtles are "Not on keepable list". Other reptiles are "Permit to keep" (low), because we don't have NT reptile distributions. Marine species are "Not on keepable list" (low).
- **TAS:** only species on the TAS checklists get "Herpetofauna permit". That's medium for lizards and frogs, and low for snakes. TAS is "Not on keepable list" for every non-Tasmanian species.

`dangerouslyVenomous` is set for these:

- every species in *Acanthophis*, *Austrelaps*, *Hoplocephalus*, *Notechis*, *Oxyuranus*, *Paroplocephalus*, *Pseudechis*, *Pseudonaja* and *Tropidechis*
- *Demansia papuensis*, *D. vestigiata*, *Cryptophis nigrescens*, *Echiopsis curta* and *Suta suta*
- any snake in the top NSW venomous classes, the QLD "dangerous animal" class or the NT dangerous categories
- every sea snake except *Emydocephalus*

## Known gaps

- **Reptile `states` are incomplete** (`statesComplete: false` on every reptile).
  - The fetch tool cuts long pages off at about 70,000 characters. Only Tasmania and Queensland's lizards came through whole.
  - We only have part of Western Australia's lizards and skinks (skinks stop at *Ctenotus*), part of Queensland's snakes (they stop at *Pseudechis*) and part of Western Australia's snakes.
  - We have nothing for reptiles in NSW, VIC, SA, NT or the ACT. For example, the Jacky Dragon shows only QLD.
  - 386 reptiles have no state at all.
  - Fix this from the Atlas of Living Australia or the Australian Faunal Directory once they can be reached. The shell couldn't reach them, and they weren't on the fetch allowlist. The NT Fauna Species Checklist (data.nt.gov.au, updated 28 September 2026) is another option, but it's XLSX only.
- **Frog `states`** come from Frogs Australia Network lists, which are older than the ASH taxonomy. 42 frogs have no state, mostly recent descriptions and splits such as *Litoria ridibunda* and *Mixophyes australis*.
- **28 species have no common name** in any source; `common` repeats the scientific name.
- **Names the state lists use that don't map to a current species:**
  - *Uperoleia capitulata* (NSW, QLD and SA lists)
  - *Uperoleia inundata* (frog lists only)
  - *Diporiphora bilineata* (NSW and QLD; since split)
  - These cells weren't applied to any species. Confirm with the authorities.
- ***Neobatrachus centralis*** is treated as *N. sudellae* (medium confidence).
- **NT-native freshwater turtles:** the list in the build is from general knowledge, not a fetched source. Those cells are low confidence.
- **RepFocus (2023) and the Endemic checklist (2018)** are older than ASH (2025). Some 2024–26 species descriptions and name changes will be missing. *Cryptophis pallidiceps* is kept, with *Rhinoplocephalus pallidiceps* as a synonym, pending confirmation.
- **The NSW list dates from 2019**, and a species freeze is in place. Re-check before relying on any NSW cell.
- **Disagreements with `matrix.json`:** none. All 46 app species carry the matrix values, with "Not permitted" written as "Not on keepable list".
