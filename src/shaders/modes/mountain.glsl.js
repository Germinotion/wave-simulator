export const mountainElevation = /* glsl */ `
  // Mountain mode - terrain-like
  float terrain = snoise(vec3(pos.x * 0.01 + t * 0.1, pos.z * 0.01 + t * 0.1, 0.0)) * 20.0;
  terrain += snoise(vec3(pos.x * 0.03 + t * 0.2, pos.z * 0.03 + t * 0.15, 1.0)) * 10.0;
  terrain += snoise(vec3(pos.x * 0.06 + t * 0.3, pos.z * 0.06 + t * 0.25, 2.0)) * 5.0;

  elevation = terrain * (0.5 + uAmplitude * 2.0);
`;
