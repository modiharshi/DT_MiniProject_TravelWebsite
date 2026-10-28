// Areas per city. `coords` is a position on an illustrative 0-100 grid used only for the mini
// route maps. It is a drawn layout, not a survey. `near` lists neighbouring areas: a day may
// combine an area with one of its neighbours, never two areas that are not neighbours.
const rows = [
  // [id, cityId, name, x, y, near[], blurb]
  ['jai-old-city', 'jaipur', 'Old City', 50, 42, ['jai-amer', 'jai-bazaars', 'jai-c-scheme'], 'Palaces, lanes and the famous street-facing façade.'],
  ['jai-amer', 'jaipur', 'Amer side', 76, 14, ['jai-old-city'], 'Hill forts and lakeside views on the way out.'],
  ['jai-c-scheme', 'jaipur', 'C-Scheme', 26, 72, ['jai-old-city', 'jai-bazaars'], 'Newer streets with cafés and craft studios.'],
  ['jai-bazaars', 'jaipur', 'Bazaars', 58, 70, ['jai-old-city', 'jai-c-scheme'], 'Textiles, jewellery and snack stalls.'],

  ['mum-colaba', 'mumbai', 'Colaba', 30, 82, ['mum-fort'], 'The waterfront end of the city.'],
  ['mum-fort', 'mumbai', 'Fort', 38, 58, ['mum-colaba', 'mum-bandra'], 'Old stone buildings, museums and galleries.'],
  ['mum-bandra', 'mumbai', 'Bandra', 60, 30, ['mum-fort', 'mum-juhu'], 'Cafés, street art and a sea-facing promenade.'],
  ['mum-juhu', 'mumbai', 'Juhu', 82, 12, ['mum-bandra'], 'A long beach and late evenings.'],

  ['udr-pichola', 'udaipur', 'City Palace and Lake Pichola side', 34, 46, ['udr-old-city', 'udr-gardens'], 'Palace walls meeting the water.'],
  ['udr-old-city', 'udaipur', 'Old City and Jagdish lanes', 58, 40, ['udr-pichola', 'udr-fatehsagar'], 'Narrow lanes, rooftops and small studios.'],
  ['udr-fatehsagar', 'udaipur', 'Fatehsagar side', 80, 20, ['udr-old-city', 'udr-gardens'], 'A wide lake and a breezy promenade.'],
  ['udr-gardens', 'udaipur', 'Gardens and crafts quarter', 26, 80, ['udr-pichola', 'udr-fatehsagar'], 'Green courtyards and craft makers.'],

  ['man-mall-road', 'manali', 'Mall Road', 50, 52, ['man-old-manali', 'man-vashisht', 'man-solang'], 'The busy, walkable centre.'],
  ['man-old-manali', 'manali', 'Old Manali', 72, 30, ['man-mall-road', 'man-vashisht', 'man-solang'], 'Riverside lanes and café terraces.'],
  ['man-vashisht', 'manali', 'Vashisht', 86, 12, ['man-mall-road', 'man-old-manali'], 'A hillside village above the river.'],
  ['man-solang', 'manali', 'Solang Valley side', 20, 18, ['man-mall-road', 'man-old-manali'], 'Open slopes and mountain views.'],
];

export const AREAS = rows.map(([id, cityId, name, x, y, near, blurb]) => ({ id, cityId, name, coords: { x, y }, near, blurb }));
export const AREA_BY_ID = Object.fromEntries(AREAS.map((a) => [a.id, a]));
