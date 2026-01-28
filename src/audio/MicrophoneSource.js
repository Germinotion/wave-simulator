import AudioSource from './AudioSource.js';

export default class MicrophoneSource extends AudioSource {
  constructor(audioContext) {
    super(audioContext);
    this.stream = null;
    this.sourceNode = null;
  }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.sourceNode = this.ctx.createMediaStreamSource(this.stream);
    this.connectSource(this.sourceNode);
  }

  dispose() {
    super.dispose();
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }
  }
}
