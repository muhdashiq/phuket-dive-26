import { useCallback, useEffect, useState } from 'react';
import { parseHash, toHash, type Route } from '../lib/routes';

// The current screen lives in the URL hash so links can be shared and the
// browser's back button moves between screens and days.
export const useRoute = (initial: Route) => {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash) ?? initial);

  useEffect(() => {
    const canonical = toHash(route);
    if (window.location.hash !== canonical) window.history.replaceState(null, '', canonical);
    const onHash = () => {
      const next = parseHash(window.location.hash);
      if (next) setRoute(next);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
    // Runs once; later changes go through navigate().
  }, []);

  const navigate = useCallback((next: Route, options: { replace?: boolean } = {}) => {
    const hash = toHash(next);
    if (window.location.hash !== hash) {
      if (options.replace) window.history.replaceState(null, '', hash);
      else window.history.pushState(null, '', hash);
    }
    setRoute(next);
  }, []);

  return [route, navigate] as const;
};
