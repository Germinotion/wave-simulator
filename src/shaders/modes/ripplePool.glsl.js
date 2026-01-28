export const ripplePoolElevation = /* glsl */ `
  // Ripple Pool - concentric rings with interference
  float rpDist1 = length(pos.xz - vec2(30.0, 0.0));
  float rpDist2 = length(pos.xz - vec2(-30.0, 0.0));
  float rpFreq = 0.15 + uFrequency * 0.2;

  float ripple1 = sin(rpDist1 * rpFreq - t * 4.0) / (1.0 + rpDist1 * 0.02);
  float ripple2 = sin(rpDist2 * rpFreq - t * 4.0) / (1.0 + rpDist2 * 0.02);

  // Third source at mouse / center
  float rpDist3 = length(pos.xz);
  float ripple3 = sin(rpDist3 * rpFreq - t * 4.0 + 1.57) / (1.0 + rpDist3 * 0.02) * 0.5;

  elevation = (ripple1 + ripple2 + ripple3) * (8.0 + uAmplitude * 25.0);
`;
