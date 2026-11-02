import { useCallback, useEffect, useState } from 'react';
import type { TabId } from '../data/types';
import { isTabId } from '../lib/prefs';

const tabFromHash = (): TabId | null => {
  const id = window.location.hash.replace(/^#\/?/, '');
  return isTabId(id) ? id : null;
};

// The active tab lives in the URL hash (#tue3, #contacts) so links can be
// shared and the browser back button moves between tabs.
export const useHashTab = (initial: TabId) => {
  const [tab, setTab] = useState<TabId>(() => tabFromHash() ?? initial);

  useEffect(() => {
    if (!tabFromHash()) window.history.replaceState(null, '', `#${tab}`);
    const onHash = () => {
      const next = tabFromHash();
      if (next) setTab(next);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
    // Runs once; later changes go through select().
  }, []);

  const select = useCallback((next: TabId) => {
    if (tabFromHash() !== next) window.location.hash = next;
    setTab(next);
  }, []);

  return [tab, select] as const;
};
