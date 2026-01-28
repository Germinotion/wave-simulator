import AudioSource from './AudioSource.js';

export default class FileSource extends AudioSource {
  constructor(audioContext) {
    super(audioContext);
    this.bufferSource = null;
    this.audioBuffer = null;
    this.playing = false;
    this.loop = true;
    this.gainNode = this.ctx.createGain();
    this.gainNode.connect(this.analyser);
  }

  async loadFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    this.audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
  }

  async loadArrayBuffer(arrayBuffer) {
    this.audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
  }

  play() {
    if (!this.audioBuffer) return;
    this.stop();
    this.bufferSource = this.ctx.createBufferSource();
    this.bufferSource.buffer = this.audioBuffer;
    this.bufferSource.loop = this.loop;
    this.bufferSource.connect(this.gainNode);
    this.bufferSource.start(0);
    this.playing = true;

    this.bufferSource.onended = () => {
      this.playing = false;
    };
  }

  stop() {
    if (this.bufferSource) {
      try { this.bufferSource.stop(); } catch (_) { /* already stopped */ }
      this.bufferSource.disconnect();
      this.bufferSource = null;
    }
    this.playing = false;
  }

  setVolume(v) {
    this.gainNode.gain.value = v;
  }

  dispose() {
    super.dispose();
    this.stop();
  }
}
