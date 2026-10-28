# VERIFY: things a human should double-check

Covers all phases (1 to 7). Items here need a human before any public release.

## Content and claims
- City taglines and teasers ("Chai first. Forts later.") are editorial copy, not facts.
- Each city's **general note** (heat, monsoon, snow and roads) is deliberately cautious and ends with
  "Check current conditions and access before you travel." No dates, permits or closures are stated.
- City nicknames in the cartouches (Pink City, City of Lakes, City of Dreams, Pines & Peaks) are
  common phrases; confirm you are happy with them.

## Map
- The India silhouette is a hand-placed illustration built from approximate lon/lat points. It includes
  Jammu & Kashmir and Ladakh as part of the silhouette. It is not survey-accurate and carries the caption
  "Illustrated map, not to scale." Have someone review the northern outline and neighbour labels
  (Pakistan, Nepal, Tibet, Myanmar, Sri Lanka) before any public release.
- Landmark icons are original drawings in the spirit of the reference images, not traced from them.
- The **Om** glyph uses a system Devanagari font (Kohinoor / Noto / Devanagari Sangam MN). It is the one
  piece of map art that depends on a font not bundled with the site.

## Licences
- Fonts are bundled locally through `@fontsource` packages (Manrope, Caveat, Oswald, Yellowtail), all
  SIL Open Font License. Re-confirm before public release.

## Phase 2: preferences flow

**Built:** who is travelling (Solo / Friends-Group / Family, size, a "someone is 65+" flag for families), per-city interests with a 5-pick cap, per-member picks and a group overlap panel with a compromise meter, trip details (days 1 to 5, budget tier, pace, food, low walking), a review screen. Back and Esc step back through the flow; trail crumbs jump back.

**Automated (`npm test`, 10 passing):** traveller transitions, size limits, interest scoping to the city, the 5-pick cap, city-change carry-over, "what will clear" messages, validation, detail clamping, overlap and meter maths, and that every city interest exists in the catalogue.

**Checked by hand in the in-app browser (desktop and 375px):** validation messages and focus, confirm-before-reset when shrinking a group or leaving Group, picks surviving "Keep as it is", city switch with carry-over note, review contents, no horizontal overflow on mobile, and a keyboard-only run (Enter on a marker, Tab, Space on options and cards, Enter on Continue).

**For a human to double-check**
- Interests are declared per city and are now checked against place data (see Phase 3): every interest has at least two places, and a test asserts each has an eligible place under default filters.
- The compromise meter is average pairwise overlap (Jaccard). Thresholds (30 / 60) are a design choice, explained in the UI under "How this is worked out".
- Family uses one shared pick list; only Group has per-member picks.
- Switching city from the city panel keeps picks the new city offers and tells you afterwards which were cleared; it does not warn beforehand.
- Not tested: reduced motion, screen readers, a physical touch device, tablet width, the Family and Solo review pages beyond the Solo keyboard path.


## Data: places, stays and food (Phases 3 and 4)

All content is drafted by the builder, not sourced. Descriptions are deliberately general. There are no invented hours, prices, ratings, phone numbers, addresses or historical claims.

- **Stays (23) and food spots (32) are generic examples** ("(example)", `sample: true`). No brands, no real businesses.
- **Places marked "(example)"** are generic types (a rooftop café, a puppet show). The rest carry a real name (`real: true`) and are listed below. A human should confirm each still exists, is spelled and named as locals use it, and is suitable for the audience it is tagged for.
- **Drafted attributes to confirm for every place:** `costTier` (1 to 3, indicative), `walkingLevel` (1 to 3), `seniorFriendly`, `soloFriendly`, `groupFriendly`, `bestTime` and `durationMins`. These are the builder's judgement, not data. The engine's hard filters (budget ceiling, senior and walking exclusions) are only as good as these tags.
- **Practical tips that read like claims** and should be checked or softened: dress and footwear rules at temples, "steps have no rails" at Panna Meena ka Kund, boat rides on Lake Pichola and the Fatehsagar island hop, hot springs at Vashisht, "sunset is the busiest time" on Marine Drive, weekend crowds on Mall Road, and any "best time of day" remark.
- **Safety notes** are generic and cautious. Seasonal and weather items (Solang, Jogini, orchard walk, paragliding) end with "Check current conditions and access before you travel."
- **Sample traveller notes** are one short drafted line per place, labelled "Sample traveller note". They are not reviews.
- **Area layouts** (the 0 to 100 grid used by the sketch maps) are illustrative, not geographic. The "neighbouring areas" relation that limits a day to two areas is a design choice, not a travel-time fact.
- **Times and buffers** are planning assumptions, shown as suggestions: day starts 09:00 (09:30 for relaxed, family, senior or low-walking plans), lunch at about 12:30, dinner from 19:00, travel buffers of 15, 30 or 45 minutes by area distance, rest break of 45 minutes for family, senior or low-walking plans.
- **Budget guide** counts tier points, not rupees. No amounts are claimed. Group "rough share per person" divides stay points by group size.

### Real-named places to verify

#### Mumbai

