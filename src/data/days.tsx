import { Contact } from '../components/Contact';
import { MapLink } from '../components/MapLink';
import { Operator } from '../components/Operator';
import type { DayId, DayPlan } from './types';

const TMD_WIND = 'SE 15–30 km/h';

export const DAYS: DayPlan[] = [
  {
    id: 'tue3',
    date: '2026-11-03',
    dow: 'Tue',
    dom: '3 Nov',
    tone: 'rest',
    pill: 'Booked · snorkel, no diving',
    title: 'Phi Phi, Maya Bay & Khai Nok',
    chipNote: 'Phi Phi',
    sub: (
      <>
        Speedboat tour with lunch · 2 adults · from Roong Siam Pier
        <MapLink place="roongSiamPier" />
      </>
    ),
    sea: 'phiphi',
    weather: { wind: TMD_WIND, sea: '≈1 m', seaNote: '>2 m in storms' },
    weatherNote:
      'Wind and sea from the Thai Met Dept 1–7 Nov outlook. The operator makes the weather call; if the boat is cancelled they will contact you, and Klook handles any refund.',
    left: (
      <>
        <h3>Day timeline</h3>
        <ul className="timeline">
          <li><span className="tm">07:30</span><span><b>Hotel lobby pickup</b>, 07:30–07:45. Shared minibus, so it can run early or late.</span></li>
          <li><span className="tm">09:00</span><span><b>Roong Siam Pier</b><MapLink place="roongSiamPier" />: check in, pay the park fee in cash, morning snacks, coffee and tea. Take the seasickness tablet now.</span></li>
          <li><span className="tm">09:30</span><span>Safety briefing, then the boat leaves (about 1 h to the first stop).</span></li>
          <li><span className="tm">10:30</span><span><b>Maya Bay</b><MapLink place="mayaBay" />, 40 min. Walk in and take photos; no swimming here.</span></li>
          <li><span className="tm">11:30</span><span><b>Pileh Lagoon</b><MapLink place="pilehLagoon" />, 1 h. Optional longtail ride, 400 THB each.</span></li>
          <li><span className="tm">12:30</span><span><b>Tonsai Bay</b><MapLink place="tonsaiBay" />, 30 min snorkel over coral.</span></li>
          <li><span className="tm">13:15</span><span><b>Phi Phi Don</b>, 1 h. Thai &amp; international buffet at Phi Phi Nice Beach Restaurant<MapLink place="niceBeachRestaurant" />: halal, vegetarian options, gluten-free on request, no air conditioning.</span></li>
          <li><span className="tm">14:15</span><span><b>Monkey Beach</b><MapLink place="monkeyBeach" />, 15 min. Can be skipped at high tide.</span></li>
          <li><span className="tm">14:45</span><span><b>Viking Cave</b><MapLink place="vikingCave" />, 10 min, seen from outside only.</span></li>
          <li><span className="tm">15:00</span><span>Run to Koh Khai Nok, about 40 min.</span></li>
          <li><span className="tm">16:00</span><span><b>Koh Khai Nok</b><MapLink place="khaiNok" />, 1 h. Swim, snorkel or SUP; fresh fruit and drinks.</span></li>
          <li><span className="tm">17:00</span><span>Boat heads back to Roong Siam Pier.</span></li>
          <li><span className="tm">≈18:30</span><span>Back at the hotel, 18:30–19:00, later in heavy traffic.</span></li>
        </ul>
        <p className="note">The operator may reorder stops for weather and traffic.</p>
        <h3>Booking</h3>
        <div className="ops">
          <Operator name="Klook · PNT (Phuket New Generation Travel)" tag="Booked" price="Prepaid" pick>
            <p className="op-meta">Early departure · hotel transfer · Thai &amp; international buffet. 2 adults, English-speaking guide.</p>
            <p className="op-meta">Open the voucher in the Klook app at check-in. Each adult has a separate QR code, and the names must match your passports.</p>
            <Contact display="+66 81 538 7695" copy="+66815387695" note="if the pickup is late" />
            <Contact display="kunmee16@gmail.com" />
          </Operator>
        </div>
      </>
    ),
    right: (
      <>
        <h3>Cash · the main thing</h3>
        <ul className="bring">
          <li><b>800 THB Phi Phi National Park fee</b> (400 THB each). Mandatory, cash only, paid at the pier.</li>
          <li>Optional: fins 100 THB a pair, Pileh longtail 400 THB each, beach chairs 150 THB, tips.</li>
          <li>Carry <b>2,500–3,000 THB in small notes</b> to cover everything.</li>
        </ul>
        <h3>Wear</h3>
        <ul className="bring">
          <li>Swimwear underneath: you swim or snorkel at Tonsai Bay and Khai Nok.</li>
          <li>Rash guard or long-sleeve quick-dry top, quick-dry shorts.</li>
          <li>Light, breathable clothes over that; the lunch restaurant has no air conditioning.</li>
          <li>Water shoes (or flip-flops) for the rocky, coral-bit shallows at Khai Nok.</li>
          <li>Cap or hat with a strap, sunglasses on a cord. The speedboat is windy.</li>
        </ul>
        <h3>In your bag</h3>
        <ul className="bring">
          <li>Passport, or at least a photo or photocopy of it.</li>
          <li>Towel. The tour does not provide one.</li>
          <li>Change of clothes and a plastic bag for the wet ones.</li>
          <li>Reef-safe sunscreen.</li>
          <li>Dry bag and a waterproof phone pouch.</li>
          <li>Power bank. It is a 12-hour day.</li>
          <li>Your own dive mask: rental masks often leak. Your own fins save the rental fee.</li>
        </ul>
        <p className="note"><b>Already included, no need to pack:</b> motion sickness tablets, life jacket, snorkel mask, SUP, Khai Island entrance fee, morning snacks, lunch, fruit and drinks, operator insurance.</p>
      </>
    ),
    planB: {
      title: 'Tips for the day',
      items: [
        'Take the seasickness tablet at the pier around 09:00, before the 09:30 departure. Sit toward the back of the boat; it is less bumpy.',
        'At Monkey Beach keep sunglasses, food and plastic bags out of sight. The monkeys grab things.',
        'No swimming at Maya Bay. Save the swim for Tonsai Bay and Khai Nok.',
        'Pickup running late? Call the operator on +66 81 538 7695.',
        'Diving starts early on Wednesday, so lay out dive gear and charge everything tonight after you get back.',
      ],
    },
    reminders: [
      { id: 'eve', at: '2026-11-02T20:00', title: 'Tomorrow: Phi Phi speedboat tour', body: 'Pickup 07:30–07:45 in the hotel lobby. Bring 2,500–3,000 THB in small notes, a towel and your passport.' },
      { id: 'pickup', at: '2026-11-03T07:10', title: 'Pickup in 20 minutes', body: 'Be in the lobby by 07:30. If the driver is late, call the operator on +66 81 538 7695.' },
      { id: 'tablet', at: '2026-11-03T08:50', title: 'Seasickness tablet', body: 'Take it at Roong Siam Pier, before the 09:30 departure. Pay the 400 THB park fee each in cash.' },
      { id: 'gear', at: '2026-11-03T19:30', title: 'Get ready for Wednesday', body: 'Lay out your dive gear and charge your computer, phone and power bank.' },
    ],
    todos: [
      { id: 'cash', text: 'Get 2,500–3,000 THB in small notes (800 THB park fee)' },
      { id: 'voucher', text: 'Klook voucher ready in the app, both QR codes' },
      { id: 'passport', text: 'Passport, or a photo of it' },
      { id: 'towel', text: 'Towel, change of clothes, bag for wet things' },
      { id: 'sun', text: 'Reef-safe sunscreen, hat with strap, sunglasses cord' },
      { id: 'dry', text: 'Dry bag, phone pouch, charged power bank' },
      { id: 'mask', text: 'Own mask (and fins)' },
      { id: 'lobby', text: 'In the lobby by 07:30' },
      { id: 'tablet', text: 'Seasickness tablet at the pier, about 09:00' },
      { id: 'gear', text: "Evening: lay out dive gear for Wednesday" },
    ],
  },
  {
    id: 'wed',
    date: '2026-11-04',
    dow: 'Wed',
    dom: '4 Nov',
    tone: 'good',
    pill: 'Good window',
    title: 'Racha Noi & Racha Yai',
    sub: '3 dives · from Chalong Pier · no park fee listed',
    photo: {
      file: 'Night_fishing_at_Racha_island_near_Phuket,_Thailand_(25845507748).jpg',
      alt: 'Fishing boat lights off Racha island at night',
      caption: 'Racha island, south of Phuket',
    },
    sea: 'racha',
    weather: { air: '31° / 26°C', rain: '15%', rainPct: 15, wind: TMD_WIND, sea: '≈1 m', seaNote: '>2 m in storms' },
    weatherNote:
      'Thai Met Dept (4–7 Nov, west coast): scattered to fairly widespread thundershowers, isolated heavy rain. Wednesday has the lowest rain chance of the week.',
    left: (
      <>
        <h3>Dive plan</h3>
        <ol className="dives">
          <li><span><b>Racha Noi</b><MapLink place="rachaNoi" /> — deeper, more current. Sea Bees lists 40 m max on this trip.</span></li>
          <li><span><b>Racha Noi</b> — second site, chosen on the day for current.</span></li>
          <li><span><b>Racha Yai</b><MapLink place="rachaYai" /> — easy, sheltered bays for the last dive.</span></li>
        </ol>
        <p className="note"><b>Gas check:</b> on EAN32 your MOD is 33.8 m at ppO₂ 1.4. Racha Noi can go deeper than that, so plan to your gas, not the reef.</p>
      </>
    ),
    right: (
      <>
        <h3>Book with</h3>
        <div className="ops">
          <Operator name="Sea Bees Diving" tag="Runs Wednesdays" price="4,700 THB" pick>
            <p className="op-meta">Free pickup Patong 08:00, Kata / Karon / Rawai / Nai Harn 08:15. Breakfast, lunch, tanks, weights and guide included.</p>
            <p className="op-meta">Nitrox 250 THB (12 L) or 350 THB (15 L) per dive. Gear set 750–900 THB.</p>
            <Contact display="+66 76 381 765" copy="+6676381765" />
            <Contact display="info@sea-bees.com" />
          </Operator>
          <Operator name="Sunrise Divers" price="from 3,900 THB">
            <p className="op-meta">Pickup 07:15–07:45, boat leaves Chalong 08:30. Gear set 500 THB. Ask for nitrox price.</p>
            <Contact display="+66 84 626 4646" copy="+66846264646" whatsapp="66846264646" />
          </Operator>
          <Operator name="Phuket Dive Tours" price="from 3,700 THB">
            <p className="op-meta">Racha Noi 3-dive trip. Nitrox 200 THB per 12 L tank. Gear 300 THB.</p>
            <Contact display="+66 87 022 5356" copy="+66870225356" whatsapp="66870225356" />
          </Operator>
        </div>
        <p className="note"><b>Getting there:</b> the shop&apos;s minibus collects you from your hotel and drives to Chalong Pier<MapLink place="chalongPier" />. Pickup is free from Patong, Kata, Karon and Rawai; other areas pay a surcharge.</p>
      </>
    ),
    planB: {
      title: 'If the boat is cancelled',
      items: [
        <>Afternoon at Big Buddha<MapLink place="bigBuddha" /> and Wat Chalong<MapLink place="watChalong" /> (free, cover shoulders and knees), then sunset at Promthep Cape<MapLink place="promthep" /> (18:05).</>,
        "Move the Racha trip to Sunday and keep Sunday's slot for Racha Yai.",
      ],
    },
    reminders: [
      { id: 'eve', at: '2026-11-03T20:00', title: 'Tomorrow: Racha Noi & Racha Yai', body: 'Confirm the pickup time with the dive shop. Pack cert card, nitrox card and dive computer.' },
    ],
    todos: [
      { id: 'confirm', text: 'Confirm pickup time with the dive shop' },
      { id: 'cards', text: 'Cert card, nitrox card, dive computer' },
      { id: 'analyse', text: 'Analyse every tank; EAN32 MOD 33.8 m' },
      { id: 'cash', text: 'Cash for nitrox and gear rental' },
      { id: 'log', text: 'Log the three dives' },
    ],
  },
  {
    id: 'thu',
    date: '2026-11-05',
    dow: 'Thu',
    dom: '5 Nov',
    tone: 'good',
    pill: 'Good window · long crossing',
    title: 'Similan Islands day trip',
    sub: '2 dives · from Thap Lamu Pier, Khao Lak · park open 15 Oct – 15 May',
    photo: { file: 'Similan_Island_01_(MK).jpg', alt: 'The Similan Islands in the Andaman Sea', caption: 'Similan Islands, Phang Nga' },
    sea: 'similan',
    weather: { air: '31° / 25°C', rain: '20%', rainPct: 20, wind: TMD_WIND, sea: '≈1 m', seaNote: '1–2 m offshore' },
    weatherNote: 'Second-driest day, so it gets the long offshore run. Take a seasickness tablet at the hotel, not at the pier.',
    left: (
      <>
        <h3>Dive plan</h3>
        <ol className="dives">
          <li><span><b>Stonehenge</b> — granite boulders and swim-throughs.</span></li>
          <li><span><b>West of Eden</b> — reef slope on Island No. 7.</span></li>
        </ol>
        <p className="note">These are Thailand Divers&apos; Thursday sites in Mu Ko Similan National Park<MapLink place="similan" />. The captain can change them for current or swell.</p>
        <h3>Day timeline</h3>
        <ul className="timeline">
          <li><span className="tm">06:00</span><span>Hotel pickup in Phuket</span></li>
          <li><span className="tm">08:30</span><span>Speedboat leaves Thap Lamu Pier</span></li>
          <li><span className="tm">10:30</span><span>Dive 1</span></li>
          <li><span className="tm">12:00</span><span>Lunch on board</span></li>
          <li><span className="tm">14:00</span><span>Dive 2</span></li>
          <li><span className="tm">15:30</span><span>Boat heads back</span></li>
          <li><span className="tm">≈19:00</span><span>Back at hotel</span></li>
        </ul>
      </>
    ),
    right: (
      <>
        <h3>Book with</h3>
        <div className="ops">
          <Operator name="Thailand Divers" tag="Day trip" price="6,100 THB" pick>
            <p className="op-meta">Includes return hotel transfer from Phuket, 2 dives, breakfast and lunch. Park fee 700 THB paid on board.</p>
            <p className="op-meta">Nitrox 300 THB per cylinder. Gear set 500 THB. Bookings under 30 days out are paid in full.</p>
            <Contact display="+44 7340 764006" copy="+447340764006" whatsapp="447340764006" />
          </Operator>
          <Operator name="Phuket Dive Tours" price="ask">
            <p className="op-meta">Lists a Similan 2-dive day trip; no price published.</p>
            <Contact display="+66 87 022 5356" copy="+66870225356" whatsapp="66870225356" />
          </Operator>
        </div>
        <p className="note"><b>Getting there:</b> about 2 hours by road from Phuket to Thap Lamu Pier<MapLink place="thapLamuPier" /> in Khao Lak, then the speedboat to the islands. The transfer is in the price.</p>
      </>
    ),
    planB: {
      title: 'If the crossing is cancelled',
      items: [
        <>Move the day: Thailand Divers also runs Friday (Three Trees &amp; North Point) and Sunday (Richelieu Rock, from Namkhem Pier<MapLink place="namKhemPier" />). Sunday is the drier pick.</>,
        <>Stay local: King Cruiser, Shark Point and Koh Doc Mai with Sunrise Divers (3,900 THB), a shorter run from Chalong Pier<MapLink place="chalongPier" />.</>,
        'No diving: Phang Nga Bay by big boat. The bay is sheltered and tours run in most weather.',
      ],
    },
    reminders: [
      { id: 'eve', at: '2026-11-04T20:00', title: 'Tomorrow: Similan, 06:00 pickup', body: 'Set an alarm. Take the seasickness tablet at the hotel. Cash for the 700 THB park fee.' },
      { id: 'friday', at: '2026-11-05T18:00', title: 'Decide Friday with the shop', body: 'Friday is the wettest day in the forecast. Confirm or cancel the King Cruiser trip tonight.' },
    ],
    todos: [
      { id: 'alarm', text: 'Alarm for the 06:00 pickup' },
      { id: 'tablet', text: 'Seasickness tablet at the hotel' },
      { id: 'cash', text: 'Cash: 700 THB park fee + 300 THB per nitrox fill' },
      { id: 'friday', text: 'Evening: decide Friday with the shop' },
      { id: 'log', text: 'Log both dives' },
    ],
  },
  {
    id: 'fri',
    date: '2026-11-06',
    dow: 'Fri',
    dom: '6 Nov',
    tone: 'poor',
    pill: 'Rain likely · standby',
    title: 'King Cruiser, Shark Point & Koh Doc Mai',
    sub: '3 dives if the shop confirms · from Chalong Pier',
    photo: { file: 'Stegostoma_fasciatum_thailand.jpg', alt: 'A leopard shark on the sea floor in Thailand', caption: 'Leopard shark, the namesake of Shark Point' },
    sea: 'south',
    weather: { air: '31° / 25°C', rain: '75%', rainPct: 75, wind: TMD_WIND, sea: '≈1 m', seaNote: '>2 m in storms' },
    weatherNote: 'Wettest day of the week. Rain alone rarely stops a dive; thunderstorms and the waves they bring do. Decide on Thursday evening with the shop.',
    left: (
      <>
        <h3>Dive plan</h3>
        <ol className="dives">
          <li><span><b>King Cruiser wreck</b><MapLink place="kingCruiser" /> — sunken car ferry. Swapped for Koh Doc Mai if the current is strong.</span></li>
          <li><span><b>Shark Point</b><MapLink place="sharkPoint" /> — pinnacles with soft coral; leopard sharks possible.</span></li>
          <li><span><b>Koh Doc Mai</b><MapLink place="docMai" /> — wall dive.</span></li>
        </ol>
        <p className="note"><b>Swap option:</b> Sea Bees runs Phi Phi on Fridays. If Friday looks better than Saturday on Thursday night, switch the two days.</p>
      </>
    ),
    right: (
      <>
        <h3>Book with</h3>
        <div className="ops">
          <Operator name="Sunrise Divers" tag="Near-daily" price="3,900 THB" pick>
            <p className="op-meta">Runs almost daily in high season. Pickup 07:15–07:45, Chalong 08:30, back at the pier about 17:00.</p>
            <Contact display="+66 84 626 4646" copy="+66846264646" whatsapp="66846264646" />
          </Operator>
          <Operator name="Sea Bees · Phi Phi" price="4,700 THB">
            <p className="op-meta">Fridays only, 3 dives. Park fee 600 THB for divers.</p>
            <Contact display="+66 76 381 765" copy="+6676381765" />
          </Operator>
        </div>
        <p className="note"><b>Getting there:</b> hotel minibus to Chalong Pier<MapLink place="chalongPier" />, included from the west-coast beaches.</p>
      </>
    ),
    planB: {
      title: 'Likely plan: a dry day on land',
      items: [
        <>Indoor day in Phuket Town: Aquaria Phuket<MapLink place="aquaria" />.</>,
        'From Patong it is 20–30 min by Grab or Bolt. A taxi is about 400–500 THB.',
        <>Or Phuket Elephant Sanctuary<MapLink place="elephantSanctuary" /> (half day, 3,000 THB with lunch). Raincoats and boots are provided.</>,
      ],
    },
    todos: [
      { id: 'decide', text: 'Thursday evening: confirm or cancel with the shop' },
      { id: 'swap', text: 'Check whether to swap with Saturday' },
      { id: 'planb', text: 'If cancelled: pick an indoor Plan B' },
    ],
  },
  {
    id: 'sat',
    date: '2026-11-07',
    dow: 'Sat',
    dom: '7 Nov',
    tone: 'watch',
    pill: 'Mixed · confirm the night before',
    title: 'Phi Phi: Bida Nok & Bida Nai',
    sub: '3 dives · from Chalong Pier · Phi Phi park fee 600 THB',
    photo: { file: 'Koh_Phi_Phi_Islands.JPG', alt: 'The Koh Phi Phi islands', caption: 'Koh Phi Phi; Bida Nok and Bida Nai lie just south' },
    sea: 'phiphi',
    weather: { air: '31° / 26°C', rain: '55%', rainPct: 55, wind: TMD_WIND, sea: '≈1 m', seaNote: '>2 m in storms' },
    weatherNote: "Showers likely but not certain. Last day inside the Thai Met Dept's 1–7 Nov outlook.",
    left: (
      <>
        <h3>Dive plan</h3>
        <ol className="dives">
          <li><span><b>Koh Bida Nok</b><MapLink place="bidaNok" /> — walls and leopard sharks.</span></li>
          <li><span><b>Koh Bida Nai</b><MapLink place="bidaNai" /> — turtles and reef life in the shallows.</span></li>
          <li><span><b>Shark Point, Anemone Reef or Koh Doc Mai</b> — picked on the day for weather and boat traffic.</span></li>
        </ol>
        <p className="note"><b>Park fee:</b> 400 THB entry plus 200 THB diving fee, cash on site. Not included in trip prices.</p>
      </>
    ),
    right: (
      <>
        <h3>Book with</h3>
        <div className="ops">
          <Operator name="Phuket Dive Tours" price="from 3,700 THB" pick>
            <p className="op-meta">Pickup 07:00–08:00, boat 08:30, back about 18:15. Nitrox 200 THB per 12 L tank. Gear 300 THB.</p>
            <p className="op-meta">Free pickup from Kata, Karon, Rawai, Nai Harn, Chalong, Patong and Kalim.</p>
            <Contact display="+66 87 022 5356" copy="+66870225356" whatsapp="66870225356" />
            <Contact display="+66 86 690 8157" copy="+66866908157" note="Thai line" />
          </Operator>
          <Operator name="Sunrise Divers" price="from 3,900 THB">
            <p className="op-meta">Phi Phi with Shark Point or Anemone Reef.</p>
            <Contact display="+66 84 626 4646" copy="+66846264646" whatsapp="66846264646" />
          </Operator>
        </div>
        <p className="note"><b>Evening:</b> Naka Weekend Market<MapLink place="naka" />, near Central Festival, runs Saturday and Sunday, 16:00–22:00.</p>
      </>
    ),
    planB: {
      title: 'If the boat is cancelled',
      items: [
        <>Phang Nga Bay and James Bond Island<MapLink place="jamesBond" /> by big boat with canoeing: about 1,500 THB, about 8 hours, hotel pickup included. Park fee 300 THB if not included.</>,
        <>Phuket Elephant Sanctuary<MapLink place="elephantSanctuary" />, half day with vegetarian lunch: 3,000 THB. Observation only, no riding.</>,
      ],
    },
    reminders: [
      { id: 'eve', at: '2026-11-06T20:00', title: 'Tomorrow: Phi Phi dives', body: 'Confirm the boat is going. Bring 600 THB in cash for the park and diving fee.' },
    ],
    todos: [
      { id: 'confirm', text: 'Friday night: confirm the boat is going' },
      { id: 'cash', text: 'Cash: 600 THB park fee (400 entry + 200 diving)' },
      { id: 'log', text: 'Log the three dives' },
      { id: 'naka', text: 'Evening: Naka Weekend Market' },
    ],
  },
  {
    id: 'sun',
    date: '2026-11-08',
    dow: 'Sun',
    dom: '8 Nov',
    tone: 'good',
    pill: 'Good window · last dive day',
    title: 'Racha Yai, easy finish',
    sub: '2 relaxed dives · from Chalong Pier · Old Town walking street after',
    photo: {
      file: 'Phuket_Town_Thailand-Houses-in-Thalang-Road-05.jpg',
      alt: 'Shophouses on Thalang Road in Phuket Old Town',
      caption: 'Thalang Road, home of the Sunday walking street',
    },
    sea: 'racha',
    weather: { air: '31° / 27°C', rain: '20%', rainPct: 20, wind: 'not issued yet', sea: 'not issued yet' },
    weatherNote: "Beyond the current official 7-day marine outlook. Check the Thai Met Dept's new forecast on Saturday evening.",
    left: (
      <>
        <h3>Dive plan</h3>
        <ol className="dives">
          <li><span><b>Racha Yai</b><MapLink place="rachaYai" /> — sheltered bay, easy profile.</span></li>
          <li><span><b>Racha Yai</b> — second bay, shallow and slow.</span></li>
        </ol>
        <p className="note"><b>Before the flight:</b> back at the pier on Sunday afternoon leaves about 40 hours before Tuesday&apos;s flight. That is well past the usual 18-hour minimum after several days of diving, and Monday stays dry.</p>
      </>
    ),
    right: (
      <>
        <h3>Book with</h3>
        <div className="ops">
          <Operator name="Sunrise Divers" price="from 3,000 THB" pick>
            <p className="op-meta">Racha Yai 2-dive day trip. Confirm Sunday departure when you book.</p>
            <Contact display="+66 84 626 4646" copy="+66846264646" whatsapp="66846264646" />
          </Operator>
          <Operator name="Phuket Dive Tours" price="ask">
            <p className="op-meta">Several Racha Yai 2-dive options, including a big-boat trip.</p>
            <Contact display="+66 87 022 5356" copy="+66870225356" whatsapp="66870225356" />
          </Operator>
        </div>
        <p className="note">Sea Bees runs Racha Yai on Monday, Thursday and Saturday, so not on Sunday.</p>
        <p className="note"><b>Evening:</b> Lard Yai Sunday Walking Street<MapLink place="lardYai" /> on Thalang Road, Phuket Old Town, 16:00–22:00. Grab from Patong is 25–30 min, about 300–500 THB.</p>
      </>
    ),
    planB: {
      title: 'If the boat is cancelled',
      items: [
        <>Big Buddha<MapLink place="bigBuddha" /> (09:00–18:00, last entry 17:30, free) and Wat Chalong<MapLink place="watChalong" />, 10 minutes apart.</>,
        <>Sunset at Promthep Cape<MapLink place="promthep" /> (18:04), then the walking street in Old Town.</>,
      ],
    },
    reminders: [
      { id: 'forecast', at: '2026-11-07T19:00', title: 'Check Sunday’s forecast', body: 'Sunday is the last dive day. Check the Thai Met Dept outlook before you sleep.' },
    ],
    todos: [
      { id: 'forecast', text: "Saturday evening: check the Thai Met Dept forecast" },
      { id: 'surface', text: 'Note the time of the last surfacing (flight is ≈40 h later)' },
      { id: 'log', text: 'Log the last two dives' },
      { id: 'lardyai', text: 'Evening: Lard Yai walking street' },
    ],
  },
  {
    id: 'mon',
    date: '2026-11-09',
    dow: 'Mon',
    dom: '9 Nov',
    tone: 'rest',
    pill: 'No diving',
    title: 'Rest and off-gas',
    chipNote: 'Rest',
    sub: 'Dry day before the flight · pack gear dry',
    photo: { file: 'Phuket_Thai_Hua_School.jpg', alt: 'The Phuket Thai Hua Museum building', caption: 'Thai Hua Museum, Phuket Old Town' },
    sea: null,
    weather: { air: '31° / 26°C', rain: '40%', rainPct: 40, wind: 'not issued yet', sea: '—' },
    left: (
      <>
        <h3>Easy ideas</h3>
        <ul className="timeline">
          <li><span className="tm">Morning</span><span>Rinse and hang any gear you brought so it is dry before packing.</span></li>
          <li><span className="tm">Midday</span><span>Phuket Old Town<MapLink place="oldTown" /> by the free Dragon Line bus (11:00–22:00, every 15 min).</span></li>
          <li><span className="tm">Afternoon</span><span>Aquaria Phuket<MapLink place="aquaria" /> if it rains. Mermaid shows do not run on Mondays.</span></li>
        </ul>
      </>
    ),
    right: (
      <>
        <h3>Keep it light</h3>
        <p className="note">No scuba and no freediving today. A slow day on land is the point.</p>
        <p className="note">Book Tuesday&apos;s airport ride today so you are not hunting for a car in the morning.</p>
      </>
    ),
    reminders: [
      { id: 'ride', at: '2026-11-09T10:00', title: 'Book tomorrow’s airport ride', body: 'Leave about 3 hours before departure; traffic can stretch the drive to 1.5 hours.' },
    ],
    todos: [
      { id: 'rinse', text: 'Rinse and dry all gear' },
      { id: 'ride', text: "Book Tuesday's airport ride" },
      { id: 'checkin', text: 'Online check-in for the flight' },
    ],
  },
  {
    id: 'tue',
    date: '2026-11-10',
    dow: 'Tue',
    dom: '10 Nov',
    tone: 'rest',
    pill: 'Travel',
    title: 'Fly home to India',
    chipNote: 'Fly home',
    sub: (
      <>
        Phuket International Airport (HKT)
        <MapLink place="airport" />
      </>
    ),
    sea: null,
    weather: {},
    extraCells: [{ label: 'Leave', value: '3 h before', small: 'from Patong' }],
    left: (
      <>
        <h3>Getting to the airport</h3>
        <ul className="rows">
          <li><span><b>Smart Bus Route 1</b><small>Hourly, 08:15–23:30</small></span><span className="val">100 THB / person</span></li>
          <li><span><b>InDrive</b><small>You propose the fare</small></span><span className="val">500–650 THB</span></li>
          <li><span><b>Bolt</b><small>Usually 15–30% below Grab</small></span><span className="val">550–700 THB</span></li>
          <li><span><b>Grab</b></span><span className="val">650–900 THB</span></li>
          <li><span><b>Hotel taxi</b></span><span className="val">700–1,200 THB</span></li>
        </ul>
      </>
    ),
    right: (
      <>
        <h3>Timing</h3>
        <p className="note">Peak traffic can stretch the Patong–airport drive to 1.5 hours, so leave about 3 hours before an international departure.</p>
      </>
    ),
    reminders: [
      { id: 'flight', at: '2026-11-10T07:00', title: 'Flight day', body: 'Pack the dry gear, check in online and leave for the airport about 3 hours before departure.' },
    ],
    todos: [
      { id: 'pack', text: 'Pack dry dive gear and logbook' },
      { id: 'leave', text: 'Leave for the airport 3 h before departure' },
      { id: 'cash', text: 'Spend or change leftover baht' },
    ],
  },
];

export const DAY_BY_ID = Object.fromEntries(DAYS.map((day) => [day.id, day])) as Record<DayId, DayPlan>;
export const TRIP_START = DAYS[0]?.date ?? '2026-11-03';
export const TRIP_END = DAYS[DAYS.length - 1]?.date ?? '2026-11-10';
