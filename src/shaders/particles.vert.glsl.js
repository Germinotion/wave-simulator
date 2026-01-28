export const particlesVert = /* glsl */ `
  attribute float size;
  attribute vec3 velocity;
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uBeat;

  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Floating motion
    pos.y += sin(uTime + position.x * 0.01) * 2.0;
    pos.x += sin(uTime * 0.5 + position.z * 0.01) * 2.0;

    // React to audio - expand outward on beats
    float dist = length(pos.xz);
    pos.xz *= 1.0 + uBeat * 0.3 * (1.0 - dist / 150.0);
    pos.y += uAmplitude * 10.0 * sin(dist * 0.05 + uTime);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    float dynamicSize = size * (1.0 + uAmplitude * 2.0 + uBeat * 3.0);
    gl_PointSize = dynamicSize * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    vAlpha = 0.4 + uAmplitude * 0.4 + uBeat * 0.2;
  }
`;
