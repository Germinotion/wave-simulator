export const particlesFrag = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    float alpha = vAlpha * 0.5 * (1.0 - dist * 2.0);
    vec3 color = uColor * 0.6 * (1.0 - dist * 0.5);

    gl_FragColor = vec4(color, alpha);
  }
`;
