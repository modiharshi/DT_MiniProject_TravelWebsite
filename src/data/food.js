// Food spots are generic, labelled examples (sample: true). diet lists what the place can serve:
// a Jain-friendly place is also veg. A non-veg preference accepts everything.
// row: [id, areaId, name, cuisineTags[], diet[], costTier, mealSlots[], description]
import { AREA_BY_ID } from './areas.js';

const V = ['veg'], VJ = ['veg', 'jain'], VN = ['veg', 'nonveg'], N = ['nonveg'];

const rows = [
  ['jai-f-kachori', 'jai-old-city', 'Kachori and chai breakfast counter (example)', ['street', 'breakfast'], V, 1, ['breakfast', 'snack'], 'A quick, filling start with fried snacks and sweet tea.'],
  ['jai-f-thali', 'jai-old-city', 'Family-run Rajasthani thali place (example)', ['thali'], VJ, 1, ['lunch', 'dinner'], 'A generic family kitchen serving a full vegetarian thali.'],
  ['jai-f-lassi', 'jai-bazaars', 'Lassi and sweets shop (example)', ['sweets'], VJ, 1, ['snack', 'breakfast'], 'A generic stop for a cold drink and something sweet.'],
  ['jai-f-dalbaati', 'jai-bazaars', 'Bazaar-side dal baati spot (example)', ['regional'], VJ, 1, ['lunch', 'dinner'], 'A generic stop for hearty regional vegetarian food.'],
  ['jai-f-brunch', 'jai-c-scheme', 'Café with all-day brunch (example)', ['cafe'], VN, 2, ['breakfast', 'lunch'], 'A generic café with a mixed menu.'],
  ['jai-f-meat', 'jai-c-scheme', 'Non-veg Rajasthani kitchen (example)', ['regional'], N, 2, ['dinner', 'lunch'], 'A generic restaurant for slow-cooked meat dishes.'],
  ['jai-f-canteen', 'jai-amer', 'Simple fort-side lunch canteen (example)', ['thali'], VJ, 1, ['lunch', 'snack'], 'A generic canteen for an easy lunch near the hills.'],
  ['jai-f-roof', 'jai-old-city', 'Rooftop dinner with courtyard views (example)', ['multi'], VN, 3, ['dinner'], 'A generic rooftop restaurant for a special evening.'],

  ['mum-f-breakfast', 'mum-colaba', 'Café-style breakfast counter (example)', ['cafe', 'breakfast'], VN, 1, ['breakfast'], 'A generic counter for eggs, toast and tea.'],
  ['mum-f-thali', 'mum-fort', 'Veg thali canteen (example)', ['thali'], VJ, 1, ['lunch', 'dinner'], 'A generic canteen for a quick, full vegetarian meal.'],
  ['mum-f-vada', 'mum-fort', 'Vada pav and chai stand (example)', ['street'], VJ, 1, ['snack', 'breakfast'], 'A generic stand for the city’s favourite snack.'],
  ['mum-f-pav', 'mum-bandra', 'Neighbourhood pav bhaji spot (example)', ['street'], VJ, 1, ['lunch', 'dinner'], 'A generic spot for buttery pav bhaji.'],
  ['mum-f-seafood', 'mum-bandra', 'Coastal seafood kitchen (example)', ['seafood'], N, 2, ['lunch', 'dinner'], 'A generic kitchen for coastal fish and prawn dishes.'],
  ['mum-f-irani', 'mum-colaba', 'Old-style Irani café (example)', ['irani'], VN, 2, ['dinner', 'lunch'], 'A generic café for bun maska, keema and tea.'],
  ['mum-f-chaat', 'mum-juhu', 'Beachside chaat stalls (example)', ['street'], VJ, 1, ['snack', 'dinner'], 'A generic cluster of stalls on the sand.'],
  ['mum-f-sea-view', 'mum-juhu', 'Sea-view restaurant (example)', ['multi'], VN, 3, ['dinner'], 'A generic restaurant with a view of the water.'],

  ['udr-f-bakery', 'udr-old-city', 'Courtyard breakfast bakery (example)', ['cafe', 'breakfast'], V, 1, ['breakfast', 'snack'], 'A generic courtyard bakery for a slow start.'],
  ['udr-f-thali', 'udr-pichola', 'Home-style thali kitchen (example)', ['thali'], VJ, 1, ['lunch', 'dinner'], 'A generic home-style kitchen for a vegetarian thali.'],
  ['udr-f-snacks', 'udr-fatehsagar', 'Lake-road snack carts (example)', ['street'], VJ, 1, ['snack', 'dinner'], 'A generic row of carts for corn, chaat and tea.'],
  ['udr-f-dalbaati', 'udr-gardens', 'Garden-side regional lunch (example)', ['regional'], VJ, 1, ['lunch', 'dinner'], 'A generic stop for local vegetarian dishes.'],
  ['udr-f-meat', 'udr-old-city', 'Non-veg regional kitchen (example)', ['regional'], N, 2, ['dinner', 'lunch'], 'A generic restaurant for meat curries.'],
  ['udr-f-brunch', 'udr-pichola', 'Lakeside brunch café (example)', ['cafe'], VN, 2, ['breakfast', 'lunch'], 'A generic café with water views.'],
  ['udr-f-roof', 'udr-old-city', 'Rooftop dinner above the lanes (example)', ['multi'], VN, 3, ['dinner'], 'A generic rooftop restaurant for a long evening.'],
  ['udr-f-sweets', 'udr-old-city', 'Sweets and kachori shop (example)', ['sweets'], VJ, 1, ['snack', 'breakfast'], 'A generic shop for quick bites and sweets.'],

  ['man-f-bakery', 'man-old-manali', 'Mountain bakery breakfast (example)', ['cafe', 'breakfast'], V, 1, ['breakfast', 'snack'], 'A generic bakery with warm bread and hot drinks.'],
  ['man-f-thali', 'man-vashisht', 'Himachali thali kitchen (example)', ['thali'], VJ, 1, ['lunch', 'dinner'], 'A generic home-style kitchen for a mountain thali.'],
  ['man-f-siddu', 'man-mall-road', 'Siddu and snack stall (example)', ['street'], V, 1, ['snack', 'breakfast'], 'A generic stall for steamed bread and mountain snacks.'],
  ['man-f-momo', 'man-mall-road', 'Momo and thukpa counter (example)', ['tibetan'], VN, 1, ['lunch', 'dinner', 'snack'], 'A generic counter for dumplings and hot soup.'],
  ['man-f-dhaba', 'man-mall-road', 'Roadside dhaba (example)', ['dhaba'], VJ, 1, ['lunch', 'dinner'], 'A generic dhaba for dal, roti and sabzi.'],
  ['man-f-trout', 'man-old-manali', 'River-side trout kitchen (example)', ['regional'], N, 2, ['lunch', 'dinner'], 'A generic kitchen for fresh river fish.'],
  ['man-f-cafe', 'man-old-manali', 'Café terrace dinner (example)', ['cafe'], VN, 2, ['dinner', 'lunch'], 'A generic café terrace with a mixed menu.'],
  ['man-f-grill', 'man-vashisht', 'Valley-view grill (example)', ['multi'], VN, 3, ['dinner'], 'A generic grill restaurant with a view.'],
];

export const FOOD = rows.map(([id, areaId, name, cuisineTags, diet, costTier, mealSlots, description]) => ({
  id, name, cityId: AREA_BY_ID[areaId].cityId, areaId, cuisineTags, diet, costTier, mealSlot: mealSlots, description, sample: true,
}));
export const FOOD_BY_ID = Object.fromEntries(FOOD.map((f) => [f.id, f]));
