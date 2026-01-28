import * as THREE from 'three';
import { basePlaneVertPreamble, basePlaneVertAudio } from '../shaders/basePlane.vert.glsl.js';
import { oceanElevation } from '../shaders/modes/ocean.glsl.js';
import { vortexElevation } from '../shaders/modes/vortex.glsl.js';
import { mountainElevation } from '../shaders/modes/mountain.glsl.js';
import { pureSineElevation } from '../shaders/modes/pureSine.glsl.js';
import { fireElevation } from '../shaders/modes/fire.glsl.js';
import { explosionElevation } from '../shaders/modes/explosion.glsl.js';
import { ripplePoolElevation } from '../shaders/modes/ripplePool.glsl.js';
import { cymaticsElevation } from '../shaders/modes/cymatics.glsl.js';
import { stringVibrationVert, stringVibrationFrag } from '../shaders/modes/stringVibration.glsl.js';
import { spectrumBarsVert, spectrumBarsFrag } from '../shaders/modes/spectrumBars.glsl.js';
import { wireframeFrag } from '../shaders/wireframe.frag.glsl.js';
import { COLOR_SCHEMES } from '../utils/constants.js';

const planeElevations = {
  ocean: oceanElevation,
  vortex: vortexElevation,
  mountain: mountainElevation,
  pureSine: pureSineElevation,
  fire: fireElevation,
  explosion: explosionElevation,
  ripplePool: ripplePoolElevation,
  cymatics: cymaticsElevation,
};

// Build the uber-vertex shader with all plane modes as if/else branches (same as original approach)
function buildPlaneVertexShader() {
  const modes = Object.entries(planeElevations);
  let branchCode = '';
  modes.forEach(([id, code], i) => {
    const modeIndex = i;
    if (i === 0) {
      branchCode += `if (uMode < ${modeIndex}.5) {\n${code}\n}`;
    } else if (i < modes.length - 1) {
      branchCode += ` else if (uMode < ${modeIndex}.5) {\n${code}\n}`;
    } else {
      branchCode += ` else {\n${code}\n}`;
    }
  });

  return `
    ${basePlaneVertPreamble}

    void main() {
      vUv = uv;
      vec3 pos = position;

      float distFromCenter = length(pos.xz) / 125.0;
      vDistanceFromCenter = distFromCenter;

      float waveFreq = 0.02 + uFrequency * 0.04;
      float t = uTime;

      float elevation = 0.0;

      ${branchCode}

      ${basePlaneVertAudio}
    }
  `;
}

const planeFragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uAmplitude;
  uniform float uTime;
  uniform float uBeat;
  uniform float uBass;

  varying vec2 vUv;
  varying float vElevation;
  varying float vDistanceFromCenter;
  varying vec3 vPosition;

  void main() {
    float normalizedElevation = (vElevation + 30.0) / 60.0;
    normalizedElevation = clamp(normalizedElevation, 0.0, 1.0);

    vec3 valleyColor = uColorA * 0.15;
    vec3 midColor = uColorB * 0.5;
    vec3 peakColor = uColorC * 0.8;

    vec3 color;
    if (normalizedElevation < 0.4) {
      color = mix(valleyColor, midColor, normalizedElevation * 2.5);
    } else if (normalizedElevation < 0.7) {
      color = mix(midColor, peakColor, (normalizedElevation - 0.4) * 3.33);
    } else {
      color = mix(peakColor, uColorC, (normalizedElevation - 0.7) * 3.33);
    }

    float beatGlow = uBeat * 0.3 * normalizedElevation;
    color += vec3(beatGlow * 0.2, beatGlow * 0.3, beatGlow * 0.4);

    color += vec3(uBass * 0.1, uBass * 0.05, 0.0) * normalizedElevation;

    float glow = uAmplitude * 0.2;
    color += vec3(glow * 0.1, glow * 0.15, glow * 0.2) * normalizedElevation;

    float sparkle = smoothstep(0.85, 1.0, normalizedElevation);
    color += vec3(sparkle * 0.5);

    float alpha = 1.0 - smoothstep(0.8, 1.0, vDistanceFromCenter);

    gl_FragColor = vec4(color, alpha);
  }
`;

// Mode index map for the uber-shader uMode uniform
const PLANE_MODE_INDEX = {};
Object.keys(planeElevations).forEach((id, i) => {
  PLANE_MODE_INDEX[id] = i;
});

export function getPlaneShaderModeIndex(modeId) {
  return PLANE_MODE_INDEX[modeId] ?? 0;
}

export function createPlaneUniforms(schemeIndex = 0) {
  const scheme = COLOR_SCHEMES[schemeIndex];
  return {
    uTime: { value: 0 },
    uAmplitude: { value: 0 },
    uFrequency: { value: 1 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uTreble: { value: 0 },
    uBeat: { value: 0 },
    uColorA: { value: new THREE.Color(scheme.a) },
    uColorB: { value: new THREE.Color(scheme.b) },
    uColorC: { value: new THREE.Color(scheme.c) },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uRipples: { value: new Array(5).fill(null).map(() => new THREE.Vector4(0, 0, -1000, 0)) },
    uMode: { value: 0 },
    uWaveformData: { value: new Float32Array(256) },
  };
}

export function createPlaneMaterial(uniforms) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: buildPlaneVertexShader(),
    fragmentShader: planeFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
  });
}

export function createWireframeMaterial(uniforms) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: buildPlaneVertexShader(),
    fragmentShader: wireframeFrag,
    transparent: true,
    wireframe: true,
  });
}

export function createLineUniforms(schemeIndex = 0) {
  const scheme = COLOR_SCHEMES[schemeIndex];
  return {
    uTime: { value: 0 },
    uAmplitude: { value: 0 },
    uFrequency: { value: 1 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uTreble: { value: 0 },
    uBeat: { value: 0 },
    uColorA: { value: new THREE.Color(scheme.a) },
    uColorB: { value: new THREE.Color(scheme.b) },
    uColorC: { value: new THREE.Color(scheme.c) },
  };
}

export function createLineMaterial(modeId, uniforms) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: stringVibrationVert,
    fragmentShader: stringVibrationFrag,
    transparent: true,
  });
}

export function createBarsUniforms(schemeIndex = 0) {
  const scheme = COLOR_SCHEMES[schemeIndex];
  return {
    uTime: { value: 0 },
    uAmplitude: { value: 0 },
    uFrequency: { value: 1 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uTreble: { value: 0 },
    uBeat: { value: 0 },
    uColorA: { value: new THREE.Color(scheme.a) },
    uColorB: { value: new THREE.Color(scheme.b) },
    uColorC: { value: new THREE.Color(scheme.c) },
    uWaveformData: { value: new Float32Array(256) },
  };
}

export function createBarsMaterial(uniforms) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: spectrumBarsVert,
    fragmentShader: spectrumBarsFrag,
    transparent: true,
  });
}
