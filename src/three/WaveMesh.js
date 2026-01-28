import * as THREE from 'three';
import {
  createPlaneUniforms,
  createPlaneMaterial,
  createWireframeMaterial,
  createLineUniforms,
  createLineMaterial,
  createBarsUniforms,
  createBarsMaterial,
} from './createModeShader.js';
import { MODES } from '../utils/constants.js';

export default class WaveMesh {
  constructor(scene, schemeIndex = 0) {
    this.scene = scene;
    this.schemeIndex = schemeIndex;
    this.currentGeometryType = null;

    // Plane resources
    this.planeMesh = null;
    this.wireframeMesh = null;
    this.planeUniforms = null;

    // Line resources
    this.lineMesh = null;
    this.lineUniforms = null;

    // Bars resources
    this.barsGroup = null;
    this.barsUniforms = null;
    this.barMeshes = [];
  }

  /** Returns the active uniforms object for the current geometry type */
  getUniforms() {
    switch (this.currentGeometryType) {
      case 'line': return this.lineUniforms;
      case 'bars': return this.barsUniforms;
      default: return this.planeUniforms;
    }
  }

  /** Returns the plane uniforms specifically (wireframe shares them) */
  getPlaneUniforms() {
    return this.planeUniforms;
  }

  /** Switch to the geometry type needed for the given mode */
  setGeometryType(modeId) {
    const mode = MODES[modeId];
    const geomType = mode ? mode.geometry : 'plane';

    // Line modes need rebuild per mode (different shaders), so also track modeId
    if (geomType === this.currentGeometryType && (geomType !== 'line' || modeId === this.currentModeId)) return;

    // Hide everything
    this._hideAll();

    if (geomType === 'plane') {
      if (!this.planeMesh) this._createPlane();
      this.planeMesh.visible = true;
      this.wireframeMesh.visible = true;
    } else if (geomType === 'line') {
      // Line needs to be recreated per mode since shaders differ
      this._removeLine();
      this._createLine(modeId);
      this.lineMesh.visible = true;
    } else if (geomType === 'bars') {
      if (!this.barsGroup) this._createBars();
      this.barsGroup.visible = true;
    }

    this.currentGeometryType = geomType;
    this.currentModeId = modeId;
  }

  _hideAll() {
    if (this.planeMesh) this.planeMesh.visible = false;
    if (this.wireframeMesh) this.wireframeMesh.visible = false;
    if (this.lineMesh) this.lineMesh.visible = false;
    if (this.barsGroup) this.barsGroup.visible = false;
  }

  _createPlane() {
    const segments = 200;
    const geometry = new THREE.PlaneGeometry(250, 250, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    this.planeUniforms = createPlaneUniforms(this.schemeIndex);
    const material = createPlaneMaterial(this.planeUniforms);
    this.planeMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.planeMesh);

    // Wireframe overlay
    const wireMaterial = createWireframeMaterial(this.planeUniforms);
    const wireGeometry = geometry.clone();
    this.wireframeMesh = new THREE.Mesh(wireGeometry, wireMaterial);
    this.wireframeMesh.position.y = 0.05;
    this.scene.add(this.wireframeMesh);
  }

  _createLine(modeId) {
    const pointCount = 512;
    const positions = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i++) {
      positions[i * 3] = (i / (pointCount - 1) - 0.5) * 200;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.lineUniforms = createLineUniforms(this.schemeIndex);
    const material = createLineMaterial(modeId, this.lineUniforms);
    this.lineMesh = new THREE.Line(geometry, material);
    this.scene.add(this.lineMesh);
  }

  _removeLine() {
    if (this.lineMesh) {
      this.scene.remove(this.lineMesh);
      this.lineMesh.geometry.dispose();
      this.lineMesh.material.dispose();
      this.lineMesh = null;
      this.lineUniforms = null;
    }
  }

  _createBars() {
    this.barsGroup = new THREE.Group();
    this.barsUniforms = createBarsUniforms(this.schemeIndex);

    const barCount = 64;
    const barWidth = 2.5;
    const gap = 0.5;
    const totalWidth = barCount * (barWidth + gap);

    this.barMeshes = [];
    for (let i = 0; i < barCount; i++) {
      const geometry = new THREE.BoxGeometry(barWidth, 1, barWidth);
      const material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = i * (barWidth + gap) - totalWidth / 2 + barWidth / 2;
      mesh.position.y = 0;
      mesh.position.z = 0;
      this.barsGroup.add(mesh);
      this.barMeshes.push(mesh);
    }

    this.scene.add(this.barsGroup);
  }

  /** Update bar heights from waveform data (called each frame for 'bars' mode) */
  updateBars(waveformData, amplitude, beat, colorA, colorB, colorC) {
    if (!this.barMeshes.length) return;
    const barCount = this.barMeshes.length;
    for (let i = 0; i < barCount; i++) {
      const dataIdx = Math.floor((i / barCount) * (waveformData.length || 256));
      const sample = waveformData[dataIdx] || 0;
      const barHeight = Math.max(sample * (20 + amplitude * 40) + beat * 3 * sample, 0.5);

      const mesh = this.barMeshes[i];
      mesh.scale.y = barHeight;
      mesh.position.y = barHeight / 2;

      // Color gradient
      const t = i / barCount;
      const color = new THREE.Color();
      if (t < 0.33) {
        color.copy(colorA).lerp(colorB, t * 3);
      } else if (t < 0.66) {
        color.copy(colorB).lerp(colorC, (t - 0.33) * 3);
      } else {
        color.copy(colorC).lerp(colorA, (t - 0.66) * 3);
      }
      const brightness = 0.4 + (barHeight / 60) * 0.6;
      color.multiplyScalar(brightness + beat * 0.2);
      mesh.material.color.copy(color);
    }
  }

  dispose() {
    if (this.planeMesh) {
      this.scene.remove(this.planeMesh);
      this.planeMesh.geometry.dispose();
      this.planeMesh.material.dispose();
    }
    if (this.wireframeMesh) {
      this.scene.remove(this.wireframeMesh);
      this.wireframeMesh.geometry.dispose();
      this.wireframeMesh.material.dispose();
    }
    this._removeLine();
    if (this.barsGroup) {
      this.barMeshes.forEach((m) => {
        m.geometry.dispose();
        m.material.dispose();
      });
      this.scene.remove(this.barsGroup);
    }
  }
}
