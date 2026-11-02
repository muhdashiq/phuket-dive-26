import type { ReactNode } from 'react';
import { MapLink } from '../components/MapLink';
import type { PlaceKey } from './places';
import type { CommonTabId, PhotoInfo, Tone } from './types';

export const COMMON_TABS: { id: CommonTabId; label: string; note: string }[] = [
  { id: 'contacts', label: 'Contacts', note: 'SOS · shops' },
  { id: 'places', label: 'Places', note: 'Google Maps' },
  { id: 'costs', label: 'Costs', note: 'per diver' },
  { id: 'planb', label: 'Plan B', note: 'rain options' },
];

export const BOOKING_STEPS: { id: string; title: string; detail: string }[] = [
  { id: 'step-1', title: 'Similan for Thursday, today.', detail: 'The park allows 525 divers a day, and the long trip fills first.' },
  { id: 'step-2', title: "Wednesday's Racha trip, today.", detail: 'Pickup is Wednesday morning, so the shop needs your details by tonight.' },
  { id: 'step-3', title: 'Saturday Phi Phi and Sunday Racha Yai.', detail: 'Send names, cert level, nitrox card, last dive date and hotel on WhatsApp.' },
  { id: 'step-4', title: 'Friday on standby.', detail: 'Ask the shop to hold a place and confirm by Thursday evening. It was the wettest day in the 2 Nov forecast.' },
];

export type CostRow = { day: string; trip: string; operator: string; price: string; parkFee: string; nitrox: string };

export const COST_ROWS: CostRow[] = [
  { day: 'Wed 4', trip: 'Racha Noi & Yai, 3 dives', operator: 'Sunrise Divers', price: '3,900', parkFee: '—', nitrox: '600–1,050' },
  { day: 'Thu 5', trip: 'Similan, 2 dives', operator: 'Thailand Divers', price: '6,100', parkFee: '700', nitrox: '600' },
  { day: 'Fri 6', trip: 'King Cruiser, 3 dives', operator: 'Sunrise Divers', price: '3,900', parkFee: '—', nitrox: '600–1,050' },
  { day: 'Sat 7', trip: 'Phi Phi, 3 dives', operator: 'Phuket Dive Tours', price: '3,700', parkFee: '600', nitrox: '600' },
  { day: 'Sun 8', trip: 'Racha Yai, 2 dives', operator: 'Sunrise Divers', price: '3,000', parkFee: '—', nitrox: '400–700' },
];

export type RainyOption = {
  title: string;
  badge: string;
  tone: Tone;
  photo?: PhotoInfo;
  facts: [string, ReactNode][];
};

