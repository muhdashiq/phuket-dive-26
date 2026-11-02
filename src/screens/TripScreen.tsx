import { DAYS } from '../data/days';
import { BOOKING_STEPS, COST_ROWS } from '../data/reference';
import type { DayId } from '../data/types';
import { Icon } from '../components/Icon';
import { ProgressRing, ScreenHeader, Section } from '../components/ui';
import { dayTone } from '../components/WeekStrip';
import type { TripWeather } from '../hooks/useWeather';
import type { NoteStore } from '../lib/notes';
import { todoItems, type TodoStore } from '../lib/todos';

type TripScreenProps = {
  today: string;
  weather: TripWeather;
  todos: TodoStore;
  notes: NoteStore;
  doneSteps: string[];
  onToggleStep: (id: string) => void;
  onOpenDay: (id: DayId) => void;
};

const TOTALS: { label: string; value: string; strong?: boolean }[] = [
  { label: 'Trips, 13 dives', value: '20,600' },
  { label: 'Park fees', value: '1,300' },
  { label: 'Nitrox', value: '2,800–4,000' },
  { label: 'Total per diver', value: '24,700–25,900 THB', strong: true },
  { label: 'If Friday is cancelled', value: '20,200–20,950 THB' },
];

export const TripScreen = ({ today, weather, todos, notes, doneSteps, onToggleStep, onOpenDay }: TripScreenProps) => {
  const booked = BOOKING_STEPS.filter((step) => doneSteps.includes(step.id)).length;

  return (
    <div className="screen">
      <ScreenHeader title="Trip" eyebrow="Phuket · 3–10 Nov 2026" />

      <div className="stats">
        <div className="stat"><b>8</b><span>days</span></div>
        <div className="stat"><b>13</b><span>dives, nitrox</span></div>
        <div className="stat"><b>≈25k</b><span>THB per diver</span></div>
      </div>

      <Section id="itinerary-h" title="Itinerary">
        <div className="group">
          {DAYS.map((day) => {
            const items = todoItems(day.todos, todos, day.id);
            const done = items.filter((i) => i.done).length;
            const tone = dayTone(day.sea, day.tone, weather.daily[day.date]?.rainPct ?? day.weather.rainPct);
            const isToday = day.date === today;
            return (
              <button key={day.id} type="button" className={`row day-row${isToday ? ' is-today' : ''}`} onClick={() => onOpenDay(day.id)}>
                <span className={`datebox ${tone}`}>
                  <small>{day.dow}</small>
                  <b>{day.dom.split(' ')[0]}</b>
                </span>
                <span className="row-body">
                  <span className="row-title">{day.title}</span>
                  <span className="row-sub">{isToday ? `Today · ${day.pill}` : day.pill}</span>
                </span>
                <span className="row-meta">
                  {notes[day.id] && <Icon name="note" label="Has notes" />}
                  <ProgressRing value={done} total={items.length} size={22} />
                  <Icon name="chevronRight" className="row-chevron" />
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section
        id="book-h"
        title="Book in this order"
        trailing={<span className="t-foot tnum">{booked === BOOKING_STEPS.length ? 'All booked' : `${booked} of ${BOOKING_STEPS.length}`}</span>}
      >
        <ul className="checklist">
          {BOOKING_STEPS.map((step) => (
            <li key={step.id} className="check-row">
              <label className="check">
                <input type="checkbox" checked={doneSteps.includes(step.id)} onChange={() => onToggleStep(step.id)} />
                <span className="box"><Icon name="check" /></span>
                <span className="label">
                  <span style={{ display: 'block', fontWeight: 600 }}>{step.title}</span>
                  <span className="t-foot" style={{ display: 'block' }}>{step.detail}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="costs-h"
        title="Costs per diver"
        footer="Cheapest listed operator for each day, in THB. Nitrox is estimated at 200–350 THB a tank where the shop doesn't publish a price. Gear rental and tips are extra."
      >
        <div className="group">
          {COST_ROWS.map((row) => (
            <div key={row.day} className="row">
              <span className="row-body">
                <span className="row-title">{row.day} · {row.trip}</span>
                <span className="row-sub">
                  {row.operator}
                  {row.parkFee !== '—' && ` · park ${row.parkFee}`} · nitrox {row.nitrox}
                </span>
              </span>
              <span className="row-value">{row.price}</span>
            </div>
          ))}
        </div>
        <div className="group">
          {TOTALS.map((total) => (
            <div key={total.label} className={`row${total.strong ? ' cost-total' : ''}`}>
              <span className="row-body"><span className="row-title">{total.label}</span></span>
              <span className="row-value">{total.value}</span>
            </div>
          ))}
        </div>
        <div className="group">
          <div className="row row-icon">
            <span className="tile-icon teal"><Icon name="cash" size={18} /></span>
            <span className="row-body">
              <span className="row-title">Tue 3 Nov Phi Phi tour</span>
              <span className="row-sub">Prepaid on Klook. Bring cash for the 400 THB park fee each, plus extras: about 2,500–3,000 THB for two.</span>
            </span>
          </div>
        </div>
      </Section>
    </div>
  );
};
