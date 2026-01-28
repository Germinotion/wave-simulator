export const explosionElevation = /* glsl */ `
  // Explosion - radial shockwave propagation
  float expDist = length(pos.xz);
  float shockRadius = mod(t * 30.0, 150.0);
  float shockWidth = 15.0;
  float shock = exp(-pow((expDist - shockRadius) / shockWidth, 2.0));
  float shockWave = sin(expDist * 0.3 - t * 8.0) * shock;

  // Secondary shockwave
  float shockRadius2 = mod(t * 30.0 + 50.0, 150.0);
  float shock2 = exp(-pow((expDist - shockRadius2) / shockWidth, 2.0));
  float shockWave2 = sin(expDist * 0.3 - t * 8.0 + 3.14) * shock2 * 0.6;

  elevation = (shockWave + shockWave2) * (10.0 + uAmplitude * 30.0);
  elevation += snoise(vec3(pos.x * 0.05 + t, pos.z * 0.05, t * 0.3)) * uAmplitude * 5.0;
`;