export const RAINY_OPTIONS: RainyOption[] = [
  {
    title: 'Aquaria Phuket',
    badge: 'Indoor',
    tone: 'good',
    facts: [
      ['Where', <>Central Phuket Floresta, B1, Phuket Town<MapLink place="aquaria" /></>],
      ['Time', '20–30 min by car'],
      ['Get there', 'Grab or Bolt; taxi about 400–500 THB'],
      ['Cost', 'About US$34 adult, cheaper online than at the gate'],
      ['Hours', '10:30–19:00, last entry 18:00. Mermaid show 11:00 & 15:00, not Mondays'],
    ],
  },
  {
    title: 'Phuket Old Town & Thai Hua Museum',
    badge: 'Partly covered',
    tone: 'watch',
    photo: { file: 'Thalang_Road,_Old_Phuket_Town.jpg', alt: 'Thalang Road in Phuket Old Town', caption: 'Thalang Road, Phuket Old Town' },
    facts: [
      ['Where', <>Thalang Road, Soi Romanee, Krabi Road<MapLink place="oldTown" label="Old Town" /><MapLink place="thaiHua" label="Museum" /></>],
      ['Time', '25–30 min by car'],
      ['Get there', <>Grab 300–500 THB, or Smart Bus Route 2 (Patong ↔ Bus Terminal 1<MapLink place="busTerminal1" />, 50 THB, hourly 06:00–20:00). Free Dragon Line loop inside Old Town</>],
      ['Cost', 'Free to walk; museum ticket at the door'],
      ['Sunday', 'Lard Yai walking street 16:00–22:00'],
    ],
  },
  {
    title: 'Phang Nga Bay & James Bond Island',
    badge: 'Runs in most weather',
    tone: 'good',
    photo: {
      file: 'Khao_Phing_Kan_and_Koh_Tapu_(James_Bond_Island).jpg',
      alt: 'Khao Phing Kan and Koh Tapu in Phang Nga Bay',
      caption: 'Koh Tapu, James Bond Island',
    },
    facts: [
      ['Where', <>Boats from Ao Po, Royal Phuket Marina or Boat Lagoon (east coast)<br /><MapLink place="aoPo" label="Ao Po" /><MapLink place="royalMarina" label="Royal Marina" /><MapLink place="boatLagoon" label="Boat Lagoon" /></>],
      ['Time', 'About 45 min to the pier; tour about 8 h'],
      ['Get there', 'Hotel pickup included'],
      ['Cost', 'Big boat + canoe about 1,500 THB; speedboat about 1,700 THB. Park fee 300 THB if not included'],
    ],
  },
  {
    title: 'Phuket Elephant Sanctuary',
    badge: 'Rain gear provided',
    tone: 'good',
    facts: [
      ['Where', <>Pa Klok, beside Khao Phra Thaeo forest, north-east Phuket<MapLink place="elephantSanctuary" /></>],
      ['Time', '≈ 1 h by car'],
      ['Get there', "Grab, or ask about transfer when booking on the sanctuary's own site"],
      ['Cost', 'Half day with vegetarian lunch 3,000 THB; 90-min walkway 1,900 THB'],
      ['Note', 'Observation only, no riding or bathing'],
    ],
  },
  {
    title: 'Big Buddha & Wat Chalong',
    badge: 'Needs a dry spell',
    tone: 'watch',
    photo: { file: 'The_Big_Buddha,_Phuket.jpg', alt: 'The Big Buddha statue on Nakkerd Hill', caption: 'Big Buddha, Nakkerd Hill' },
    facts: [
      ['Where', <>Nakkerd Hill, Chalong; Wat Chalong is 10 min away<br /><MapLink place="bigBuddha" label="Big Buddha" /><MapLink place="watChalong" label="Wat Chalong" /></>],
      ['Time', '≈ 40 min by car'],
      ['Get there', 'Grab or scooter; the road down is steep and curvy'],
      ['Cost', 'Free; donations optional'],
      ['Hours', '09:00–18:00, last entry 17:30. Cover shoulders and knees; sarongs lent free'],
    ],
  },
  {
    title: 'Promthep Cape sunset',
    badge: 'Needs a dry spell',
    tone: 'watch',
    photo: { file: 'Phuket_Promthep_Cape.jpg', alt: 'Promthep Cape at the southern tip of Phuket', caption: 'Promthep Cape, Rawai' },
    facts: [
      ['Where', <>Southern tip of Phuket, Rawai<MapLink place="promthep" /></>],
      ['Time', '≈ 45 min by car'],
      ['Get there', 'Smart Bus Route 1 to Rawai (100 THB) or Grab'],
      ['Cost', 'Free'],
      ['Sunset', '18:04–18:05 all week'],
    ],
  },
];

export const PLACE_GROUPS: { title: string; items: { place: PlaceKey; note: string }[] }[] = [
  {
    title: 'Piers & marinas',
    items: [
      { place: 'chalongPier', note: 'Racha, Phi Phi and King Cruiser day boats' },
      { place: 'roongSiamPier', note: 'Phi Phi snorkel tour, Tue 3 Nov' },
      { place: 'thapLamuPier', note: 'Similan speedboats, Khao Lak (Wed–Fri)' },
      { place: 'namKhemPier', note: 'Thailand Divers on Sat–Tue' },
      { place: 'royalMarina', note: 'Phang Nga Bay tours' },
      { place: 'boatLagoon', note: 'Phang Nga Bay tours' },
      { place: 'aoPo', note: 'Phang Nga Bay tours' },
    ],
  },
  {
    title: 'Phi Phi tour stops',
    items: [
      { place: 'mayaBay', note: 'Tue 3 Nov, 10:30' },
      { place: 'pilehLagoon', note: 'Tue 3 Nov, 11:30' },
      { place: 'tonsaiBay', note: 'Tue 3 Nov, 12:30 snorkel' },
      { place: 'niceBeachRestaurant', note: 'Tue 3 Nov, lunch' },
      { place: 'monkeyBeach', note: 'Tue 3 Nov, 14:15' },
      { place: 'vikingCave', note: 'Tue 3 Nov, 14:45' },
      { place: 'khaiNok', note: 'Tue 3 Nov, 16:00 swim' },
    ],
  },
  {
    title: 'Dive sites',
    items: [
      { place: 'rachaYai', note: 'Wed and Sun' },
      { place: 'rachaNoi', note: 'Wed' },
      { place: 'similan', note: 'Thu: Stonehenge, West of Eden' },
      { place: 'kingCruiser', note: 'Fri' },
      { place: 'sharkPoint', note: 'Fri, maybe Sat' },
      { place: 'docMai', note: 'Fri, maybe Sat' },
      { place: 'bidaNok', note: 'Sat' },
      { place: 'bidaNai', note: 'Sat' },
    ],
  },
  {
    title: 'Dive shops',
    items: [
      { place: 'seaBees', note: 'Viset Road, Chalong' },
      { place: 'sunriseDivers', note: 'Patak Road, Karon' },
      { place: 'phuketDiveTours', note: 'Kata Beach' },
    ],
  },
  {
    title: 'Sightseeing & markets',
    items: [
      { place: 'aquaria', note: 'Central Phuket Floresta, B1' },
      { place: 'oldTown', note: 'Thalang Road and Soi Romanee' },
      { place: 'thaiHua', note: 'Krabi Road, Old Town' },
      { place: 'lardYai', note: 'Sun 16:00–22:00' },
      { place: 'naka', note: 'Sat & Sun 16:00–22:00' },
      { place: 'bigBuddha', note: 'Nakkerd Hill' },
      { place: 'watChalong', note: 'Chalong' },
      { place: 'promthep', note: 'Rawai, sunset point' },
      { place: 'elephantSanctuary', note: 'Pa Klok, Thalang' },
    ],
  },
  {
    title: 'Transport & medical',
    items: [
      { place: 'airport', note: 'Tue flight home' },
      { place: 'busTerminal1', note: 'Smart Bus Route 2 to Patong' },
      { place: 'siriroj', note: 'Hyperbaric chamber, open 24 h' },
    ],
  },
];

