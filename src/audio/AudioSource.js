/**
 * Base class for audio sources.
 * All sources expose an AnalyserNode that can be read for FFT data.
 */
export default class AudioSource {
  constructor(audioContext) {
    this.ctx = audioContext;
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.75;
    this.active = true;
  }

  /** Connect the internal source node to the analyser */
  connectSource(node) {
    node.connect(this.analyser);
  }

  /** Stop / release resources */
  dispose() {
    this.active = false;
  }
}
