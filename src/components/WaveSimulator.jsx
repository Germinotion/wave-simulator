import React, { lazy, Suspense, useCallback, useMemo } from 'react';
import useAppStore from '../stores/useAppStore.js';
import useAudioEngine from '../hooks/useAudioEngine.js';

import VisualizationPanel from './VisualizationPanel.jsx';
import SplitView from './SplitView.jsx';

import ModeSelector from './controls/ModeSelector.jsx';
import ColorSchemeSelector from './controls/ColorSchemeSelector.jsx';
import AudioSourcePanel from './controls/AudioSourcePanel.jsx';
import ToneGeneratorPanel from './controls/ToneGeneratorPanel.jsx';
import TransportControls from './controls/TransportControls.jsx';
import PresetsPanel from './controls/PresetsPanel.jsx';
import Toolbar from './controls/Toolbar.jsx';

import InfoPanel from './overlays/InfoPanel.jsx';
import OnboardingTour from './overlays/OnboardingTour.jsx';

import Panel from './ui/Panel.jsx';
import FileDropZone from './ui/FileDropZone.jsx';

const HarmonicsDecomposition = lazy(() =>
  import('./overlays/HarmonicsDecomposition.jsx')
);

export default function WaveSimulator() {
  const viewMode = useAppStore((s) => s.viewMode);
  const error = useAppStore((s) => s.error);
  const showHarmonics = useAppStore((s) => s.showHarmonics);

  const { enableMicrophone, addFile, addTone, removeSource, getEngineRef } = useAudioEngine();

  const handleFileDrop = useCallback((file) => addFile(file), [addFile]);

  const handleReset = useCallback(() => {
    // Dispose all engine sources
    const engine = getEngineRef();
    if (engine) {
      const sources = useAppStore.getState().sources;
      sources.forEach((s) => removeSource(s));
    }
    useAppStore.getState().reset();
  }, [getEngineRef, removeSource]);

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden flex">
      {/* Left sidebar */}
      <div className="w-72 flex-shrink-0 h-full overflow-y-auto p-3 space-y-3 z-20
                      bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-md border-r border-white/5">
        {/* Title */}
        <div className="text-center pt-2 pb-1">
          <h1
            className="text-2xl font-black text-white tracking-widest"
            style={{
              textShadow: '0 0 30px rgba(0, 200, 255, 0.9), 0 0 60px rgba(255, 0, 100, 0.5)',
              letterSpacing: '0.3em',
            }}
          >
            AUDIO WAVE
          </h1>
          <p className="text-cyan-300 text-[10px] opacity-80 tracking-wider mt-1">
            EDUCATIONAL SOUND VISUALIZATION
          </p>
        </div>

        {/* Mode selector */}
        <ModeSelector />

        {/* Color scheme selector */}
        <ColorSchemeSelector />

        {/* Toolbar row */}
        <Toolbar onReset={handleReset} />

        {/* Transport */}
        <Panel title="Transport" defaultOpen={true}>
          <TransportControls />
        </Panel>

        {/* Audio Sources */}
        <Panel title="Audio Sources" defaultOpen={true}>
          <AudioSourcePanel
            enableMicrophone={enableMicrophone}
            removeSource={removeSource}
          />
          <FileDropZone isDragging={false} onFileSelect={handleFileDrop}>
            <p className="text-gray-500 text-[10px]">Drop audio file or click to browse</p>
          </FileDropZone>
        </Panel>

        {/* Tone Generator */}
        <Panel title="Tone Generator" defaultOpen={false}>
          <ToneGeneratorPanel addTone={addTone} />
        </Panel>

        {/* Presets */}
        <Panel title="Preset Sounds" defaultOpen={false}>
          <PresetsPanel addTone={addTone} />
        </Panel>

        {/* Harmonics */}
        {showHarmonics && (
          <Panel title="Harmonics Decomposition" defaultOpen={true}>
            <Suspense fallback={<div className="text-gray-500 text-xs p-2">Loading...</div>}>
              <HarmonicsDecomposition />
            </Suspense>
          </Panel>
        )}

        {/* Info */}
        <InfoPanel />

        <div className="text-[10px] text-gray-600 pt-2 pb-4">
          <p>Move mouse to influence waves</p>
          <p>Click anywhere for ripples</p>
        </div>
      </div>

      {/* Main visualization area */}
      <div className="flex-1 relative">
        {/* Viewport */}
        {viewMode === 'single' ? (
          <VisualizationPanel
            getEngineRef={getEngineRef}
            onFileDrop={handleFileDrop}
          />
        ) : (
          <SplitView getEngineRef={getEngineRef} />
        )}

        {/* Error */}
        {error && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20
                          px-6 py-3 bg-red-500/20 border border-red-400/50 rounded-lg backdrop-blur-sm">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Onboarding overlay */}
      <OnboardingTour />
    </div>
  );
}
