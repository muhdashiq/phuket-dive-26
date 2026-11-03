import { useEffect, useRef } from 'react';
import { useTrip } from '../data/trip';
import type { DayId, Tone } from '../data/types';
import { rainTone, type DailyWeather } from '../lib/weather';
import { Icon } from './Icon';

type WeekStripProps = {
  selected: DayId;
  today: string;
  daily: Record<string, DailyWeather>;
  onSelect: (id: DayId) => void;
  onAdd: () => void;
};

export const dayTone = (sea: unknown, fallback: Tone, rainPct: number | null | undefined): Tone =>
  sea && typeof rainPct === 'number' ? rainTone(rainPct) : fallback;

// Apple Fitness-style date picker. Eight days fit on a phone; added days
// make the row scroll sideways.
export const WeekStrip = ({ selected, today, daily, onSelect, onAdd }: WeekStripProps) => {
  const { days } = useTrip();
  const row = useRef<HTMLDivElement>(null);

  // Keep the selected day visible when the row scrolls sideways.
  useEffect(() => {
    const strip = row.current;
    const chip = strip?.querySelector<HTMLElement>('[aria-current="date"]');
    if (!strip || !chip || strip.scrollWidth <= strip.clientWidth) return;
    const left = chip.offsetLeft - strip.offsetLeft;
    if (left < strip.scrollLeft || left + chip.offsetWidth > strip.scrollLeft + strip.clientWidth) {
      strip.scrollLeft = left - (strip.clientWidth - chip.offsetWidth) / 2;
    }
  }, [selected, days.length]);

  return (
    <div className={`weekstrip${days.length > 8 ? ' scrolls' : ''}`} style={{ ['--n' as string]: days.length + 1 }}>
      <div ref={row} role="tablist" aria-label="Trip days" className="weekstrip-days">
        {days.map((day) => {
          const tone = dayTone(day.sea, day.tone, daily[day.date]?.rainPct ?? day.weather.rainPct);
          const classes = ['wday', day.date === today && 'today', day.date < today && 'past', day.custom && 'added'].filter(Boolean).join(' ');
          const isSelected = day.id === selected;
          return (
            <button
              key={day.id}
              type="button"
              role="tab"
              className={classes}
              aria-selected={isSelected}
              aria-current={isSelected ? 'date' : undefined}
              aria-label={`${day.dow} ${day.dom}: ${day.title}${day.date === today ? ', today' : ''}${day.custom ? ', added by you' : ''}`}
              onClick={() => onSelect(day.id)}
            >
              <span className="dow">{day.dow.slice(0, 3)}</span>
              <span className="num">{day.dom.split(' ')[0]}</span>
              <span className={`mark ${tone}`} />
            </button>
          );
        })}
      </div>
      <button type="button" className="wday add" aria-label="Plan a new day" onClick={onAdd}>
        <span className="dow">New</span>
        <span className="num"><Icon name="plus" size={18} /></span>
        <span className="mark none" />
      </button>
    </div>
  );
};
