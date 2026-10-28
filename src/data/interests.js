// Interest catalogue. A city lists the ids it offers (and may relabel them) in cities.js.
// Eligibility rule: a city only lists an interest it can back with places. Place data arrives
// with the planner (Phase 3); until then the lists below are declared, not yet cross-checked.
export const INTERESTS = {
  'street-food': { id: 'street-food', label: 'Street Food', hint: 'Stalls, snacks, queues worth joining' },
  'local-food': { id: 'local-food', label: 'Local Food', hint: 'Regional plates and home-style kitchens' },
  cafes: { id: 'cafes', label: 'Cafés', hint: 'Slow coffee and long sit-downs' },
  heritage: { id: 'heritage', label: 'Heritage', hint: 'Old walls, old stories' },
  'art-galleries': { id: 'art-galleries', label: 'Art & Galleries', hint: 'Studios, walls and exhibitions' },
  'art-crafts': { id: 'art-crafts', label: 'Art & Crafts', hint: 'Makers, prints and workshops' },
  beaches: { id: 'beaches', label: 'Beaches & Waterfront', hint: 'Sea air and promenades' },
  shopping: { id: 'shopping', label: 'Shopping', hint: 'Markets and things to carry home' },
  nightlife: { id: 'nightlife', label: 'Nightlife', hint: 'Music and late evenings' },
  temples: { id: 'temples', label: 'Temples', hint: 'Quiet courtyards and old shrines' },
  offbeat: { id: 'offbeat', label: 'Offbeat', hint: 'Lanes and corners off the usual route' },
  'lakes-sunsets': { id: 'lakes-sunsets', label: 'Lakes & Sunsets', hint: 'Water, boats and golden hours' },
  'nature-adventure': { id: 'nature-adventure', label: 'Nature & Adventure', hint: 'Trails, views and a little thrill' },
};

export const MAX_PICKS = 5;
