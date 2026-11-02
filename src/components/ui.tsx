import { useEffect, useRef, useState, type ReactNode } from 'react';
import { initialsOf } from '../lib/prefs';
import { Icon, type IconName } from './Icon';

type AvatarProps = { name: string; size?: number; soft?: boolean };

export const Avatar = ({ name, size = 36, soft = false }: AvatarProps) => {
  const initials = initialsOf(name);
  const className = `avatar${initials ? (soft ? ' soft' : '') : ' empty'}`;
  return (
    <span className={className} style={{ width: size, height: size, fontSize: size * 0.4 }} aria-hidden="true">
      {initials || <Icon name="you" size={size * 0.62} />}
    </span>
  );
};

type RingProps = { value: number; total: number; size?: number };

export const ProgressRing = ({ value, total, size = 28 }: RingProps) => {
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const length = 2 * Math.PI * radius;
  const ratio = total ? Math.min(1, value / total) : 0;
  return (
    <svg className={`ring${ratio === 1 ? ' done' : ''}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle className="track" cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} />
      <circle
        className="bar"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - ratio)}
      />
    </svg>
  );
};

type SegmentedProps<T extends string> = { name: string; label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void };

export const Segmented = <T extends string>({ name, label, value, options, onChange }: SegmentedProps<T>) => (
  <div className="segmented" role="radiogroup" aria-label={label}>
    {options.map((option) => (
      <label key={option.value}>
        <input type="radio" name={name} checked={value === option.value} onChange={() => onChange(option.value)} />
        <span>{option.label}</span>
      </label>
    ))}
  </div>
);

type EmptyStateProps = { icon: IconName; title: string; text: string; action?: ReactNode; compact?: boolean };

export const EmptyState = ({ icon, title, text, action, compact = false }: EmptyStateProps) => (
  <div className={`empty${compact ? ' compact' : ''}`}>
    <span className="empty-icon"><Icon name={icon} /></span>
    <p className="t-headline">{title}</p>
    <p className="t-foot">{text}</p>
    {action}
  </div>
);

type ScreenHeaderProps = { title: string; eyebrow?: ReactNode; actions?: ReactNode };

// Large title that hands over to a compact blurred bar once scrolled past.
export const ScreenHeader = ({ title, eyebrow, actions }: ScreenHeaderProps) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setCompact(!!entry && !entry.isIntersecting), { rootMargin: '-44px 0px 0px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className={`navbar${compact ? ' show' : ''}`} aria-hidden="true">{title}</div>
      <header className="screen-head">
        {eyebrow && <p className="t-eyebrow">{eyebrow}</p>}
        <div className="screen-head-row">
          <h1 ref={ref} className="t-large">{title}</h1>
          {actions && <div className="head-actions">{actions}</div>}
        </div>
      </header>
    </>
  );
};

type SectionProps = { title?: string; trailing?: ReactNode; footer?: ReactNode; children: ReactNode; id?: string };

export const Section = ({ title, trailing, footer, children, id }: SectionProps) => (
  <section className="section" aria-labelledby={title && id ? id : undefined}>
    {(title || trailing) && (
      <div className="section-head">
        {title && <h2 id={id} className="t-section">{title}</h2>}
        {trailing}
      </div>
    )}
    {children}
    {footer && <div className="section-foot t-foot">{footer}</div>}
  </section>
);
