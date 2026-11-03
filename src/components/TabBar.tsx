import type { Screen } from '../lib/routes';
import { useApp } from './AppContext';
import { DiveFlag, Icon, type IconName } from './Icon';
import { Avatar } from './ui';

// Five tabs on phones; You opens from the avatar on every screen, and from
// the profile row at the bottom of the sidebar on wide screens.
const TABS: { screen: Screen; label: string; icon: IconName }[] = [
  { screen: 'today', label: 'Today', icon: 'today' },
  { screen: 'trip', label: 'Trip', icon: 'trip' },
  { screen: 'chat', label: 'Chat', icon: 'message' },
  { screen: 'explore', label: 'Explore', icon: 'explore' },
  { screen: 'contacts', label: 'Contacts', icon: 'contacts' },
];

type TabBarProps = { active: Screen; hrefFor: (screen: Screen) => string; onSelect: (screen: Screen) => void };

export const TabBar = ({ active, hrefFor, onSelect }: TabBarProps) => {
  const { name, photo } = useApp();
  return (
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
    <a
      className="tab tab-you"
      href={hrefFor('you')}
      aria-current={active === 'you' ? 'page' : undefined}
      onClick={(event) => {
        event.preventDefault();
        onSelect('you');
      }}
    >
      <Avatar name={name} photo={photo} size={28} />
      <span>{name || 'You'}</span>
    </a>
  </nav>
  );
};
