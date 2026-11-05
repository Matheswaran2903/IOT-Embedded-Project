import { useEffect, useState } from 'react';

/** Counts up every `ms` milliseconds. Used to animate simulated outputs (blinking, beeping). */
export function useTick(ms = 100) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), ms);
    return () => window.clearInterval(t);
  }, [ms]);
  return tick;
}
