import { createContext, useContext } from 'react';
import type { DayId } from '../data/types';
import type { Connection } from '../lib/llm';
import type { Profile } from '../lib/profile';
import { Avatar } from './ui';

export type AppActions = {
  name: string;
  photo: string | null;
  profile: Profile;
  connection: Connection | null;
  openYou: () => void;
  openShare: (days?: DayId[]) => void;
  openNewDay: () => void;
  openAi: () => void;
  openProfile: () => void;
};

export const AppContext = createContext<AppActions | null>(null);

export const useApp = (): AppActions => {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppContext');
  return value;
};

// Avatar in each screen's header; opens the You screen.
export const ProfileButton = () => {
  const { name, photo, openYou } = useApp();
  return (
    <button className="icon-btn plain profile-btn" type="button" aria-label="Open your profile and settings" onClick={openYou}>
      <Avatar name={name} photo={photo} size={36} />
    </button>
  );
};
