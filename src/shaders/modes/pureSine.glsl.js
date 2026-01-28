export const pureSineElevation = /* glsl */ `
  // Pure Sine Wave - clean fundamental oscillation
  float sineFreq = 0.03 + uFrequency * 0.06;
  float sineAmp = 8.0 + uAmplitude * 25.0;
  elevation = sin(pos.x * sineFreq + t * 2.0) * sineAmp;
  // Add subtle z-axis variation
  elevation *= (0.8 + 0.2 * sin(pos.z * sineFreq * 0.5 + t * 0.5));
`;
