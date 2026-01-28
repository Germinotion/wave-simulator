// Spectrum bars — instanced box geometry, vertex shader scales Y per instance
export const spectrumBarsVert = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uBass;
  uniform float uMid;
  uniform float uTreble;
  uniform float uBeat;
  uniform float uWaveformData[256];

  attribute float instanceIndex;

  varying float vBarHeight;
  varying float vBarIndex;

  void main() {
    float idx = instanceIndex;
    int dataIdx = int(idx);
    float sample = uWaveformData[dataIdx];
    vBarIndex = idx / 64.0;

    float barHeight = sample * (20.0 + uAmplitude * 40.0);
    barHeight = max(barHeight, 0.5); // minimum visible height
    vBarHeight = barHeight;

    vec3 pos = position;
    pos.y *= barHeight;
    pos.y += barHeight * 0.5; // offset so bars grow from ground

    // Beat bounce
    pos.y += uBeat * 3.0 * sample;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const spectrumBarsFrag = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uAmplitude;
  uniform float uBeat;

  varying float vBarHeight;
  varying float vBarIndex;

  void main() {
    // Color gradient based on frequency bin
    vec3 color;
    if (vBarIndex < 0.33) {
      color = mix(uColorA, uColorB, vBarIndex * 3.0);
    } else if (vBarIndex < 0.66) {
      color = mix(uColorB, uColorC, (vBarIndex - 0.33) * 3.0);
    } else {
      color = mix(uColorC, uColorA * 0.5 + uColorC * 0.5, (vBarIndex - 0.66) * 3.0);
    }

    // Brightness based on bar height
    float brightness = 0.4 + vBarHeight / 60.0 * 0.6;
    color *= brightness;

    // Beat flash
    color += vec3(uBeat * 0.2);

    gl_FragColor = vec4(color, 0.9);
  }
`;
