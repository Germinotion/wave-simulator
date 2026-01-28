// Waveform scope — classic oscilloscope view using 'line' geometry
export const waveformScopeVert = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uBass;
  uniform float uMid;
  uniform float uTreble;
  uniform float uBeat;
  uniform sampler2D uWaveformTex;

  varying float vElevation;
  varying float vPosition_x;

  void main() {
    float x = position.x;
    float L = 200.0;
    float normalized = (x + L * 0.5) / L; // 0..1
    vPosition_x = x;

    // Sample waveform data from texture
    float sample = texture2D(uWaveformTex, vec2(normalized, 0.5)).r;
    // Texture stores (value + 1) / 2 to map [-1,1] to [0,1]; decode it
    sample = sample * 2.0 - 1.0;

    // Idle sine wave when no audio is playing
    float idle = sin(normalized * 12.56 + uTime * 2.0) * (8.0 + sin(uTime * 0.5) * 3.0);
    float audioY = sample * (15.0 + uAmplitude * 30.0);
    float blend = smoothstep(0.0, 0.15, uAmplitude);
    float y = mix(idle, audioY, blend);

    // Beat bump
    y += uBeat * 5.0 * sin(normalized * 6.28);

    vec3 pos = vec3(x, y, 0.0);
    vElevation = y;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const waveformScopeFrag = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uAmplitude;
  uniform float uBeat;

  varying float vElevation;
  varying float vPosition_x;

  void main() {
    float normalizedElev = (vElevation + 30.0) / 60.0;
    normalizedElev = clamp(normalizedElev, 0.0, 1.0);

    vec3 color = mix(uColorA * 0.7, uColorC, normalizedElev);
    color += uBeat * 0.15 * uColorB;

    // Phosphor glow effect — always visible baseline
    float glow = 0.5 + uAmplitude * 0.4;
    color += vec3(0.0, glow * 0.3, glow * 0.2);

    gl_FragColor = vec4(color, 0.9);
  }
`;
