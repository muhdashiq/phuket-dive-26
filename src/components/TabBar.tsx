import { useEffect, useRef } from 'react';
import { DAYS } from '../data/days';
import { COMMON_TABS } from '../data/reference';
import type { TabId } from '../data/types';
import { rainTone, type DailyWeather } from '../lib/weather';

type TabBarProps = {
  active: TabId;
  today: string;
  daily: Record<string, DailyWeather>;
};

export const TabBar = ({ active, today, daily }: TabBarProps) => {
  const stripRef = useRef<HTMLDivElement>(null);
  const firstUpcoming = today < (DAYS[0]?.date ?? '') ? DAYS[0]?.id : null;

  // Keep the active chip visible in the horizontally scrolling strip.
  useEffect(() => {
    const strip = stripRef.current;
    const chip = strip?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!strip || !chip) return;
    const chipBox = chip.getBoundingClientRect();
    const stripBox = strip.getBoundingClientRect();
    if (chipBox.left < stripBox.left || chipBox.right > stripBox.right) {
      strip.scrollLeft += chipBox.left - stripBox.left - 2;
    }
  }, [active]);

  return (
    <nav className="daybar" aria-label="Trip days and info">
      <div className="wrap">
        <div className="chips" ref={stripRef}>
          {DAYS.map((day) => {
            const live = daily[day.date]?.rainPct ?? null;
            const pct = day.sea ? (live ?? day.weather.rainPct ?? null) : null;
            const tone = pct !== null ? rainTone(pct) : day.tone;
            const isToday = day.date === today;
            const label = isToday ? 'Today' : day.id === firstUpcoming ? 'Next' : null;
            const status = day.chipNote ?? (pct !== null ? `${pct}%` : '');
            const classes = ['chip', isToday && 'today', day.date < today && 'past'].filter(Boolean).join(' ');
            return (
              <a key={day.id} className={classes} href={`#${day.id}`} aria-current={active === day.id ? 'page' : undefined}>
                {label && <span className="when">{label}</span>}
                <span className="d">{day.dow}</span>
                <span className="s">
                  <i className={`dot t-${tone}`} />
                  {day.dom}
                  {status && ` · ${status}`}
                </span>
              </a>
            );
          })}
          <span className="chip-sep" aria-hidden="true" />
          {COMMON_TABS.map((tab) => (
            <a key={tab.id} className="chip chip-ref" href={`#${tab.id}`} aria-current={active === tab.id ? 'page' : undefined}>
              <span className="d">{tab.label}</span>
              <span className="s">{tab.note}</span>
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};
