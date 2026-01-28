export const vortexElevation = /* glsl */ `
  // Vortex mode - spinning spiral
  float angle = atan(pos.z, pos.x);
  float radius = length(pos.xz);
  float spiral = sin(angle * 5.0 + radius * 0.05 - t * 3.0);
  float radialWave = sin(radius * 0.1 - t * 2.0);

  elevation = (spiral * radialWave) * (8.0 + uAmplitude * 25.0);
  elevation += snoise(vec3(pos.x * 0.02 + t, pos.z * 0.02, t * 0.2)) * 5.0 * (1.0 + uAmplitude);
`;
