import { CAMERA_PRESETS } from '../utils/constants.js';
import { lerp } from '../utils/mathUtils.js';

export default class CameraController {
  constructor(camera) {
    this.camera = camera;
    this.shake = { intensity: 0, decay: 0.95 };
    this.currentPreset = CAMERA_PRESETS.ocean;
    this.frozen = false;
  }

  /** Transition to mode-specific camera preset */
  setMode(modeId) {
    this.currentPreset = CAMERA_PRESETS[modeId] || CAMERA_PRESETS.ocean;
  }

  triggerShake(intensity) {
    this.shake.intensity = intensity;
  }

  freeze(frozen) {
    this.frozen = frozen;
  }

  update(time) {
    if (this.frozen) return;

    const preset = this.currentPreset;

    const shakeX = (Math.random() - 0.5) * this.shake.intensity;
    const shakeY = (Math.random() - 0.5) * this.shake.intensity;
    this.shake.intensity *= this.shake.decay;

    const cameraRadius = preset.radius + Math.sin(time * 0.1) * 20;
    const cameraAngle = time * preset.speed;

    const targetX = Math.sin(cameraAngle) * cameraRadius * 0.3 + shakeX;
    const targetZ = cameraRadius + Math.cos(time * 0.08) * 20;
    const targetY = preset.height + Math.sin(time * 0.12) * 10 + shakeY;

    this.camera.position.x = lerp(this.camera.position.x, targetX, 0.05);
    this.camera.position.z = lerp(this.camera.position.z, targetZ, 0.05);
    this.camera.position.y = lerp(this.camera.position.y, targetY, 0.05);

    this.camera.lookAt(shakeX * 2, shakeY * 2, 0);
  }
}
