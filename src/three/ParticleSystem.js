import * as THREE from 'three';
import { particlesVert } from '../shaders/particles.vert.glsl.js';
import { particlesFrag } from '../shaders/particles.frag.glsl.js';
import { COLOR_SCHEMES } from '../utils/constants.js';

export default class ParticleSystem {
  constructor(scene, schemeIndex = 0) {
    const particleCount = 3000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 1] = Math.random() * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
      velocities[i * 3] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 1] = Math.random() * 0.1;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const scheme = COLOR_SCHEMES[schemeIndex];
    this.uniforms = {
      uTime: { value: 0 },
      uAmplitude: { value: 0 },
      uBeat: { value: 0 },
      uColor: { value: new THREE.Color(scheme.b) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: particlesVert,
      fragmentShader: particlesFrag,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(geometry, material);
    scene.add(this.points);
    this.scene = scene;
  }

  update(time, amplitude) {
    this.uniforms.uTime.value = time;
    this.points.rotation.y += 0.001 + amplitude * 0.005;
  }

  dispose() {
    this.scene.remove(this.points);
    this.points.geometry.dispose();
    this.points.material.dispose();
  }
}
