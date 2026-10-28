# Xplore

An illustrated-map trip composer for India. Pick a city on a hand-drawn map, say who is travelling and
what they like, and get a day-by-day plan. Frontend only: no backend, no database, no runtime network calls.

Launch cities: Mumbai (Maharashtra), Jaipur and Udaipur (Rajasthan), Manali (Himachal Pradesh).

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # planner, data and preference tests (Node's built-in runner)
npm run build   # production build in dist/
```

- `src/data/` cities, areas, places, stays, food and the schema checks (adding a city is data only).
- `src/engine/composer.js` the rule-based Trip Composer (pure functions, deterministic).
- `src/lib/` preferences, group overlap, share links, safe storage, postcard export.
- `src/components/` map, flow steps, itinerary, dialogs.
- `VERIFY.md` everything a human should check before a public release. `USABILITY-TEST.md` is a plan, not results.

Content is drafted examples. Rows marked "(example)" are generic types, not businesses. Traveller notes are
samples, not reviews. Cost tiers are indicative.
