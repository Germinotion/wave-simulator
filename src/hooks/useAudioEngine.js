import { useEffect, useRef, useCallback } from 'react';
import AudioEngine from '../audio/AudioEngine.js';
import useAppStore from '../stores/useAppStore.js';

/**
 * Initialises the AudioEngine singleton, syncs sources to the store.
 */
export default function useAudioEngine() {
  const engineRef = useRef(null);

  // Lazy init
  const getEngine = useCallback(async () => {
    if (!engineRef.current) {
      const engine = new AudioEngine();
      await engine.init();
      engineRef.current = engine;
    }
    return engineRef.current;
  }, []);

  // Microphone toggle
  const enableMicrophone = useCallback(async () => {
    try {
      const engine = await getEngine();
      const id = await engine.addMicrophone();
      useAppStore.getState().addSource({ type: 'mic', label: 'Microphone', engineId: id });
      useAppStore.getState().setIsListening(true);
      useAppStore.getState().setError(null);
      return id;
    } catch (err) {
      useAppStore.getState().setError(
        'Microphone access denied. Please allow microphone access.'
      );
      return null;
    }
  }, [getEngine]);

  // File source
  const addFile = useCallback(async (file) => {
    try {
      const engine = await getEngine();
      const id = await engine.addFile(file);
      useAppStore.getState().addSource({ type: 'file', label: file.name, engineId: id });
      return id;
    } catch (err) {
      useAppStore.getState().setError('Could not load audio file.');
      return null;
    }
  }, [getEngine]);

  // Tone generator
  const addTone = useCallback(async (opts) => {
    try {
      const engine = await getEngine();
      const id = await engine.addTone(opts);
      useAppStore.getState().addSource({
        type: 'tone',
        label: `${opts.waveform || 'sine'} ${opts.frequency || 440}Hz`,
        engineId: id,
        ...opts,
      });
      return id;
    } catch (err) {
      useAppStore.getState().setError('Could not start tone generator.');
      return null;
    }
  }, [getEngine]);

  // Remove source
  const removeSource = useCallback((storeSource) => {
    if (engineRef.current && storeSource.engineId != null) {
      engineRef.current.removeSource(storeSource.engineId);
    }
    useAppStore.getState().removeSource(storeSource.id);
    // If mic removed
    if (storeSource.type === 'mic') {
      const remaining = useAppStore.getState().sources.filter((s) => s.type === 'mic');
      if (remaining.length === 0) {
        useAppStore.getState().setIsListening(false);
      }
    }
  }, []);

  // Get engine ref for per-frame reads
  const getEngineRef = useCallback(() => engineRef.current, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, []);

  return { enableMicrophone, addFile, addTone, removeSource, getEngineRef };
}
