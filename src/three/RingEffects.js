import * as THREE from 'three';
import { COLOR_SCHEMES } from '../utils/constants.js';

export default class RingEffects {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);
    this.rings = [];
    this.scene = scene;
  }

  spawnRing(intensity, schemeIndex) {
    const scheme = COLOR_SCHEMES[schemeIndex];
    const geometry = new THREE.RingGeometry(0.1, 2, 64);
    const material = new THREE.MeshBasicMaterial({
      color: scheme.c,
      transparent: true,
      opacity: intensity,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 1;
    ring.userData = { scale: 1, opacity: intensity, speed: 2 + Math.random() };
    this.group.add(ring);
    this.rings.push(ring);
  }

  update() {
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const ring = this.rings[i];
      ring.userData.scale += ring.userData.speed;
      ring.userData.opacity *= 0.96;
      ring.scale.set(ring.userData.scale, ring.userData.scale, 1);
      ring.material.opacity = ring.userData.opacity;

      if (ring.userData.opacity < 0.01) {
        this.group.remove(ring);
        ring.geometry.dispose();
        ring.material.dispose();
        this.rings.splice(i, 1);
      }
    }
  }

  dispose() {
    this.rings.forEach((ring) => {
      ring.geometry.dispose();
      ring.material.dispose();
    });
    this.scene.remove(this.group);
  }
}
