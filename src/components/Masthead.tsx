import { useState, type CSSProperties } from 'react';

type MastheadProps = { onOpenSettings: () => void };

const BAND = 'Enriched air nitrox · Analyse every tank · Check your MOD · Plan your gas · ';
const BUBBLES: [string, string, string, string][] = [
  ['6%', '7px', '13s', '-2s'], ['14%', '4px', '10s', '-7s'], ['27%', '10px', '16s', '-5s'],
  ['41%', '5px', '11s', '-9s'], ['58%', '8px', '14s', '-3s'], ['69%', '4px', '9s', '-6s'],
  ['78%', '12px', '18s', '-11s'], ['88%', '6px', '12s', '-1s'], ['95%', '5px', '15s', '-8s'],
];

export const Masthead = ({ onOpenSettings }: MastheadProps) => {
  const [shareLabel, setShareLabel] = useState('Share plan');

  const share = async () => {
    const url = window.location.href.split('#')[0] ?? window.location.href;
    if (navigator.share) {
      navigator.share({ title: document.title, text: 'Phuket trip, 3–10 Nov 2026', url }).catch(() => undefined);
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareLabel('Link copied');
    } catch {
      setShareLabel('Copy the page address');
    }
    window.setTimeout(() => setShareLabel('Share plan'), 1600);
  };

  return (
    <header className="masthead">
      <div className="bubbles" aria-hidden="true">
        {BUBBLES.map(([x, s, d, delay]) => (
          <span key={x} style={{ '--x': x, '--s': s, '--d': d, '--delay': delay } as CSSProperties} />
        ))}
      </div>
      <div className="wrap">
        <p className="eyebrow">Andaman Sea · 3 – 10 November 2026 · Nitrox</p>
        <h1>Phuket Dive Week</h1>
        <p className="lede">
          A Phi Phi speedboat and snorkel tour on Tuesday 3 Nov, then five boat days from Wednesday to Sunday, Monday off for
          off-gassing, and the flight home to India on Tuesday. Each day has its own checklist and notes, saved on this device.
        </p>
        <dl className="facts">
          <div><dt>Snorkel day</dt><dd>Tue 3 Nov, booked</dd></div>
          <div><dt>Boat days</dt><dd>5 (Fri on standby)</dd></div>
          <div><dt>Dives</dt><dd>up to 13</dd></div>
          <div><dt>Water</dt><dd>28–29 °C</dd></div>
          <div><dt>Est. cost / diver</dt><dd>24,700–25,900 THB</dd></div>
        </dl>
        <div className="mast-actions">
          <button className="btn btn-mast" type="button" onClick={share}>{shareLabel}</button>
          <button className="btn btn-mast" type="button" onClick={onOpenSettings}>
            <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" /></svg>
            Settings
          </button>
          <a className="btn btn-mast" href="https://github.com/muhdashiq/phuket-dive-26" target="_blank" rel="noopener">
            <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M8 7l-5 5 5 5M16 7l5 5-5 5" /></svg>
            Source
          </a>
        </div>
      </div>
      <div className="tankband" aria-hidden="true">
        <div className="wrap">
          <span className="marquee"><span>{BAND.repeat(2)}</span><span>{BAND.repeat(2)}</span></span>
        </div>
      </div>
    </header>
  );
};
