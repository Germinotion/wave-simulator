export const fireElevation = /* glsl */ `
  // Fire - turbulent noise driven by amplitude
  float fireBase = snoise(vec3(pos.x * 0.03, pos.z * 0.03 - t * 2.0, t * 0.5)) * 15.0;
  float fireMid = snoise(vec3(pos.x * 0.06, pos.z * 0.06 - t * 3.0, t * 0.8)) * 8.0;
  float fireDetail = snoise(vec3(pos.x * 0.12, pos.z * 0.12 - t * 5.0, t * 1.2)) * 4.0;
  float fireFlicker = snoise(vec3(pos.x * 0.25, pos.z * 0.25 - t * 8.0, t * 2.0)) * 2.0;

  elevation = (fireBase + fireMid + fireDetail + fireFlicker) * (0.3 + uAmplitude * 2.5);

  // Flames rise more at center
  float centerFade = 1.0 - smoothstep(0.0, 0.8, abs(pos.x) / 125.0);
  elevation *= centerFade;
  // Only positive elevation (flames go up)
  elevation = max(elevation, 0.0);
`;
