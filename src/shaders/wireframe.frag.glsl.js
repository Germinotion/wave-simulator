export const wireframeFrag = /* glsl */ `
  uniform float uAmplitude;
  uniform float uBeat;
  uniform vec3 uColorB;
  varying float vElevation;
  varying float vDistanceFromCenter;

  void main() {
    float alpha = (0.02 + uAmplitude * 0.08 + uBeat * 0.1) * (1.0 - smoothstep(0.7, 1.0, vDistanceFromCenter));
    vec3 color = uColorB * 0.4;
    gl_FragColor = vec4(color, alpha);
  }
`;
