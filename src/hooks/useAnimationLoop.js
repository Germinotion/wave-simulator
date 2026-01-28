import { useEffect, useRef } from 'react';
import useAppStore from '../stores/useAppStore.js';

/**
 * Shared requestAnimationFrame loop.
 * @param {(delta: number, time: number) => void} callback - called every frame
 */
export default function useAnimationLoop(callback) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  const frameRef = useRef(null);
  const prevTimeRef = useRef(null);

  useEffect(() => {
    const tick = (timestamp) => {
      frameRef.current = requestAnimationFrame(tick);

      if (prevTimeRef.current === null) {
        prevTimeRef.current = timestamp;
        return;
      }

      const rawDelta = (timestamp - prevTimeRef.current) / 1000;
      prevTimeRef.current = timestamp;

      // Cap delta to prevent huge jumps after tab-switch
      const delta = Math.min(rawDelta, 0.1);

      const { isPaused, timeScale, currentTime, setCurrentTime } = useAppStore.getState();

      const scaledDelta = isPaused ? 0 : delta * timeScale;
      const newTime = currentTime + scaledDelta;
      setCurrentTime(newTime);

      cbRef.current(scaledDelta, newTime);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);
}