export const SOURCES: { label: string; href?: string }[] = [
  { label: 'Source code for this page on GitHub', href: 'https://github.com/muhdashiq/phuket-dive-26' },
  { label: 'Klook voucher: Phi Phi, Maya Bay & Khai Island speedboat tour, 3 Nov (itinerary, inclusions, fees, pickup)' },
  { label: 'Live weather and marine data: Open-Meteo.com (CC BY 4.0)', href: 'https://open-meteo.com/' },
  { label: 'TMD 7-day forecast, 1–7 Nov', href: 'https://www.tmd.go.th/en/forecast/sevenday' },
  { label: 'TMD shipping forecast, 2 Nov', href: 'https://www.tmd.go.th/en/forecast/shipping' },
  { label: 'Sea Bees: Racha Noi & Racha Yai', href: 'https://sea-bees.com/shop/phuket-scuba-day-trips/racha-noi/' },
  { label: 'Sea Bees: Racha Yai', href: 'https://sea-bees.com/shop/phuket-scuba-day-trips/racha-yai-phuket/' },
  { label: 'Sunrise Divers: Racha Noi & Yai', href: 'https://shop.sunrise-divers.com/dive-trips-courses/scuba-diving-racha-noi-yai-3-dives/' },
  { label: 'Sunrise Divers: King Cruiser', href: 'https://shop.sunrise-divers.com/dive-trips-courses/king-cruiser-wreck-day-dive-trip/' },
  { label: 'Thailand Divers: Similan day trip', href: 'https://thailand-divers.com/similan-islands-day-trip/' },
  { label: 'Phuket Dive Tours: Phi Phi', href: 'https://www.phuketdivetours.com/product/phi-phi-scuba-diving-day-trip/' },
  { label: 'Phuket Dive Tours: all trips', href: 'https://www.phuketdivetours.com/' },
  { label: 'Similan 2026–27 season and diver quota', href: 'https://www.tisland.travel/en/blog/similany-otkryvayutsya-15-oktyabrya-2026' },
  { label: 'Phuket 101: Big Buddha', href: 'https://www.phuket101.net/big-buddha-phuket/' },
  { label: 'Phuket 101: Aquaria', href: 'https://www.phuket101.net/aquaria-central-floresta-phuket/' },
  { label: 'Klook: Aquaria ticket', href: 'https://www.klook.com/activity/26631-aquaria-phuket-ticket/' },
  { label: 'Phuket 101: Smart Bus and Dragon Line', href: 'https://phuket101.net/how-to-ride-phuket-bus' },
  { label: 'Aster of Asia: taxi, Grab and Bolt fares', href: 'https://asterofasia.com/de/blog/phuket-taxi-grab-bolt-tuktuk-prices' },
  { label: 'Lard Yai Sunday market guide', href: 'https://21sensations.com/phuket-town-night-market/' },
  { label: 'Phang Nga Bay guide', href: 'https://www.visitthailandtoday.com/guides/phang-nga-bay-guide' },
  { label: 'Elephant sanctuaries in Phuket', href: 'https://www.visitthailandtoday.com/top-lists/best-elephant-sanctuaries-phuket' },
  { label: 'Phuket emergency contacts', href: 'https://www.saltwater-dreaming.com/travel/phuket-contacts.htm' },
  { label: 'Bangkok Hospital Siriroj hyperbaric chamber', href: 'https://www.bangkokhospital.com/en/siriroj/center-clinic/center-group/hyperbaric-chamber-facility-bsi/overview' },
];
