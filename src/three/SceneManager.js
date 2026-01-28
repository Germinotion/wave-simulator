import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import WaveMesh from './WaveMesh.js';
import ParticleSystem from './ParticleSystem.js';
import RingEffects from './RingEffects.js';
import CameraController from './CameraController.js';
import { getPlaneShaderModeIndex } from './createModeShader.js';
import { COLOR_SCHEMES, MODES } from '../utils/constants.js';

export default class SceneManager {
  /**
   * @param {HTMLElement} container - DOM element to attach the renderer to
   * @param {Object} opts - optional overrides (pixelRatio, etc.)
   */
  constructor(container, opts = {}) {
    this.container = container;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000008);
    this.scene.fog = new THREE.FogExp2(0x000008, 0.008);

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 50, 100);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    const pr = opts.pixelRatio ?? Math.min(window.devicePixelRatio, 2);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(pr);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.9;
    container.appendChild(this.renderer.domElement);

    // Post-processing
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.6, 0.3, 0.7
    );
    this.composer.addPass(this.bloomPass);

    // Sub-systems
    this.waveMesh = new WaveMesh(this.scene, 0);
    this.waveMesh.setGeometryType('ocean'); // default
    this.particles = new ParticleSystem(this.scene, 0);
    this.rings = new RingEffects(this.scene);
    this.cameraCtrl = new CameraController(this.camera);

    // State tracking
    this.mouse = { x: 0, y: 0 };
    this.ripples = [];
    this.beat = { lastBeat: 0, threshold: 0.6, energy: 0, isBeat: false };
    this.time = 0;
    this.currentMode = 'ocean';
    this.currentScheme = 0;
  }

  resize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }

  setMode(modeId) {
    this.currentMode = modeId;
    const mode = MODES[modeId];
    if (!mode) return;

    this.waveMesh.setGeometryType(modeId);
    this.cameraCtrl.setMode(modeId);

    // Show/hide particles based on geometry type
    this.particles.points.visible = mode.geometry === 'plane';
  }

  setColorScheme(schemeIndex) {
    this.currentScheme = schemeIndex;
  }

  addRipple(normalizedX, normalizedY, time) {
    this.ripples.push({
      x: normalizedX * 100,
      z: normalizedY * 100,
      time,
      strength: 1.0,
    });
    if (this.ripples.length > 5) this.ripples.shift();
  }

  setMouse(x, y) {
    this.mouse.x = x;
    this.mouse.y = y;
  }

  /**
   * Main per-frame update.
   * @param {number} delta - seconds since last frame
   * @param {Object} audioData - { amplitude, bass, mid, treble, waveform }
   * @param {boolean} isPaused
   * @param {number} timeScale
   */
  update(delta, audioData, isPaused, timeScale) {
    if (!isPaused) {
      this.time += delta * timeScale;
    }

    const time = this.time;
    const { amplitude = 0, bass = 0, mid = 0, treble = 0, waveform } = audioData;
    const scheme = COLOR_SCHEMES[this.currentScheme];
    const mode = MODES[this.currentMode];
    const geomType = mode ? mode.geometry : 'plane';

    // --- Update uniforms ---
    const uniforms = this.waveMesh.getUniforms();
    if (uniforms) {
      uniforms.uTime.value = time;

      if (geomType === 'plane') {
        const modeIndex = getPlaneShaderModeIndex(this.currentMode);
        uniforms.uMode.value += (modeIndex - uniforms.uMode.value) * 0.05;

        // Colors
        uniforms.uColorA.value.lerp(new THREE.Color(scheme.a), 0.05);
        uniforms.uColorB.value.lerp(new THREE.Color(scheme.b), 0.05);
        uniforms.uColorC.value.lerp(new THREE.Color(scheme.c), 0.05);

        // Mouse & ripples
        uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);

        const rippleData = this.ripples.map(
          (r) => new THREE.Vector4(r.x, r.z, r.time, r.strength)
        );
        while (rippleData.length < 5) {
          rippleData.push(new THREE.Vector4(0, 0, -1000, 0));
        }
        uniforms.uRipples.value = rippleData;
      }

      if (geomType === 'line' || geomType === 'bars') {
        if (uniforms.uColorA) {
          uniforms.uColorA.value.lerp(new THREE.Color(scheme.a), 0.05);
          uniforms.uColorB.value.lerp(new THREE.Color(scheme.b), 0.05);
          uniforms.uColorC.value.lerp(new THREE.Color(scheme.c), 0.05);
        }
      }

      // Audio uniforms (common to all geometry types)
      const smoothing = 0.12;
      uniforms.uAmplitude.value += (amplitude - uniforms.uAmplitude.value) * smoothing;
      if (uniforms.uBass) uniforms.uBass.value += (bass - uniforms.uBass.value) * smoothing;
      if (uniforms.uMid) uniforms.uMid.value += (mid - uniforms.uMid.value) * smoothing;
      if (uniforms.uTreble) uniforms.uTreble.value += (treble - uniforms.uTreble.value) * smoothing;
      if (uniforms.uFrequency) {
        uniforms.uFrequency.value += (1 - uniforms.uFrequency.value) * smoothing;
      }

      // Waveform data for bars
      if (uniforms.uWaveformData && waveform) {
        uniforms.uWaveformData.value = waveform;
      }
    }

    // --- Beat detection ---
    const currentEnergy = bass * 0.6 + mid * 0.3 + amplitude * 0.1;
    const energyDelta = currentEnergy - this.beat.energy;

    if (energyDelta > 0.15 && currentEnergy > 0.4 && time - this.beat.lastBeat > 0.2) {
      this.beat.isBeat = true;
      this.beat.lastBeat = time;

      if (bass > 0.6) {
        this.rings.spawnRing(bass, this.currentScheme);
        this.cameraCtrl.triggerShake(bass * 5);
      }

      if (this.bloomPass) {
        this.bloomPass.strength = 1.0;
      }
    } else {
      this.beat.isBeat = false;
    }
    this.beat.energy = currentEnergy;

    // Beat uniform
    if (uniforms) {
      const beatValue = this.beat.isBeat ? 1.0 : (uniforms.uBeat?.value ?? 0) * 0.9;
      if (uniforms.uBeat) uniforms.uBeat.value = beatValue;
    }

    // Sync wireframe/particle uniforms for plane mode
    if (geomType === 'plane' && uniforms) {
      this.particles.uniforms.uAmplitude.value = uniforms.uAmplitude.value;
      this.particles.uniforms.uBeat.value = uniforms.uBeat?.value ?? 0;
      this.particles.uniforms.uColor.value.lerp(new THREE.Color(scheme.b), 0.05);
    }

    // Bars mode — update bar meshes directly
    if (geomType === 'bars') {
      this.waveMesh.updateBars(
        waveform || new Float32Array(256),
        amplitude,
        uniforms?.uBeat?.value ?? 0,
        new THREE.Color(scheme.a),
        new THREE.Color(scheme.b),
        new THREE.Color(scheme.c)
      );
    }

    // Bloom decay
    if (this.bloomPass) {
      this.bloomPass.strength += (0.6 - this.bloomPass.strength) * 0.08;
    }

    // Sub-system updates
    this.rings.update();
    this.particles.update(time, amplitude);
    this.cameraCtrl.update(time);

    // Render
    this.composer.render();
  }

  dispose() {
    this.waveMesh.dispose();
    this.particles.dispose();
    this.rings.dispose();
    if (this.renderer.domElement.parentElement) {
      this.container.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
