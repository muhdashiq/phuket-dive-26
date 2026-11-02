import type { Place } from './types';

const place = (name: string, query: string, placeId?: string): Place => ({ name, query, placeId });

export const PLACES = {
  chalongPier: place('Chalong Pier', 'Chalong Pier, Phuket'),
  roongSiamPier: place('Roong Siam Pier', 'Roong Siam Pier, Phuket'),
  thapLamuPier: place('Thap Lamu Pier', 'Thap Lamu Pier, Khao Lak', 'ChIJjRSbrf_xUDARTnHX1dSrFe0'),
  namKhemPier: place('Nam Khem Pier', 'Nam Khem Pier, Takua Pa, Phang Nga'),
  royalMarina: place('Royal Phuket Marina', 'Royal Phuket Marina', 'ChIJa7CAfAY3UDARAPs_b9cKUJQ'),
  boatLagoon: place('Phuket Boat Lagoon', 'Phuket Boat Lagoon', 'ChIJG3NPN9U3UDARBRqquV_kZ4g'),
  aoPo: place('Ao Po', 'Ao Po Pier, Phuket'),

  mayaBay: place('Maya Bay', 'Maya Bay, Ko Phi Phi Le'),
  pilehLagoon: place('Pileh Lagoon', 'Pileh Lagoon, Ko Phi Phi Le'),
  tonsaiBay: place('Tonsai Bay', 'Tonsai Bay, Ko Phi Phi Don'),
  niceBeachRestaurant: place('Phi Phi Nice Beach Restaurant', 'Phi Phi Nice Beach Restaurant, Ko Phi Phi Don'),
  monkeyBeach: place('Monkey Beach', 'Monkey Beach, Ko Phi Phi Don'),
  vikingCave: place('Viking Cave', 'Viking Cave, Ko Phi Phi Le'),
  khaiNok: place('Koh Khai Nok', 'Koh Khai Nok, Phuket'),

  rachaYai: place('Ko Racha Yai', 'Ko Racha Yai, Phuket', 'ChIJ62LAnzvRTzARAxEU5ubxfgQ'),
  rachaNoi: place('Ko Racha Noi', 'Ko Racha Noi, Phuket'),
  similan: place('Mu Ko Similan National Park', 'Mu Ko Similan National Park', 'ChIJTWOkhaJxWjARBugMilSJtEo'),
  kingCruiser: place('King Cruiser wreck', 'King Cruiser Wreck, Phuket'),
  sharkPoint: place('Shark Point', 'Shark Point Hin Musang, Phuket'),
  docMai: place('Ko Doc Mai', 'Ko Doc Mai, Phuket'),
  bidaNok: place('Ko Bida Nok', 'Ko Bida Nok, Krabi', 'ChIJba5jJ98gTjARFafm_cRaUgk'),
  bidaNai: place('Ko Bida Nai', 'Ko Bida Nai, Krabi'),

  seaBees: place('Sea Bees Diving', 'Sea Bees Diving Phuket', 'ChIJHTe0AxAvUDARSQltCxFCbB8'),
  sunriseDivers: place('Sunrise Divers', 'Sunrise Divers Phuket', 'ChIJ4-1tHnglUDARxnwrbnEt4A8'),
  phuketDiveTours: place('Phuket Dive Tours', 'Phuket Dive Tours Kata Beach', 'ChIJ7_3RO7o6UDARzgz0LjHWhrU'),

  aquaria: place('Aquaria Phuket', 'Aquaria Phuket', 'ChIJq-hIQyQxUDARCwGLTecNofQ'),
  oldTown: place('Phuket Old Town', 'Phuket Old Town'),
  thaiHua: place('Thai Hua Museum', 'Phuket Thai Hua Museum', 'ChIJW_ZuovoxUDARO9tP_1sCA30'),
  lardYai: place('Lard Yai Sunday market', 'Lard Yai Sunday Night Market, Phuket', 'ChIJQwdCFvoxUDAR4XNViLYibc4'),
  naka: place('Naka Weekend Market', 'Naka Weekend Market, Phuket', 'ChIJ02EC1NsxUDAR9ou27HphtVM'),
  bigBuddha: place('Big Buddha', 'Phuket Big Buddha', 'ChIJOSmXz2AvUDARXCxlBBs7y38'),
  watChalong: place('Wat Chalong', 'Wat Chalong, Phuket', 'ChIJYSMtg7svUDARhklKwhnTa48'),
  promthep: place('Promthep Cape', 'Promthep Cape, Phuket', 'ChIJZ3aEXSYmUDARbSkKdsDzYMo'),
  elephantSanctuary: place('Phuket Elephant Sanctuary', 'Phuket Elephant Sanctuary', 'ChIJe5gBglZIUDARbzpRlCqfeMA'),
  jamesBond: place('James Bond Island', 'James Bond Island, Phang Nga'),

  airport: place('Phuket International Airport', 'Phuket International Airport', 'ChIJCQ93jJhIUDAR0DDUaWtBtOU'),
  busTerminal1: place('Phuket Bus Terminal 1', 'Phuket Bus Terminal 1', 'ChIJjZxhbvgxUDARmf8YQwFKvAg'),
  siriroj: place('Bangkok Hospital Siriroj', 'Bangkok Hospital Siriroj, Phuket', 'ChIJgyMtu7gxUDARZy_FMVI2GJQ'),
} satisfies Record<string, Place>;

export type PlaceKey = keyof typeof PLACES;

export const mapsUrl = (target: Place): string => {
  const params = new URLSearchParams({ api: '1', query: target.query });
  if (target.placeId) params.set('query_place_id', target.placeId);
  return `https://www.google.com/maps/search/?${params.toString()}`;
};