- **Gateway of India** (`mum-gateway`)
- **Colaba Causeway browse** (`mum-causeway`)
- **Grand railway terminus (CSMT)** (`mum-csmt`)
- **Fort-area heritage walk** (`mum-fort-walk`)
- **Marine Drive promenade** (`mum-marine-drive`)
- **Bandstand promenade** (`mum-bandstand`)
- **Sea Link viewpoint** (`mum-sea-link-view`)
- **Linking Road shopping** (`mum-linking-road`)
- **Juhu beach evening** (`mum-juhu-beach`)

#### Jaipur

- **Hawa Mahal** (`jai-hawa-mahal`)
- **City Palace** (`jai-city-palace`)
- **Jantar Mantar** (`jai-jantar-mantar`)
- **Govind Devji Temple** (`jai-govind-devji`)
- **Amber Fort** (`jai-amber-fort`)
- **Panna Meena ka Kund** (`jai-panna-meena`)
- **Jal Mahal viewpoint** (`jai-jal-mahal`)
- **Galta Ji temple complex** (`jai-galta-ji`)
- **Fort ridge sunset viewpoint (Nahargarh)** (`jai-nahargarh`)
- **Johari Bazaar stroll** (`jai-johari-bazaar`)
- **Bapu Bazaar textile lane** (`jai-bapu-bazaar`)
- **Hilltop marble temple (Birla Mandir)** (`jai-birla-temple`)

#### Udaipur

- **City Palace complex** (`udr-city-palace`)
- **Lake Pichola boat ride** (`udr-boat-ride`)
- **Lake Palace viewpoint** (`udr-lake-palace-view`)
- **Jagdish Temple** (`udr-jagdish`)
- **Old-city lane wander** (`udr-lanes`)
- **Fatehsagar Lake promenade** (`udr-fatehsagar-lake`)
- **Saheliyon-ki-Bari garden** (`udr-saheliyon`)
- **Royal cenotaph complex (Ahar)** (`udr-ahar`)

#### Manali

- **Hadimba Temple and cedar grove** (`man-hadimba`)
- **Mall Road evening stroll** (`man-mall-stroll`)
- **Riverside walk by the Beas** (`man-beas-walk`)
- **Old Manali bridge crossing** (`man-old-bridge`)
- **Old village shrine (Manu Temple)** (`man-manu`)
- **Waterfall trail (Jogini)** (`man-jogini`)
- **Vashisht temple and hot springs** (`man-vashisht-springs`)
- **Solang Valley day (views, optional activities)** (`man-solang`)

sample places: 41 real-named: 37


## Planner rules (Phase 3)

Hard constraints (never traded for a better score): city; budget ceiling for stops, stays and food (tier at or below the chosen tier); veg and Jain diets for every meal; solo requires solo-friendly; group and family require group-friendly; seniors require senior-friendly and exclude walking level 3; low walking excludes walking level 3; same-day stops come from at most two neighbouring areas; no duplicate stops; at least two stops per day.
Soft preferences (ranking only): interest match (weighted across members), traveller fit (hostels and homestays for solo, comfort stays for family), pace, short stops when relaxed, area closeness for stays and meals.
Stops per day: relaxed 3, balanced 4, packed 5, capped at 4 for families and low walking, and at 3 with seniors.
If the data cannot fill every requested day, the plan says so, shows only the days it can fill, and offers to relax days, low walking or budget. It does not invent stops. Meals may repeat when too few match the diet and budget, and the plan says so.

## What was actually tested

**Automated (`npm test`, 59 tests, all passing):**
- Preference rules (10) and shared-link encode/decode with tampered links (2).
- Data schema and references (3): unique ids, area and city references, categories, tiers, durations, reciprocal neighbours, every interest has at least two places.
- Composer acceptance tests, run for all four cities (11 each): lowest budget with food and art interests (no tier above the ceiling, food every day); two-area days, no duplicates, no empty days at every pace; veg and Jain meals; solo friendliness and hostel or homestay stays; family with seniors (limit, flags, rest breaks); group of five each gets a matching stop; 3 to 2 days; every interest has an eligible place; no overlapping or out-of-order times; "Not this one" swaps. Plus determinism and no stale data after a city change, an insufficient-data case with a working relaxation, the tier-point tally, and "balance this day".

**Manual developer checks in the in-app browser:** Jaipur group-of-three flow through Compose to the itinerary; shared link rebuild; swap messages (both success and "no other place"); details dialog (focus moves in, Escape closes it); votes; save trip with stamp; My trips and About dialogs; Lite mode; a Manali family-with-seniors link at 375px (no horizontal overflow, swipeable days, rest breaks, at most 3 stops a day); keyboard-only run through the early steps; a Mumbai solo link at the lowest budget with Jain food and the Meet people toggle; save with storage simulated as blocked.

**Not tested:** real users (see USABILITY-TEST.md), screen readers, real touch hardware, Safari and Firefox (only the in-app Chromium browser was used), `prefers-reduced-motion` with the OS setting (code paths and Lite mode inspected, Lite mode observed), print preview (stylesheet written, not rendered), the content of the exported postcard PNG (a PNG blob was produced and the download triggered without errors, but the image was not opened and looked at), a browser that truly blocks localStorage (only simulated by making `setItem` throw, which showed the "Saving is unavailable" messages), contrast ratios (not measured with a tool), tablet width.
