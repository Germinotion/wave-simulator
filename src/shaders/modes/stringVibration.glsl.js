// String vibration mode uses 'line' geometry — vertex shader for a LineGeometry
export const stringVibrationVert = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uFrequency;
  uniform float uBass;
  uniform float uMid;
  uniform float uTreble;
  uniform float uBeat;

  varying float vElevation;
  varying float vPosition_x;

  void main() {
    vPosition_x = position.x;
    float x = position.x;
    float L = 200.0; // string length
    float normalized = (x + L * 0.5) / L; // 0..1
    float t = uTime;

    // Standing wave: sum of harmonics
    float amp = 10.0 + uAmplitude * 30.0;
    float y = 0.0;

    // Fundamental
    y += sin(3.14159 * normalized) * sin(t * 3.0) * amp;
    // 2nd harmonic
    y += sin(2.0 * 3.14159 * normalized) * sin(t * 6.0) * amp * uMid * 0.6;
    // 3rd harmonic
    y += sin(3.0 * 3.14159 * normalized) * sin(t * 9.0) * amp * uTreble * 0.4;
    // 4th harmonic
    y += sin(4.0 * 3.14159 * normalized) * sin(t * 12.0) * amp * uBass * 0.3;

    // Beat pulse
    y += sin(3.14159 * normalized) * uBeat * 8.0;

    // Nodes at the ends (already guaranteed by sin(pi*x/L))
    vec3 pos = vec3(position.x, y, 0.0);
    vElevation = y;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const stringVibrationFrag = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uAmplitude;
  uniform float uBeat;

  varying float vElevation;
  varying float vPosition_x;

  void main() {
    float normalizedElev = abs(vElevation) / 40.0;
    normalizedElev = clamp(normalizedElev, 0.0, 1.0);

    vec3 color = mix(uColorA, uColorC, normalizedElev);
    color += uBeat * 0.2 * uColorB;

    // Glow at antinodes (high displacement)
    float glow = smoothstep(0.3, 0.8, normalizedElev) * 0.5;
    color += vec3(glow);

    gl_FragColor = vec4(color, 0.8 + normalizedElev * 0.2);
  }
`;
