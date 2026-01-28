import { noiseGLSL } from './noise.glsl.js';

export const basePlaneVertPreamble = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uFrequency;
  uniform float uBass;
  uniform float uMid;
  uniform float uTreble;
  uniform float uBeat;
  uniform vec2 uMouse;
  uniform vec4 uRipples[5];
  uniform float uMode;
  uniform float uWaveformData[256];

  varying vec2 vUv;
  varying float vElevation;
  varying float vDistanceFromCenter;
  varying vec3 vNormal;
  varying vec3 vPosition;

  ${noiseGLSL}
`;

// Shared audio-reactive code added to all plane modes after mode-specific elevation
export const basePlaneVertAudio = /* glsl */ `
  // Bass creates massive swells
  float bassWave = sin(pos.x * 0.015 + t * 0.5) * sin(pos.z * 0.015 + t * 0.3);
  bassWave *= uBass * 25.0;

  // Mid frequencies add detail
  float midWave = snoise(vec3(pos.x * 0.04 + t, pos.z * 0.04, t * 0.3)) * uMid * 15.0;

  // Treble creates fine ripples
  float trebleWave = snoise(vec3(pos.x * 0.15 + t * 2.5, pos.z * 0.15 + t * 2.0, t)) * uTreble * 8.0;

  // Beat pulse - ripple from center
  float beatPulse = sin(distFromCenter * 15.0 - uBeat * 10.0) * uBeat * 10.0 * (1.0 - distFromCenter);

  // Click ripples
  float rippleEffect = 0.0;
  for (int i = 0; i < 5; i++) {
    vec4 ripple = uRipples[i];
    if (ripple.w > 0.0) {
      float dist = distance(pos.xz, ripple.xy);
      float age = (uTime - ripple.z) * 3.0;
      float rippleWave = sin(dist * 0.5 - age * 5.0) * exp(-age * 0.5) * exp(-dist * 0.02);
      rippleEffect += rippleWave * ripple.w * 15.0;
    }
  }

  // Mouse interaction
  float mouseDist = distance(pos.xz, uMouse * 100.0);
  float mouseInfluence = exp(-mouseDist * 0.02) * 5.0 * (1.0 + uAmplitude);

  pos.y = elevation + bassWave + midWave + trebleWave + beatPulse + rippleEffect + mouseInfluence;

  // Edge fade
  float edgeFade = 1.0 - smoothstep(0.7, 1.0, distFromCenter);
  pos.y *= edgeFade;

  vElevation = pos.y;
  vPosition = pos;

  vec3 tangent = vec3(1.0, 0.0, 0.0);
  vec3 bitangent = vec3(0.0, 0.0, 1.0);
  vNormal = normalize(cross(tangent, bitangent));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
`;
