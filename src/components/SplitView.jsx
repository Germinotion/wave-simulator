import React, { useRef, useCallback, useEffect } from 'react';
import SceneManager from '../three/SceneManager.js';
import useAppStore from '../stores/useAppStore.js';
import useAnimationLoop from '../hooks/useAnimationLoop.js';
import EducationalOverlay from './overlays/EducationalOverlay.jsx';

/**
 * 2-panel split view for comparing sounds side by side.
 * Each panel gets its own canvas at pixelRatio 1 for performance.
 * Panels default to combined audio and can be filtered to a single source.
 */
export default function SplitView({ getEngineRef }) {
  const refA = useRef(null);
  const refB = useRef(null);
  const scenesRef = useRef({ a: null, b: null });

  // Init / destroy SceneManagers
  useEffect(() => {
    const els = { a: refA.current, b: refB.current };
    if (!els.a || !els.b) return;

    const opts = { pixelRatio: 1 };
    scenesRef.current.a = new SceneManager(els.a, opts);
    scenesRef.current.b = new SceneManager(els.b, opts);

    const handleResize = () => {
      scenesRef.current.a?.resize();
      scenesRef.current.b?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scenesRef.current.a?.dispose();
      scenesRef.current.b?.dispose();
      scenesRef.current = { a: null, b: null };
    };
  }, []);

  useAnimationLoop((delta) => {
    const { mode, colorScheme, isPaused, timeScale, splitAssignment, sources } =
      useAppStore.getState();
    const scenes = scenesRef.current;
    const engine = getEngineRef();

    for (const key of ['a', 'b']) {
      const sm = scenes[key];
      if (!sm) continue;

      if (sm.currentMode !== mode) sm.setMode(mode);
      if (sm.currentScheme !== colorScheme) sm.setColorScheme(colorScheme);

      let audioData = { amplitude: 0, bass: 0, mid: 0, treble: 0, waveform: null };

      if (engine) {
        const assignedId = splitAssignment[key];
        const storeSource = sources.find((s) => s.id === assignedId);
        if (storeSource?.engineId) {
          audioData = engine.getSourceData(storeSource.engineId) || audioData;
        } else {
          // Default to combined audio so the panel is always active
          audioData = engine.getCombinedData();
        }
      }

      sm.update(delta, audioData, isPaused, timeScale);
    }
  });

  const sources = useAppStore((s) => s.sources);
  const splitAssignment = useAppStore((s) => s.splitAssignment);
  const setSplitAssignment = useAppStore((s) => s.setSplitAssignment);

  return (
    <div className="w-full h-full grid grid-cols-2 gap-1 bg-black">
      {['a', 'b'].map((slot) => (
        <div key={slot} className="relative">
          {/* Source selector */}
          <div className="absolute top-2 left-2 z-10 pointer-events-auto">
            <select
              value={splitAssignment[slot] ?? ''}
              onChange={(e) =>
                setSplitAssignment(slot, e.target.value ? Number(e.target.value) : null)
              }
              className="bg-black/70 text-white text-xs rounded px-2 py-1 border border-white/20 backdrop-blur-sm"
              aria-label={`Source ${slot.toUpperCase()}`}
            >
              <option value="">All (combined)</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div ref={slot === 'a' ? refA : refB} className="w-full h-full cursor-crosshair" />
          <EducationalOverlay />
        </div>
      ))}
    </div>
  );
}
