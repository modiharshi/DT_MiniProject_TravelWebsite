import { project } from './geo.js';
import { INTERESTS } from './interests.js';

const CHECK = 'Check current conditions and access before you travel.';

// Map data plus the interests each city offers. Areas and places arrive with the planner data.
const raw = [
  {
    id: 'mumbai', name: 'Mumbai', stateId: 'maharashtra', lonlat: [72.88, 19.08], tagSide: 'l',
    interests: ['street-food', 'cafes', 'heritage', 'art-galleries', 'beaches', 'shopping', 'nightlife'],
    cartouche: 'Mumbai: City of Dreams',
    teaser: 'Vada pav, sea breeze, local trains.',
    tagline: 'Sea breeze, street snacks and a train every two minutes.',
    noteTitle: 'Rain and rhythm',
    note: `Monsoon brings heavy rain and slow-moving days, so keep plans loose in those months. ${CHECK}`,
    theme: { accent: '#B85C3C', accent2: '#6FC3C3', accent3: '#F4C430', wash: '233,165,130' },
  },
  {
    id: 'jaipur', name: 'Jaipur', stateId: 'rajasthan', lonlat: [75.79, 26.92], tagSide: 'r',
    interests: [['heritage', 'Heritage & Forts'], 'street-food', ['shopping', 'Shopping & Bazaars'], 'art-crafts', 'cafes', 'temples', 'offbeat'],
    cartouche: 'Jaipur: The Pink City',
    teaser: 'Chai first. Forts later.',
    tagline: 'Chai first. Forts later. Bazaars when the sun softens.',
    noteTitle: 'Mind the heat',
    note: `Summers run hot, so mornings and evenings tend to be kinder for walking. ${CHECK}`,
    theme: { accent: '#A33C60', accent2: '#D9784A', accent3: '#F2A91E', wash: '233,150,150' },
  },
  {
    id: 'udaipur', name: 'Udaipur', stateId: 'rajasthan', lonlat: [73.71, 24.58], tagSide: 'l',
    interests: ['lakes-sunsets', 'heritage', 'art-crafts', ['cafes', 'Rooftop Cafés'], 'temples', 'shopping'],
    cartouche: 'Udaipur: City of Lakes',
    teaser: 'Lakes, rooftops, slow sunsets.',
    tagline: 'Lakes, rooftops and sunsets that refuse to hurry.',
    noteTitle: 'Water moods',
    note: `The lakes look different across the seasons, and the monsoon can change plans. ${CHECK}`,
    theme: { accent: '#3B4A9A', accent2: '#5A9FD0', accent3: '#C99A2E', wash: '120,160,215' },
  },
  {
    id: 'manali', name: 'Manali', stateId: 'himachal', lonlat: [77.19, 32.24], tagSide: 'r',
    interests: ['nature-adventure', ['cafes', 'Cafés'], 'temples', 'offbeat', 'local-food', ['shopping', 'Woollens & Crafts']],
    cartouche: 'Manali: Pines & Peaks',
    teaser: 'Pine hills and café hours.',
    tagline: 'Pine hills, café hours and a river that never goes quiet.',
    noteTitle: 'Snow and roads',
    note: `Snow, road and weather conditions can change quickly in the mountains and may affect travel. ${CHECK}`,
    theme: { accent: '#2F6B4F', accent2: '#9CC9E6', accent3: '#8A5A3B', wash: '150,200,180' },
  },
];

export const CITIES = Object.fromEntries(
  raw.map((c) => {
    const [x, y] = project(c.lonlat);
    const interests = c.interests.map((i) => {
      const [id, label] = Array.isArray(i) ? i : [i];
      return { ...INTERESTS[id], label: label || INTERESTS[id].label };
    });
    return [c.id, { ...c, interests, x, y }];
  }),
);
export const CITY_LIST = Object.values(CITIES);
