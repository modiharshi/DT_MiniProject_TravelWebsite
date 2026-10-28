// Places. Authored as compact rows, expanded to the full schema below.
// Descriptions are general on purpose: what kind of place it is and who it suits. No hours, prices,
// ratings or addresses. Rows whose name ends "(example)" are generic types, marked sample: true.
// Rows with a real name carry real: true and are listed in VERIFY.md for a human to confirm.
//
// row: [id, areaId, name, category, tags[], mins, costTier, bestTime, flags, walk, art, description, note, safety?]
//   flags: S solo-friendly, G group-friendly, N senior-friendly (letters present = true)
//   art: key of a bundled illustration (see PlaceArt), or '' to use the first interest's icon
import { AREA_BY_ID } from './areas.js';

const CURRENT = 'Check current conditions and access before you travel.';
const CROWD = 'Busy at peak hours. Keep valuables close.';
const EVENING = 'Stick to well-lit, busy stretches after dark.';

const rows = [
  // ---------------- Jaipur ----------------
  ['jai-hawa-mahal', 'jai-old-city', 'Hawa Mahal', 'landmark', ['heritage'], 45, 1, 'morning', 'SGN', 1, 'hawa', 'A famous street-facing façade with rows of small latticed windows, best taken in slowly from across the road.', 'Early light makes it easier to look at without the crowds.'],
  ['jai-city-palace', 'jai-old-city', 'City Palace', 'palace', ['heritage', 'art-crafts'], 120, 2, 'morning', 'SGN', 2, 'fort', 'A palace complex of courtyards, galleries and museum rooms, good for an unhurried look at royal life and craft.', 'Give it a proper block of time rather than a quick pass.'],
  ['jai-jantar-mantar', 'jai-old-city', 'Jantar Mantar', 'landmark', ['heritage', 'offbeat'], 60, 1, 'morning', 'SGN', 1, '', 'An open-air collection of large stone instruments that suits curious minds and photographers.', 'A guide or audio explainer makes the shapes make sense.'],
  ['jai-govind-devji', 'jai-old-city', 'Govind Devji Temple', 'temple', ['temples'], 45, 1, 'any', 'SGN', 1, 'om', 'A well-loved temple inside the old city where visits tend to be calm and devotional.', 'Dress modestly and keep shoes outside.'],
  ['jai-chai-lane', 'jai-old-city', 'Old-city chai and kachori lane (example)', 'food-walk', ['street-food'], 60, 1, 'morning', 'SGN', 1, 'diya', 'A generic morning lane of chai, fried snacks and sweets, the kind of stop that works best on an empty stomach.', 'Go where the queue is.', CROWD],
  ['jai-rooftop-cafe', 'jai-old-city', 'Rooftop café above the old city (example)', 'cafe', ['cafes', 'offbeat'], 60, 2, 'evening', 'SG', 2, '', 'A generic rooftop café for a slow drink while the lights come on. Usually up a few flights of stairs.', 'Ask for a table facing the street.'],
  ['jai-amber-fort', 'jai-amer', 'Amber Fort', 'fort', ['heritage'], 150, 2, 'morning', 'SG', 3, 'fort', 'A hill fort with wide courtyards, mirrored halls and long views. Expect slopes and steps.', 'Wear shoes you can climb in.'],
  ['jai-panna-meena', 'jai-amer', 'Panna Meena ka Kund', 'landmark', ['offbeat', 'heritage'], 40, 1, 'morning', 'SG', 2, '', 'A geometric stepped water tank that photographs well and is quieter than the big names nearby.', 'The steps have no rails, so go carefully.'],
  ['jai-jal-mahal', 'jai-amer', 'Jal Mahal viewpoint', 'viewpoint', ['heritage'], 30, 1, 'evening', 'SGN', 1, 'lake', 'A pause by the water to look at a palace that seems to float. Looked at from the roadside.', 'Good for a short evening stop on the way back.'],
  ['jai-galta-ji', 'jai-amer', 'Galta Ji temple complex', 'temple', ['temples', 'offbeat'], 90, 1, 'morning', 'SG', 3, '', 'A hillside group of shrines and pools that rewards people who like walking and a bit of wildness.', 'Expect uneven paths and keep an eye on your belongings.', CURRENT],
  ['jai-nahargarh', 'jai-amer', 'Fort ridge sunset viewpoint (Nahargarh)', 'viewpoint', ['heritage', 'offbeat'], 90, 1, 'evening', 'SG', 2, 'fort', 'A ridge-top spot for looking back over the city as the light goes.', 'Carry water and leave before it is fully dark.', EVENING],
  ['jai-johari-bazaar', 'jai-bazaars', 'Johari Bazaar stroll', 'market', ['shopping'], 90, 1, 'afternoon', 'SGN', 2, 'kite', 'A busy market street of jewellery, textiles and small workshops. Good for looking more than buying.', 'Politely compare before you commit.', CROWD],
  ['jai-bapu-bazaar', 'jai-bazaars', 'Bapu Bazaar textile lane', 'market', ['shopping', 'art-crafts'], 75, 1, 'afternoon', 'SGN', 2, 'rangoli', 'Rows of fabric, footwear and printed cloth in a lively lane. A good place to spot block-print patterns.', 'Late afternoon is livelier and cooler.', CROWD],
  ['jai-evening-stalls', 'jai-bazaars', 'Evening snack stalls (example)', 'food-walk', ['street-food'], 75, 1, 'evening', 'SGN', 1, '', 'A generic cluster of evening stalls for chaat, sweets and hot snacks.', 'Choose busy stalls with fresh turnover.', CROWD],
  ['jai-block-print', 'jai-c-scheme', 'Block-printing workshop (example)', 'craft', ['art-crafts'], 120, 2, 'afternoon', 'SGN', 1, 'rangoli', 'A generic hands-on session where you print a small cloth with carved wooden blocks.', 'You keep what you make.'],
  ['jai-birla-temple', 'jai-c-scheme', 'Hilltop marble temple (Birla Mandir)', 'temple', ['temples'], 45, 1, 'evening', 'SGN', 1, 'om', 'A bright temple on a small rise that is especially pleasant at dusk.', 'Shoes and phones are usually kept outside.'],
  ['jai-garden-cafe', 'jai-c-scheme', 'Garden café (example)', 'cafe', ['cafes'], 60, 2, 'any', 'SGN', 1, '', 'A generic café with a shaded garden, suited to a slow lunch or a break between sights.', 'A good rest stop on a hot day.'],
  ['jai-coffee-roaster', 'jai-c-scheme', 'Neighbourhood coffee roastery (example)', 'cafe', ['cafes', 'offbeat'], 45, 1, 'morning', 'SGN', 1, '', 'A generic small roastery that suits people who like to sit with a good cup before the day starts.', 'Order something to share.'],
  ['jai-lane-art', 'jai-c-scheme', 'Lane-art walk (example)', 'activity', ['offbeat', 'art-crafts'], 75, 1, 'afternoon', 'SG', 2, '', 'A generic wander through walls and doorways painted by local artists.', 'Good with a camera and no plan.'],
  ['jai-puppet', 'jai-c-scheme', 'Puppet show evening (example)', 'activity', ['art-crafts', 'offbeat'], 60, 1, 'evening', 'SGN', 1, 'peacock', 'A generic folk puppet performance that works well for families and groups.', 'Short, colourful and easy to enjoy.'],

  // ---------------- Mumbai ----------------
  ['mum-gateway', 'mum-colaba', 'Gateway of India', 'landmark', ['heritage'], 45, 1, 'any', 'SGN', 1, 'gateway', 'A grand stone arch by the harbour where the city comes to stroll, people-watch and take photos.', 'Early morning is calmer than evenings.', CROWD],
  ['mum-causeway', 'mum-colaba', 'Colaba Causeway browse', 'market', ['shopping'], 90, 1, 'afternoon', 'SGN', 2, 'kite', 'A busy shopping street of street stalls, bookshops and small boutiques.', 'Keep your bag in front.', CROWD],
  ['mum-colaba-cafe', 'mum-colaba', 'Heritage-style café near the waterfront (example)', 'cafe', ['cafes', 'heritage'], 60, 2, 'morning', 'SGN', 1, '', 'A generic old-style café for a slow breakfast with a long window.', 'Come early to avoid the queue.'],
  ['mum-colaba-gallery', 'mum-colaba', 'Contemporary art gallery stop (example)', 'museum', ['art-galleries'], 75, 1, 'afternoon', 'SGN', 1, '', 'A generic gallery visit for current work by local artists.', 'A good, cool break from the street.'],
  ['mum-csmt', 'mum-fort', 'Grand railway terminus (CSMT)', 'landmark', ['heritage'], 30, 1, 'morning', 'SGN', 1, '', 'A grand Victorian-style station building worth a look from outside, with the city rushing through it.', 'Look from the outside. It is a working station.', CROWD],
  ['mum-fort-walk', 'mum-fort', 'Fort-area heritage walk', 'landmark', ['heritage'], 120, 1, 'morning', 'SG', 2, '', 'A walk through old civic buildings, stone facades and shady lanes, best done early.', 'Wear comfortable shoes.'],
  ['mum-museum', 'mum-fort', 'City museum visit (example)', 'museum', ['heritage', 'art-galleries'], 120, 2, 'morning', 'SGN', 1, '', 'A generic museum stop for art, objects and local history in cool, quiet halls.', 'A good rainy-day option.'],
  ['mum-gallery-district', 'mum-fort', 'Gallery district stroll (example)', 'museum', ['art-galleries'], 75, 1, 'afternoon', 'SGN', 1, '', 'A generic short loop between small galleries and art shops.', 'Pick two or three and skip the rest.'],
  ['mum-fort-street-food', 'mum-fort', 'Street-food lane near the old market (example)', 'food-walk', ['street-food'], 60, 1, 'evening', 'SGN', 1, '', 'A generic lane for sandwiches, chaat and chai when offices let out.', 'Go with an appetite and little else.', CROWD],
  ['mum-marine-drive', 'mum-fort', 'Marine Drive promenade', 'viewpoint', ['beaches'], 60, 1, 'evening', 'SGN', 1, 'waves', 'A long curved promenade where people sit on the sea wall and watch the sky change.', 'Sunset is the busiest time. Arrive a bit early.', CROWD],
  ['mum-vada-pav', 'mum-bandra', 'Vada pav stall crawl (example)', 'food-walk', ['street-food'], 45, 1, 'any', 'SGN', 1, 'diya', 'A generic stop at a couple of stalls for the city’s most famous snack.', 'Share one and compare.'],
  ['mum-bandstand', 'mum-bandra', 'Bandstand promenade', 'viewpoint', ['beaches'], 60, 1, 'evening', 'SGN', 1, 'palm', 'A sea-facing promenade with rocks to sit on and a relaxed local crowd.', 'Stay on the path and away from the wet rocks.', 'Rocks near the water can be slippery.'],
  ['mum-sea-link-view', 'mum-bandra', 'Sea Link viewpoint', 'viewpoint', ['beaches'], 30, 1, 'evening', 'SGN', 1, 'sealink', 'A short stop to look at a long cable-stayed bridge lit up over the water.', 'Best as the day ends.'],
  ['mum-street-art', 'mum-bandra', 'Street-art lanes (example)', 'activity', ['art-galleries'], 75, 1, 'afternoon', 'SGN', 2, '', 'A generic wander past murals and painted walls.', 'Pause for a chai halfway.'],
  ['mum-cafe-lane', 'mum-bandra', 'Café lane (example)', 'cafe', ['cafes'], 75, 2, 'afternoon', 'SGN', 1, '', 'A generic lane of small cafés for coffee, desserts and long chats.', 'Pick the one with the quietest tables.'],
  ['mum-linking-road', 'mum-bandra', 'Linking Road shopping', 'market', ['shopping'], 90, 1, 'afternoon', 'SGN', 2, 'kite', 'A busy shopping street for clothes, footwear and accessories.', 'Bargain gently and compare.', CROWD],
  ['mum-live-music', 'mum-bandra', 'Live-music evening (example)', 'activity', ['nightlife'], 120, 2, 'evening', 'SG', 1, 'sitar', 'A generic venue for live music and a drink. Check the line-up in advance.', 'Book a cab for the ride home.', EVENING],
  ['mum-juhu-beach', 'mum-juhu', 'Juhu beach evening', 'nature', ['beaches', 'street-food'], 90, 1, 'evening', 'SGN', 1, 'palm', 'A wide city beach for a sunset stroll with snack stalls along the sand.', 'Enjoy the view and keep out of the water.', 'Check sea and tide conditions before entering the water.'],
  ['mum-juhu-cafe', 'mum-juhu', 'Seaside breakfast café (example)', 'cafe', ['cafes', 'beaches'], 60, 2, 'morning', 'SGN', 1, '', 'A generic café near the beach for a slow start.', 'Ask for a table outside.'],
  ['mum-late-night', 'mum-juhu', 'Late-night beachside hangout (example)', 'activity', ['nightlife', 'beaches'], 90, 1, 'evening', 'SG', 1, '', 'A generic late evening of tea stalls, music and sea air.', 'Go with company and head home before it gets empty.', EVENING],

  // ---------------- Udaipur ----------------
  ['udr-city-palace', 'udr-pichola', 'City Palace complex', 'palace', ['heritage', 'art-crafts'], 120, 2, 'morning', 'SGN', 2, 'fort', 'A palace complex of courtyards, balconies and museum rooms that sits above the water.', 'Take your time on the upper floors.'],
  ['udr-boat-ride', 'udr-pichola', 'Lake Pichola boat ride', 'activity', ['lakes-sunsets'], 60, 2, 'evening', 'SGN', 1, 'sailboat', 'A gentle boat ride on the lake with the palace walls and ghats gliding past.', 'Book a seat for just before sunset.', 'Follow boat crew instructions and wear a life jacket.'],
  ['udr-lake-palace-view', 'udr-pichola', 'Lake Palace viewpoint', 'viewpoint', ['lakes-sunsets', 'heritage'], 30, 1, 'evening', 'SGN', 1, 'lake', 'A short pause to look at a white palace set in the middle of the water.', 'Best at golden hour.'],
  ['udr-ghat-sunset', 'udr-pichola', 'Lakeside ghat at sunset (example)', 'nature', ['lakes-sunsets'], 60, 1, 'evening', 'SGN', 1, 'lake', 'A generic stone ghat for sitting with your feet near the water as the light turns gold.', 'Bring a small snack.'],
  ['udr-neighbourhood-shrine', 'udr-pichola', 'Quiet neighbourhood shrine (example)', 'temple', ['temples'], 30, 1, 'morning', 'SGN', 1, 'om', 'A generic small shrine for a few calm minutes between bigger sights.', 'Silence phones and cover shoulders.'],
  ['udr-jagdish', 'udr-old-city', 'Jagdish Temple', 'temple', ['temples', 'heritage'], 40, 1, 'morning', 'SG', 2, 'om', 'A grand temple at the heart of the old city, reached by a flight of steps.', 'Remove shoes before the steps.'],
  ['udr-lanes', 'udr-old-city', 'Old-city lane wander', 'market', ['shopping', 'art-crafts'], 90, 1, 'afternoon', 'SGN', 2, 'kite', 'Narrow lanes of small shops, paintings, silver and textiles.', 'Slow wandering pays off here.', CROWD],
  ['udr-miniature', 'udr-old-city', 'Miniature-painting studio (example)', 'craft', ['art-crafts'], 75, 1, 'afternoon', 'SGN', 1, 'peacock', 'A generic studio visit to watch fine brushwork and ask questions.', 'Ask to see how pigments are made.'],
  ['udr-folk-show', 'udr-old-city', 'Folk dance evening show (example)', 'activity', ['art-crafts', 'heritage'], 75, 2, 'evening', 'SGN', 1, 'sitar', 'A generic evening of folk dance and music in a courtyard.', 'Arrive early for a front seat.'],
  ['udr-rooftop-cafe', 'udr-old-city', 'Rooftop café with a lake view (example)', 'cafe', ['cafes', 'lakes-sunsets'], 75, 2, 'evening', 'SG', 2, '', 'A generic rooftop café for tea and a sunset view across the old city.', 'Reserve a seat before sunset.'],
  ['udr-courtyard-cafe', 'udr-old-city', 'Courtyard café for a slow breakfast (example)', 'cafe', ['cafes'], 60, 1, 'morning', 'SGN', 1, '', 'A generic courtyard café for a leisurely start.', 'Nice for a rest between lanes.'],
  ['udr-textiles', 'udr-old-city', 'Textile and silver shops (example)', 'market', ['shopping'], 75, 1, 'afternoon', 'SG', 1, 'rangoli', 'A generic row of shops for fabric, silver and handmade gifts.', 'Compare a few stalls first.'],
  ['udr-fatehsagar-lake', 'udr-fatehsagar', 'Fatehsagar Lake promenade', 'nature', ['lakes-sunsets'], 75, 1, 'evening', 'SGN', 1, 'sailboat', 'A wide lake with a breezy promenade, snack carts and families out for the evening.', 'Walk in the cooler hours.'],
  ['udr-island-garden', 'udr-fatehsagar', 'Lake-island garden visit (example)', 'nature', ['lakes-sunsets'], 60, 1, 'afternoon', 'SGN', 1, 'palm', 'A generic island garden reached by a short boat hop.', 'Bring a hat.', 'Follow boat crew instructions.'],
  ['udr-lake-cafe', 'udr-fatehsagar', 'Café by the lake road (example)', 'cafe', ['cafes'], 60, 2, 'afternoon', 'SGN', 1, '', 'A generic café with outdoor seats and a lake breeze.', 'A good rest between sights.'],
  ['udr-saheliyon', 'udr-gardens', 'Saheliyon-ki-Bari garden', 'garden', ['heritage'], 60, 1, 'morning', 'SGN', 1, 'peacock', 'A formal garden of fountains and shaded paths, calm and easy on the legs.', 'Best in the morning when it is quiet.'],
  ['udr-craft-quarter', 'udr-gardens', 'Crafts quarter (example)', 'craft', ['art-crafts', 'shopping'], 120, 1, 'afternoon', 'SGN', 1, 'rangoli', 'A generic open-air quarter of craft stalls, demonstrations and small performances.', 'Good for gifts and for watching how things are made.'],
  ['udr-ahar', 'udr-gardens', 'Royal cenotaph complex (Ahar)', 'landmark', ['heritage'], 45, 1, 'morning', 'SGN', 1, '', 'A quiet complex of carved memorial structures, usually less crowded than the big palace sights.', 'Good for a calm morning.'],
  ['udr-hill-shrine', 'udr-gardens', 'Hilltop shrine with a view (example)', 'temple', ['temples', 'lakes-sunsets'], 60, 1, 'evening', 'SG', 3, '', 'A generic hilltop shrine reached by a climb, with wide views over the water.', 'Carry water and descend before dark.', EVENING],

  // ---------------- Manali ----------------
  ['man-hadimba', 'man-mall-road', 'Hadimba Temple and cedar grove', 'temple', ['temples', 'nature-adventure'], 60, 1, 'morning', 'SGN', 2, 'pagoda', 'A wooden temple set among tall cedar trees, calm early and busier later.', 'Come early for quiet trees.'],
  ['man-mall-stroll', 'man-mall-road', 'Mall Road evening stroll', 'market', ['shopping', 'local-food'], 90, 1, 'evening', 'SGN', 1, 'kite', 'The town’s busy centre for a stroll, snacks and small shops.', 'Gets crowded on weekends.', CROWD],
  ['man-woollens', 'man-mall-road', 'Woollens and handicraft shops (example)', 'market', ['shopping'], 75, 1, 'afternoon', 'SGN', 1, 'rangoli', 'A generic row of shops for shawls, caps and mountain-made gifts.', 'Feel the weave before you buy.'],
  ['man-monastery', 'man-mall-road', 'Tibetan monastery visit (example)', 'temple', ['temples'], 45, 1, 'morning', 'SGN', 1, 'pagoda', 'A generic monastery stop for prayer wheels, murals and a quiet corner.', 'Walk clockwise around the wheels.'],
  ['man-siddu', 'man-mall-road', 'Siddu and local-snack stall (example)', 'food-walk', ['local-food'], 45, 1, 'any', 'SGN', 1, 'diya', 'A generic stall for steamed bread and mountain snacks.', 'Ask what is freshly made.'],
  ['man-orchard', 'man-old-manali', 'Apple orchard walk (example)', 'nature', ['nature-adventure', 'offbeat'], 75, 1, 'morning', 'SGN', 2, 'pine', 'A generic walk through orchard paths with mountain views, when the season allows.', 'Seasonal. Ask locally what is in bloom.', CURRENT],
  ['man-beas-walk', 'man-old-manali', 'Riverside walk by the Beas', 'nature', ['nature-adventure', 'offbeat'], 60, 1, 'afternoon', 'SGN', 2, 'pine', 'An easy riverside walk to the sound of fast water.', 'Keep back from the edge.', 'River banks can be slippery and water levels change.'],
  ['man-old-bridge', 'man-old-manali', 'Old Manali bridge crossing', 'landmark', ['offbeat'], 30, 1, 'any', 'SGN', 1, '', 'A short stop on a bridge over fast water, a small moment between bigger plans.', 'Linger and listen to the river.'],
  ['man-cafe-hop', 'man-old-manali', 'Riverside café hop (example)', 'cafe', ['cafes'], 90, 2, 'afternoon', 'SG', 2, '', 'A generic loop of riverside cafés with terraces and mountain-facing seats.', 'Pick a terrace seat.'],
  ['man-bakery', 'man-old-manali', 'Cosy bakery café (example)', 'cafe', ['cafes'], 60, 1, 'morning', 'SGN', 1, '', 'A generic bakery café for warm pastries and hot drinks.', 'Great on a cold morning.'],
  ['man-manu', 'man-old-manali', 'Old village shrine (Manu Temple)', 'temple', ['temples', 'offbeat'], 45, 1, 'morning', 'SG', 3, 'om', 'A small village shrine up a stepped lane, for a quiet pause.', 'The lane is steep, so take your time.'],
  ['man-jogini', 'man-old-manali', 'Waterfall trail (Jogini)', 'nature', ['nature-adventure'], 150, 1, 'morning', 'SG', 3, 'pine', 'A short trail to a mountain waterfall, with stones and steps along the way.', 'Wear shoes with grip.', CURRENT],
  ['man-vashisht-springs', 'man-vashisht', 'Vashisht temple and hot springs', 'temple', ['temples'], 75, 1, 'morning', 'SGN', 2, 'pagoda', 'A hillside village temple with warm springs, quiet and good for a slow morning.', 'Cover shoulders and keep shoes outside.'],
  ['man-village-walk', 'man-vashisht', 'Village lanes and viewpoint walk (example)', 'nature', ['offbeat', 'nature-adventure'], 90, 1, 'afternoon', 'SG', 3, 'peaks', 'A generic wander through lanes with views, uphill and downhill.', 'Carry water and a layer.'],
  ['man-thali', 'man-vashisht', 'Himachali thali kitchen (example)', 'food-walk', ['local-food'], 60, 1, 'any', 'SGN', 1, 'diya', 'A generic home-style kitchen for a mountain thali.', 'Ask about the day’s specials.'],
  ['man-orchard-cafe', 'man-vashisht', 'Orchard-side café (example)', 'cafe', ['cafes', 'offbeat'], 60, 2, 'afternoon', 'SGN', 1, '', 'A generic café among trees, quiet and good for a long sit.', 'Take a book.'],
  ['man-solang', 'man-solang', 'Solang Valley day (views, optional activities)', 'nature', ['nature-adventure'], 180, 2, 'morning', 'SG', 3, 'peaks', 'Open slopes with wide mountain views and optional seasonal activities.', 'Start early and bring layers.', CURRENT],
  ['man-paragliding', 'man-solang', 'Paragliding (example, seasonal)', 'activity', ['nature-adventure'], 90, 3, 'morning', 'SG', 1, 'kite', 'A generic seasonal tandem flight over a mountain valley with a trained pilot.', 'Weather decides, so keep it flexible.', 'Activities depend on weather and operator conditions. ' + CURRENT],
  ['man-viewpoint', 'man-solang', 'Mountain-view picnic spot (example)', 'viewpoint', ['nature-adventure', 'offbeat'], 60, 1, 'afternoon', 'SGN', 1, 'peaks', 'A generic open spot for a picnic with peaks all around.', 'Bring your own snacks.', CURRENT],
];

