import React, { useState } from 'react';
import Slider from '../ui/Slider.jsx';
import BigButton from '../ui/BigButton.jsx';
import Tooltip from '../ui/Tooltip.jsx';

const WAVEFORMS = ['sine', 'square', 'sawtooth', 'triangle'];

const WAVEFORM_DESCRIPTIONS = {
  sine: 'Smooth, pure tone',
  square: 'Hollow, buzzy tone',
  sawtooth: 'Bright, harsh tone',
  triangle: 'Soft, mellow tone',
};

export default function ToneGeneratorPanel({ addTone }) {
  const [waveform, setWaveform] = useState('sine');
  const [frequency, setFrequency] = useState(440);
  const [amplitude, setAmplitude] = useState(0.5);

  const handleAdd = () => {
    addTone({ waveform, frequency, amplitude });
  };

  return (
    <div className="space-y-3">
      {/* Waveform type */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Waveform</p>
        <div className="flex gap-1.5">
          {WAVEFORMS.map((w) => (
            <Tooltip key={w} text={WAVEFORM_DESCRIPTIONS[w]}>
              <button
                onClick={() => setWaveform(w)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all min-h-[40px]
                  ${waveform === w
                    ? 'bg-cyan-500 text-black'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                aria-label={`${w} waveform`}
              >
                {w.slice(0, 3)}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Frequency slider */}
      <Slider
        label="Frequency"
        value={frequency}
        min={20}
        max={2000}
        step={1}
        onChange={setFrequency}
        unit="Hz"
      />

      {/* Amplitude slider */}
      <Slider
        label="Amplitude"
        value={amplitude}
        min={0}
        max={1}
        step={0.01}
        onChange={setAmplitude}
      />

      <Tooltip text="Add this tone as a sound source">
        <BigButton onClick={handleAdd} variant="secondary" className="w-full py-3" ariaLabel="Add tone">
          <span className="text-sm tracking-wider">+ ADD TONE</span>
        </BigButton>
      </Tooltip>
    </div>
  );
}
