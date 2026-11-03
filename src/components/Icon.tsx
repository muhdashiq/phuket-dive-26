import type { ReactNode } from 'react';

// SF Symbols-inspired line icons on a 24px grid. Shapes marked with the
// "f" class pick up a soft fill when the icon is shown as selected.

const gearPath = (() => {
  const teeth = 8;
  const points: string[] = [];
  for (let i = 0; i < teeth * 4; i += 1) {
    const angle = (i / (teeth * 4)) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 4 === 0 || i % 4 === 1 ? 9.2 : 7.2;
    points.push(`${(12 + radius * Math.cos(angle)).toFixed(2)} ${(12 + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return `M${points.join('L')}Z`;
})();

const sunRays = [0, 45, 90, 135, 180, 225, 270, 315]
  .map((deg) => {
    const r = (deg * Math.PI) / 180;
    const x1 = 12 + 6.6 * Math.cos(r);
    const y1 = 12 + 6.6 * Math.sin(r);
    const x2 = 12 + 8.8 * Math.cos(r);
    const y2 = 12 + 8.8 * Math.sin(r);
    return `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`;
  })
  .join('');

const ICONS = {
  today: (
    <>
      <rect className="f" x="3.5" y="4.5" width="17" height="16" rx="3.5" />
      <path d="M3.5 9.5h17M8 2.8v3.4M16 2.8v3.4" />
      <circle cx="12" cy="15" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  trip: (
    <>
      <rect className="f" x="3" y="7" width="18" height="13" rx="3" />
      <path d="M8.5 7V5.5A2 2 0 0 1 10.5 3.5h3a2 2 0 0 1 2 2V7M8.5 7v13M15.5 7v13" />
    </>
  ),
  explore: (
    <>
      <circle className="f" cx="12" cy="12" r="9" />
      <path d="M15.6 8.4l-2.2 5-5 2.2 2.2-5z" />
    </>
  ),
  contacts: <path className="f" d="M6.6 3.5h2.3l1.6 4.1-2.1 1.3a12 12 0 0 0 6.7 6.7l1.3-2.1 4.1 1.6v2.3a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" />,
  you: (
    <>
      <circle className="f" cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3.2" />
      <path d="M6.3 18.3a7 7 0 0 1 11.4 0" />
    </>
  ),
  search: <path d="M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM15.3 15.3L20 20" />,
  star: <path className="f" d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" />,
  settings: (
    <>
      <path d={gearPath} />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  share: <path d="M12 14V3.5M8 7.3l4-3.8 4 3.8M8 10.5H6.5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H16" />,
  edit: <path d="M14.8 5.2l4 4L8.4 19.6l-4.9.9.9-4.9zM12.6 7.4l4 4" />,
  trash: <path d="M4.5 6.5h15M9.5 6.5V4.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.7M6.5 6.5l.9 12.6a1.6 1.6 0 0 0 1.6 1.4h6a1.6 1.6 0 0 0 1.6-1.4l.9-12.6M10.2 10.5v6M13.8 10.5v6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  chevronRight: <path d="M9.5 5.5L16 12l-6.5 6.5" />,
  chevronLeft: <path d="M14.5 5.5L8 12l6.5 6.5" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  pin: (
    <>
      <path className="f" d="M12 21s-6.5-6-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15 12 21 12 21z" />
      <circle cx="12" cy="9.8" r="2.3" />
    </>
  ),
  history: <path d="M4.2 12a7.8 7.8 0 1 0 2.3-5.5M4 4v3.5h3.5M12 7.8V12l3 2" />,
  phone: <path d="M6.6 3.5h2.3l1.6 4.1-2.1 1.3a12 12 0 0 0 6.7 6.7l1.3-2.1 4.1 1.6v2.3a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" />,
  message: <path d="M12 4a8 8 0 1 1-4 14.9L4 20l1.1-3.9A8 8 0 0 1 12 4z" />,
  copy: <path d="M10 8.5h8a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 8.5 18v-8A1.5 1.5 0 0 1 10 8.5zM15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />,
  mail: <path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17V7A1.5 1.5 0 0 1 5 5.5zM4 7l8 6 8-6" />,
  refresh: <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4.5H15" />,
  location: <path d="M20 4L4 11l7 2 2 7z" />,
  external: <path d="M14 4.5h5.5V10M19.5 4.5L11 13M18 14v4.5a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1H10" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d={sunRays} />
    </>
  ),
  rain: <path d="M7 15.5a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 8.8a3.4 3.4 0 0 1 .2 6.7zM8.5 18.5l-1 2M12.5 18.5l-1 2M16.5 18.5l-1 2" />,
  wind: <path d="M3.5 9h10a2.8 2.8 0 1 0-2.8-2.8M3.5 13h14a2.8 2.8 0 1 1-2.8 2.8M3.5 17h6" />,
  waves: <path d="M3 8c2.2 0 2.2-1.6 4.5-1.6S9.8 8 12 8s2.2-1.6 4.5-1.6S18.8 8 21 8M3 13c2.2 0 2.2-1.6 4.5-1.6S9.8 13 12 13s2.2-1.6 4.5-1.6S18.8 13 21 13M3 18c2.2 0 2.2-1.6 4.5-1.6S9.8 18 12 18s2.2-1.6 4.5-1.6S18.8 18 21 18" />,
  sunrise: <path d="M3 19.5h18M7 19.5a5 5 0 0 1 10 0M12 3.5v6M9.3 6.2L12 3.5l2.7 2.7M4.6 13.6l1.4 1M19.4 13.6l-1.4 1" />,
  sunset: <path d="M3 19.5h18M7 19.5a5 5 0 0 1 10 0M12 3.5v6M9.3 6.8L12 9.5l2.7-2.7M4.6 13.6l1.4 1M19.4 13.6l-1.4 1" />,
  thermometer: <path d="M10 13.6V5a2 2 0 0 1 4 0v8.6a4 4 0 1 1-4 0zM12 9v7" />,
  umbrella: <path d="M3 12a9 9 0 0 1 18 0zM12 3v-.5M12 12v6.5a2 2 0 0 1-4 0" />,
  bulb: <path d="M9 17.5h6M10 20.5h4M12 3.5a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V17h5.2v-.7c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5z" />,
  note: <path d="M11 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V13M17.6 3.6l2.8 2.8-7.6 7.6H10v-2.8z" />,
  checklist: <path d="M10 6.5h10M10 12h10M10 17.5h10M3.8 6.5l1.3 1.3L7.5 5.4M3.8 12l1.3 1.3 2.4-2.4M3.8 17.5l1.3 1.3 2.4-2.4" />,
  appearance: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none" />
    </>
  ),
  download: <path d="M12 4v11M7.5 10.8L12 15.3l4.5-4.5M5 19.5h14" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.8" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  lifebuoy: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.8" />
      <path d="M5.6 5.6l3.7 3.7M14.7 14.7l3.7 3.7M18.4 5.6l-3.7 3.7M9.3 14.7l-3.7 3.7" />
    </>
  ),
  cash: (
    <>
      <rect x="2.5" y="6.5" width="19" height="11" rx="2.5" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  clockStart: <path d="M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17zM12 7.5V12l3 2" />,
  undo: <path d="M8 5L4 9l4 4M4.5 9H14a5.5 5.5 0 0 1 0 11h-3" />,
  code: <path d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5" />,
  send: <path d="M12 19V5.5M6 11l6-6 6 6" strokeWidth={2.2} />,
  bell: <path className="f" d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 20.5a2.2 2.2 0 0 0 4 0" />,
  camera: (
    <>
      <path className="f" d="M4.5 7.5h3l1.6-2.5h5.8l1.6 2.5h3a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V9a1.5 1.5 0 0 1 1.5-1.5z" />
      <circle cx="12" cy="13" r="3.4" />
    </>
  ),
  photo: (
    <>
      <rect className="f" x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="9.5" r="1.6" />
      <path d="M3.8 17l5-4.5 3.5 3 3-2.5 5 4.2" />
    </>
  ),
  sparkles: <path d="M10 3.5l1.6 4.4 4.4 1.6-4.4 1.6L10 15.5l-1.6-4.4L4 9.5l4.4-1.6zM17.5 14l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

type IconProps = {
  name: IconName;
  size?: number;
  filled?: boolean;
  className?: string;
  label?: string;
};

export const Icon = ({ name, size = 22, filled = false, className, label }: IconProps) => (
  <svg
    className={`icon${filled ? ' icon-filled' : ''}${className ? ` ${className}` : ''}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
  >
    {ICONS[name]}
  </svg>
);

// The app's mark: the red-and-white diver-down flag.
export const DiveFlag = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="dive-flag" style={{ clipPath: 'inset(0 round 23%)' }}>
    <rect width="64" height="64" fill="#E5484D" />
    <path d="M0 0h14l50 50v14H50L0 14z" fill="#fff" />
  </svg>
);
