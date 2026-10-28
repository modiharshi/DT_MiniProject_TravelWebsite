// Stays are generic, labelled examples (sample: true). No brand names, prices or ratings.
// row: [id, areaId, name, type, costTier, flags, description, tags[]]   flags: S solo, G group, N senior
import { AREA_BY_ID } from './areas.js';

const rows = [
  ['jai-hostel-old', 'jai-old-city', 'Social hostel in the old city (example)', 'hostel', 1, 'SG', 'A generic hostel with shared common rooms, suited to people who want to meet others.', ['social']],
  ['jai-homestay-old', 'jai-old-city', 'Family-run homestay (example)', 'homestay', 1, 'SGN', 'A generic homestay with home cooking and a host to ask for tips.', ['social']],
  ['jai-homestay-cs', 'jai-c-scheme', 'Quiet homestay in C-Scheme (example)', 'homestay', 1, 'SGN', 'A generic calm homestay in a leafy neighbourhood.', []],
  ['jai-hotel-bazaar', 'jai-bazaars', 'Comfortable hotel near the bazaars (example)', 'hotel', 2, 'SGN', 'A generic mid-range hotel with lifts, a restaurant and easy access to the market streets.', ['comfort']],
  ['jai-hotel-cs', 'jai-c-scheme', 'Garden hotel in C-Scheme (example)', 'hotel', 2, 'SGN', 'A generic hotel with a courtyard garden and quiet rooms.', ['comfort']],
  ['jai-heritage-amer', 'jai-amer', 'Heritage haveli stay (example)', 'heritage', 3, 'SGN', 'A generic restored mansion with courtyards and period details.', ['comfort']],

  ['mum-hostel-fort', 'mum-fort', 'Social hostel in Fort (example)', 'hostel', 1, 'SG', 'A generic hostel near the old stone buildings, with a shared lounge.', ['social']],
  ['mum-homestay-colaba', 'mum-colaba', 'Homestay near Colaba (example)', 'homestay', 1, 'SGN', 'A generic homestay in a residential building with a host family.', ['social']],
  ['mum-homestay-bandra', 'mum-bandra', 'Bandra guest house (example)', 'homestay', 1, 'SGN', 'A generic guest house on a quiet street close to cafés.', []],
  ['mum-hotel-colaba', 'mum-colaba', 'Comfortable hotel in Colaba (example)', 'hotel', 2, 'SGN', 'A generic mid-range hotel with lifts and breakfast included.', ['comfort']],
  ['mum-hotel-juhu', 'mum-juhu', 'Beach-side hotel in Juhu (example)', 'hotel', 2, 'SGN', 'A generic hotel with sea air and easy beach access.', ['comfort']],
  ['mum-heritage-colaba', 'mum-colaba', 'Heritage waterfront hotel (example)', 'heritage', 3, 'SGN', 'A generic grand old hotel with high ceilings and harbour views.', ['comfort']],

  ['udr-hostel-old', 'udr-old-city', 'Rooftop hostel in the old city (example)', 'hostel', 1, 'SG', 'A generic hostel with a rooftop for evening conversation.', ['social']],
  ['udr-homestay-pichola', 'udr-pichola', 'Lake-side homestay (example)', 'homestay', 1, 'SGN', 'A generic family-run homestay close to the water.', ['social']],
  ['udr-homestay-gardens', 'udr-gardens', 'Garden homestay (example)', 'homestay', 1, 'SGN', 'A generic quiet homestay near green courtyards.', []],
  ['udr-hotel-fateh', 'udr-fatehsagar', 'Lake-view hotel (example)', 'hotel', 2, 'SGN', 'A generic mid-range hotel with a lake outlook.', ['comfort']],
  ['udr-heritage-pichola', 'udr-pichola', 'Heritage lakeside stay (example)', 'heritage', 3, 'SGN', 'A generic restored mansion with lake-facing terraces.', ['comfort']],

  ['man-hostel-old', 'man-old-manali', 'Backpackers’ hostel in Old Manali (example)', 'hostel', 1, 'SG', 'A generic hostel with a river view and a shared kitchen.', ['social']],
  ['man-homestay-vashisht', 'man-vashisht', 'Hillside homestay (example)', 'homestay', 1, 'SGN', 'A generic homestay with home-style meals and valley views.', ['social']],
  ['man-homestay-mall', 'man-mall-road', 'Homestay near Mall Road (example)', 'homestay', 1, 'SGN', 'A generic homestay within walking distance of the centre.', []],
  ['man-cottage-old', 'man-old-manali', 'Wooden cottage (example)', 'cottage', 2, 'SGN', 'A generic cosy cottage with a heater and a small balcony.', ['comfort']],
  ['man-hotel-mall', 'man-mall-road', 'Comfortable hotel on the main road (example)', 'hotel', 2, 'SGN', 'A generic mid-range hotel with lifts and breakfast.', ['comfort']],
  ['man-cottage-solang', 'man-solang', 'Valley-edge cottage (example)', 'cottage', 3, 'SG', 'A generic cottage near open slopes. Access depends on the road.', ['comfort']],
];

export const STAYS = rows.map(([id, areaId, name, type, costTier, flags, description, tags]) => ({
  id, name, cityId: AREA_BY_ID[areaId].cityId, areaId, type, costTier, description, tags,
  soloFriendly: flags.includes('S'), groupFriendly: flags.includes('G'), seniorFriendly: flags.includes('N'),
  sample: true,
}));
export const STAY_BY_ID = Object.fromEntries(STAYS.map((s) => [s.id, s]));
