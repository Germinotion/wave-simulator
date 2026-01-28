import { useEffect, useRef, useCallback } from 'react';
import SceneManager from '../three/SceneManager.js';
import useAppStore from '../stores/useAppStore.js';
import useAnimationLoop from './useAnimationLoop.js';

/**
 * Connects the Zustand store and the AudioEngine to a SceneManager instance.
 * @param {React.RefObject<HTMLElement>} containerRef
 * @param {Function} getEngineRef - returns AudioEngine or null
 * @param {Object} opts - { pixelRatio }
 */
export default function useVisualization(containerRef, getEngineRef, opts = {}) {
  const sceneRef = useRef(null);

  // Initialise SceneManager when container mounts
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const sm = new SceneManager(el, opts);
    sceneRef.current = sm;

    const handleResize = () => sm.resize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      sm.setMouse(x, y);
    };

    const handleClick = (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      sm.addRipple(x, y, sm.time);
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('click', handleClick);
      sm.dispose();
      sceneRef.current = null;
    };
  }, [containerRef, opts]);

  // Animation loop — reads store imperatively, feeds SceneManager
  useAnimationLoop((delta, _time) => {
    const sm = sceneRef.current;
    if (!sm) return;

    const { mode, colorScheme, isPaused, timeScale } = useAppStore.getState();

    // Apply mode & color if changed
    if (sm.currentMode !== mode) sm.setMode(mode);
    if (sm.currentScheme !== colorScheme) sm.setColorScheme(colorScheme);

    // Audio data
    const engine = getEngineRef();
    let audioData = { amplitude: 0, bass: 0, mid: 0, treble: 0, waveform: null };
    if (engine) {
      audioData = engine.getCombinedData();
    }

    sm.update(delta, audioData, isPaused, timeScale);
  });

  return sceneRef;
}