const OFFSETS = [[-9, -7], [9, -8], [10, 8], [-9, 9], [0, 0], [15, 0], [-15, 0], [0, -14], [0, 14], [-18, 12], [18, -12]];
const seen = {};

export const PLACES = rows.map(([id, areaId, name, category, tags, durationMins, costTier, bestTime, flags, walkingLevel, image, description, note, safetyNote]) => {
  const area = AREA_BY_ID[areaId];
  const n = (seen[areaId] = (seen[areaId] || 0) + 1) - 1;
  const [dx, dy] = OFFSETS[n % OFFSETS.length];
  const sample = /\(example|example\)/i.test(name);
  return {
    id, name, cityId: area.cityId, areaId, category, tags, description, image,
    coords: { x: Math.min(95, Math.max(5, area.coords.x + dx)), y: Math.min(95, Math.max(5, area.coords.y + dy)) },
    durationMins, costTier, bestTime,
    soloFriendly: flags.includes('S'), groupFriendly: flags.includes('G'), seniorFriendly: flags.includes('N'),
    walkingLevel, ...(safetyNote ? { safetyNote } : {}),
    sampleNotes: [{ author: 'Sample traveller', text: note }],
    sample, real: !sample,
  };
});
export const PLACE_BY_ID = Object.fromEntries(PLACES.map((p) => [p.id, p]));
