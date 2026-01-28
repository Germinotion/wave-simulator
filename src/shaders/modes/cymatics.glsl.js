export const cymaticsElevation = /* glsl */ `
  // Cymatics - 2D Chladni plate patterns
  float cx = pos.x / 125.0 * 3.14159;
  float cz = pos.z / 125.0 * 3.14159;

  // Chladni pattern: sin(n*x)*sin(m*z) - sin(m*x)*sin(n*z)
  float n = 2.0 + floor(uFrequency * 4.0);
  float m = 3.0 + floor(uAmplitude * 3.0);
  float chladni1 = sin(n * cx + t * 0.5) * sin(m * cz) - sin(m * cx) * sin(n * cz + t * 0.5);

  // Second harmonic pattern
  float n2 = n + 1.0;
  float m2 = m + 1.0;
  float chladni2 = sin(n2 * cx + t * 0.3) * sin(m2 * cz) - sin(m2 * cx) * sin(n2 * cz + t * 0.3);

  elevation = (chladni1 * 0.7 + chladni2 * 0.3) * (10.0 + uAmplitude * 20.0);
`;
