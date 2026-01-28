export const oceanElevation = /* glsl */ `
  // Ocean mode - flowing waves
  float wave1 = snoise(vec3(pos.x * waveFreq + t * 0.5, pos.z * waveFreq + t * 0.3, t * 0.1));
  float wave2 = snoise(vec3(pos.x * waveFreq * 2.0 - t * 0.4, pos.z * waveFreq * 2.0 + t * 0.2, t * 0.15)) * 0.5;
  float wave3 = snoise(vec3(pos.x * waveFreq * 4.0 + t * 0.6, pos.z * waveFreq * 4.0 - t * 0.4, t * 0.2)) * 0.25;
  float wave4 = snoise(vec3(pos.x * waveFreq * 8.0 - t * 0.8, pos.z * waveFreq * 8.0 + t * 0.6, t * 0.25)) * 0.125;

  elevation = (wave1 + wave2 + wave3 + wave4) * (5.0 + uAmplitude * 30.0);
`;
