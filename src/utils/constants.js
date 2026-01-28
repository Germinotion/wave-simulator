export const COLOR_SCHEMES = [
  { a: 0x0066ff, b: 0x00ffcc, c: 0xff0066, name: 'Neon Dreams' },
  { a: 0xff6600, b: 0xffcc00, c: 0xff0044, name: 'Solar Flare' },
  { a: 0x9900ff, b: 0x00ffff, c: 0xff00ff, name: 'Cyberpunk' },
  { a: 0x00ff88, b: 0x00ffcc, c: 0x88ff00, name: 'Matrix' },
  { a: 0xff0055, b: 0xff8800, c: 0xffff00, name: 'Inferno' },
];

export const MODES = {
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    icon: '~',
    geometry: 'plane',
    description: 'Flowing waves driven by layered noise',
    teaches: 'Wave motion and fluid dynamics',
  },
  vortex: {
    id: 'vortex',
    label: 'Vortex',
    icon: '@',
    geometry: 'plane',
    description: 'Spinning spiral pattern',
    teaches: 'Rotational wave patterns',
  },
  mountain: {
    id: 'mountain',
    label: 'Mountain',
    icon: '^',
    geometry: 'plane',
    description: 'Terrain-like landscape formations',
    teaches: 'Noise-based terrain generation',
  },
  pureSine: {
    id: 'pureSine',
    label: 'Pure Sine',
    icon: 'S',
    geometry: 'plane',
    description: 'Clean sine wave oscillation',
    teaches: 'Fundamental oscillation — the building block of all sound',
  },
  fire: {
    id: 'fire',
    label: 'Fire',
    icon: 'F',
    geometry: 'plane',
    description: 'Turbulent flames driven by amplitude',
    teaches: 'Energy and amplitude relationship',
  },
  explosion: {
    id: 'explosion',
    label: 'Explosion',
    icon: '*',
    geometry: 'plane',
    description: 'Radial shockwave propagation',
    teaches: 'How sound propagates through space',
  },
  ripplePool: {
    id: 'ripplePool',
    label: 'Ripple Pool',
    icon: 'O',
    geometry: 'plane',
    description: 'Concentric rings with interference',
    teaches: 'Interference patterns — constructive and destructive',
  },
  stringVibration: {
    id: 'stringVibration',
    label: 'String',
    icon: '|',
    geometry: 'line',
    description: 'Standing waves on a vibrating string',
    teaches: 'Harmonics, standing waves, and nodes',
  },
  cymatics: {
    id: 'cymatics',
    label: 'Cymatics',
    icon: '#',
    geometry: 'plane',
    description: '2D Chladni plate patterns',
    teaches: 'Frequency determines the shape of vibrating surfaces',
  },
  spectrumBars: {
    id: 'spectrumBars',
    label: 'Spectrum',
    icon: 'B',
    geometry: 'bars',
    description: 'Frequency histogram bars',
    teaches: 'What frequencies are present in a sound',
  },
};

export const MODE_LIST = Object.values(MODES);

export const PRESETS = [
  { name: 'Drum Beat', waveform: 'square', frequency: 80, amplitude: 0.8 },
  { name: 'Singing Voice', waveform: 'sine', frequency: 300, amplitude: 0.6 },
  { name: 'Piano Note', waveform: 'sine', frequency: 440, amplitude: 0.5 },
  { name: 'Whistle', waveform: 'sine', frequency: 1200, amplitude: 0.4 },
  { name: 'Bass Guitar', waveform: 'sawtooth', frequency: 100, amplitude: 0.7 },
  { name: 'Buzz', waveform: 'sawtooth', frequency: 220, amplitude: 0.5 },
  { name: 'Organ', waveform: 'square', frequency: 440, amplitude: 0.4 },
  { name: 'Flute-like', waveform: 'triangle', frequency: 600, amplitude: 0.5 },
];

export const CAMERA_PRESETS = {
  ocean:            { radius: 100, height: 50, speed: 0.05, fov: 60 },
  vortex:           { radius: 100, height: 50, speed: 0.05, fov: 60 },
  mountain:         { radius: 100, height: 50, speed: 0.05, fov: 60 },
  pureSine:         { radius: 120, height: 60, speed: 0.03, fov: 55 },
  fire:             { radius: 100, height: 50, speed: 0.05, fov: 60 },
  explosion:        { radius: 130, height: 70, speed: 0.02, fov: 65 },
  ripplePool:       { radius: 120, height: 80, speed: 0.02, fov: 60 },
  stringVibration:  { radius: 80,  height: 30, speed: 0.01, fov: 50 },
  cymatics:         { radius: 130, height: 90, speed: 0.02, fov: 60 },
  spectrumBars:     { radius: 100, height: 50, speed: 0.03, fov: 55 },
};

export const ONBOARDING_STEPS = [
  {
    target: 'mode-selector',
    title: 'Pick a Visualization',
    text: 'Choose how your sound looks! Each mode shows sound waves in a different way.',
  },
  {
    target: 'color-selector',
    title: 'Choose Colors',
    text: 'Pick a color palette that you like.',
  },
  {
    target: 'mic-button',
    title: 'Turn On Your Microphone',
    text: 'Let the app hear you! Clap, sing, or play music to see the waves move.',
  },
  {
    target: 'source-panel',
    title: 'Add Sound Sources',
    text: 'Use the tone generator to create pure sounds, or drag an audio file to play it.',
  },
  {
    target: 'transport',
    title: 'Pause & Slow Down',
    text: 'Freeze the visualization to study it, or slow it down to see details.',
  },
  {
    target: 'split-view',
    title: 'Compare Sounds',
    text: 'See two sounds side-by-side and watch what happens when they combine!',
  },
];
