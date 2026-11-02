import type { Screen } from '../lib/routes';
import { DiveFlag, Icon, type IconName } from './Icon';

const TABS: { screen: Screen; label: string; icon: IconName }[] = [
  { screen: 'today', label: 'Today', icon: 'today' },
  { screen: 'trip', label: 'Trip', icon: 'trip' },
  { screen: 'explore', label: 'Explore', icon: 'explore' },
  { screen: 'contacts', label: 'Contacts', icon: 'contacts' },
  { screen: 'you', label: 'You', icon: 'you' },
];

type TabBarProps = { active: Screen; hrefFor: (screen: Screen) => string; onSelect: (screen: Screen) => void };

export const TabBar = ({ active, hrefFor, onSelect }: TabBarProps) => (
  <nav className="tabbar" aria-label="Main">
    <div className="tab-brand"><DiveFlag size={28} />Phuket Dive Week</div>
    {TABS.map((tab) => (
      <a
        key={tab.screen}
        className="tab"
        href={hrefFor(tab.screen)}
        aria-current={active === tab.screen ? 'page' : undefined}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey) return;
          event.preventDefault();
          onSelect(tab.screen);
        }}
      >
        <Icon name={tab.icon} filled={active === tab.screen} />
        <span>{tab.label}</span>
      </a>
    ))}
  </nav>
);
