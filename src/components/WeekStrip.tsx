import { DAYS } from '../data/days';
import type { DayId, Tone } from '../data/types';
import { rainTone, type DailyWeather } from '../lib/weather';

type WeekStripProps = {
  selected: DayId;
  today: string;
  daily: Record<string, DailyWeather>;
  onSelect: (id: DayId) => void;
};

export const dayTone = (sea: unknown, fallback: Tone, rainPct: number | null | undefined): Tone =>
  sea && typeof rainPct === 'number' ? rainTone(rainPct) : fallback;

// Apple Fitness-style date picker: every trip day fits on one row.
export const WeekStrip = ({ selected, today, daily, onSelect }: WeekStripProps) => (
  <div className="weekstrip" role="tablist" aria-label="Trip days">
    {DAYS.map((day) => {
      const tone = dayTone(day.sea, day.tone, daily[day.date]?.rainPct ?? day.weather.rainPct);
      const classes = ['wday', day.date === today && 'today', day.date < today && 'past'].filter(Boolean).join(' ');
      const isSelected = day.id === selected;
      return (
        <button
          key={day.id}
          type="button"
          role="tab"
          className={classes}
          aria-selected={isSelected}
          aria-current={isSelected ? 'date' : undefined}
          aria-label={`${day.dow} ${day.dom}: ${day.title}${day.date === today ? ', today' : ''}`}
          onClick={() => onSelect(day.id)}
        >
          <span className="dow">{day.dow.slice(0, 3)}</span>
          <span className="num">{day.dom.split(' ')[0]}</span>
          <span className={`mark ${tone}`} />
        </button>
      );
    })}
  </div>
);
