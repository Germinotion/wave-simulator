import React, { useRef, useCallback, useEffect } from 'react';
import SceneManager from '../three/SceneManager.js';
import useAppStore from '../stores/useAppStore.js';
import useAnimationLoop from '../hooks/useAnimationLoop.js';
import EducationalOverlay from './overlays/EducationalOverlay.jsx';

/**
 * 3-column split view: Source A | Source B | Combined (A+B).
 * Each panel gets its own canvas at pixelRatio 1 for performance.
 */
export default function SplitView({ getEngineRef }) {
  const refA = useRef(null);
  const refB = useRef(null);
  const refC = useRef(null);
  const scenesRef = useRef({ a: null, b: null, c: null });

  // Init / destroy SceneManagers
  useEffect(() => {
    const els = { a: refA.current, b: refB.current, c: refC.current };
    if (!els.a || !els.b || !els.c) return;

    const opts = { pixelRatio: 1 };
    scenesRef.current.a = new SceneManager(els.a, opts);
    scenesRef.current.b = new SceneManager(els.b, opts);
    scenesRef.current.c = new SceneManager(els.c, opts);

    const handleResize = () => {
      scenesRef.current.a?.resize();
      scenesRef.current.b?.resize();
      scenesRef.current.c?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scenesRef.current.a?.dispose();
      scenesRef.current.b?.dispose();
      scenesRef.current.c?.dispose();
      scenesRef.current = { a: null, b: null, c: null };
    };
  }, []);

  useAnimationLoop((delta) => {
    const { mode, colorScheme, isPaused, timeScale, splitAssignment, sources } =
      useAppStore.getState();
    const scenes = scenesRef.current;
    const engine = getEngineRef();

    for (const key of ['a', 'b', 'c']) {
      const sm = scenes[key];
      if (!sm) continue;

      if (sm.currentMode !== mode) sm.setMode(mode);
      if (sm.currentScheme !== colorScheme) sm.setColorScheme(colorScheme);

      let audioData = { amplitude: 0, bass: 0, mid: 0, treble: 0, waveform: null };

      if (engine) {
        if (key === 'c') {
          // Combined
          audioData = engine.getCombinedData();
        } else {
          // Per-source
          const assignedId = splitAssignment[key];
          const storeSource = sources.find((s) => s.id === assignedId);
          if (storeSource?.engineId) {
            audioData = engine.getSourceData(storeSource.engineId) || audioData;
          }
        }
      }

      sm.update(delta, audioData, isPaused, timeScale);
    }
  });

  const sources = useAppStore((s) => s.sources);
  const splitAssignment = useAppStore((s) => s.splitAssignment);
  const setSplitAssignment = useAppStore((s) => s.setSplitAssignment);

  return (
    <div className="w-full h-full grid grid-cols-3 gap-1 bg-black">
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
              <option value="">None</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div ref={slot === 'a' ? refA : refB} className="w-full h-full cursor-crosshair" />
          <div className="absolute bottom-2 left-2 text-xs text-white/40 pointer-events-none">
            Source {slot.toUpperCase()}
          </div>
        </div>
      ))}

      {/* Combined panel */}
      <div className="relative">
        <div ref={refC} className="w-full h-full cursor-crosshair" />
        <div className="absolute bottom-2 left-2 text-xs text-cyan-400/60 pointer-events-none font-bold">
          A + B Combined
        </div>
        <EducationalOverlay />
      </div>
    </div>
  );
}
