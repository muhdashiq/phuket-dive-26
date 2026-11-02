import { useEffect, useRef, useState } from 'react';

const THRESHOLD = 70;
const MAX_PULL = 110;

// Touch pull-down at the top of the page triggers onRefresh.
export const usePullToRefresh = (onRefresh: () => Promise<unknown>, enabled = true) => {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const start = useRef<number | null>(null);
  const pullRef = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const onStart = (event: TouchEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (busy.current || window.scrollY > 0 || event.touches.length !== 1 || target?.closest('textarea, input, dialog, .onboarding')) {
        start.current = null;
        return;
      }
      start.current = event.touches[0]?.clientY ?? null;
    };
    const onMove = (event: TouchEvent) => {
      if (start.current === null) return;
      const dy = (event.touches[0]?.clientY ?? 0) - start.current;
      if (dy <= 0 || window.scrollY > 0) {
        if (pullRef.current) setPull((pullRef.current = 0));
        return;
      }
      const eased = Math.min(MAX_PULL, dy * 0.5);
      pullRef.current = eased;
      setPull(eased);
    };
    const onEnd = () => {
      if (start.current === null) return;
      start.current = null;
      const reached = pullRef.current >= THRESHOLD;
      pullRef.current = 0;
      if (!reached) {
        setPull(0);
        return;
      }
      busy.current = true;
      setRefreshing(true);
      setPull(48);
      onRefresh().finally(() => {
        busy.current = false;
        setRefreshing(false);
        setPull(0);
      });
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [enabled, onRefresh]);

  return { pull, refreshing, progress: Math.min(1, pull / THRESHOLD) };
};
