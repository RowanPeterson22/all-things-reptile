## Changes needed in the app (found 8 Nov 2026)

Checked against `src/data/states.js` (on `origin/main`, last commit 7 Nov 2026), the licence grids in `src/pages/species/**`, `src/data/australianSpecies.json` and the research files `full-*.json` and `matrix.json`.

### states.js

1. **QLD `minage`**: change "No minimum stated" to "13+ (13–17 with a supervising guardian)". Source: https://www.qld.gov.au/environment/plants-animals/wildlife-permits/permit-types/wildlife-licence/keeping-native-animals/do-i-need-a-licence/how-to-apply
2. **QLD `cost`**: change "5-year licence; fee varies by tier" to "5-year licence: Standard $68.20, Specialised $365.10 (2026–27)". Source: https://ablis.business.gov.au/service/qld/standard-licence/43048 and https://ablis.business.gov.au/service/qld/specialised-licence/43047 (ABLIS is secondary; the Advanced fee is unconfirmed)
3. **QLD `notes`**: add "A Standard licence can't include venomous snakes; on Standard and Specialised you can't sell or give away an animal within 6 months of getting it." Source: https://www.qld.gov.au/environment/plants-animals/wildlife-permits/permit-types/keeping-native-animals/native-animal
4. **ACT `cost`**: change "Fee per animal applies" to "$21.96 (fewer than 20 animals) or $56.07 (20 or more) for 3 years (2026–27); hobby import/export free". Source: https://www.legislation.act.gov.au/DownloadFile/di/2026-133/current/PDF/2026-133.PDF
5. **ACT `notes`**: add "Venomous snakes can't be kept privately in the ACT." Source: https://legislation.act.gov.au/DownloadFile/ni/2024-486/current/PDF/2024-486.PDF
6. **ACT `notes`**: add "Tadpoles and juveniles of the Striped Marsh, Eastern Banjo and Spotted Grass Frog are exempt; adults need a licence." Source: https://www.act.gov.au/environment/animals-and-plants/licensing-of-plants-and-animals/keeping-or-selling-animals-in-the-act
7. **NT `phone`**: change "1300 246 445" (not found on any official page) to "08 8999 4795". Source: https://nt.gov.au/parks/contact-parks-and-wildlife
8. **NT `notes`**: change "Allow at least 5 working days" to "Allow at least 5 working days (2 weeks for higher-risk venomous snake permits)". Source: https://nt.gov.au/environment/animals/keeping-wildlife-as-pets/keeping-snakes/permits-for-venomous-snakes
9. **NT `cost`**: change "Fee applies for permit species" to "Contact the Permits Office for fees" (no fee is published). Source: https://ablis.business.gov.au/service/nt/permit-to-keep-protected-or-prohibited-wildlife/3261
10. **NSW `cost`**: change "Companion $50 for 5 years; basic from $63 per tier" to "Companion $50 for 5 years; Class 1 from $63 per class (2 years); Advanced from $120 per class (2 years)". NSW doesn't use "basic". Source: https://www.environment.nsw.gov.au/licences-and-permits/wildlife-licences/native-animals-as-pets/apply-for-a-native-animal-keeper-licence
11. **NSW `notes`**: add "You can't sell or give away an animal within 6 months of getting it unless you bred it. Records are due by 30 April." Source: https://www.environment.nsw.gov.au/licences-and-permits/wildlife-licences/native-animals-as-pets/maintain-a-licence
12. **NSW `minage`**: add "for under-16s a parent or guardian applies in their own name". Source: as item 10.
13. **SA `cost`**: change "Fee applies — see DEW fee schedule" to "Basic $97/yr, Specialist $157/yr (2026–27); 3- and 5-year options". Source: https://cdn.environment.sa.gov.au/environment/docs/Wildlife-permit-fees-26-27.pdf
14. **WA `notes`**: "DBCA reviewed the species list in late 2025" reads as finished. Change it to "DBCA is reviewing the species list (submissions closed October 2025; no changes published yet) — check the current list before buying." Source: https://www.dbca.wa.gov.au/node/12264
15. **WA `notes`**: change "at least 12 months on a standard licence" to "a record of holding a standard licence and 12 months' compliance with licence conditions". Source: https://dbca.wa.gov.au/media/772/download (sections 5.1.6–5.1.8)
16. **TAS `notes`**: add "Up to six each of the Metallic Skink, Spotted Skink, Common Froglet and Brown Tree Frog can be kept without a permit if collected outside reserves. Permits expire 31 July and need an annual return." Source: https://nre.tas.gov.au/wildlife-management/living-with-wildlife/reptiles-in-captivity/herpetology-in-tasmania and https://nre.tas.gov.au/wildlife-management/forms-permits-and-fees/herpetofauna-permits
17. **VIC `notes`** (optional): add "Annual return due before 14 April." Source: https://www.vic.gov.au/private-licence-obligations-and-record-keeping
18. **All `verifyDisclaimer` values**: keep "Checked November 2026". Nothing else in them changes.

### Licence grids and species data

19. **Grids**: no keepability changes. Every state's cells match `full-*.json`, and the NSW, VIC, QLD, SA, WA, TAS, ACT and NT wording uses each authority's own licence names.
20. **ACT, Striped Marsh Frog** (`StripedMarshFrogPage.jsx`) (optional): "Keeper licence (case by case)" is right for adults. Consider adding a note that tadpoles and juveniles are exempt. Source: as item 6.
21. **Research files, for the next dated folder only (don't edit the 2026-11 folder):** `full-NSW.json` and `matrix.json` label NSW's middle tier "Basic licence". NSW calls it the "Class 1" licence. The shipped grids and `australianSpecies.json` already say "Class 1". `matrix.json` also says "Licence needed" for Striped Marsh Frog in the ACT, while `full-ACT.json` says "No licence needed" (tadpoles and juveniles only). Record both stages.

### Facts in the brief that were confirmed (no change)
NSW: at least 8 weeks and the BHR Wildlife Team. ACT: no exempt reptiles from 15 May 2026. QLD, WA and ACT: no exempt reptiles. VIC, SA and NT: some exempt reptiles. TAS: Tasmanian natives only and no private imports. SA: Biodiversity Act being phased in. WA: list review held in late 2025. Dubia: not on the Live Import List, with the June 2026 seizure. The Dubia facts are confirmed through secondary reports quoting DCCEEW; the DCCEEW page couldn't be read directly.
