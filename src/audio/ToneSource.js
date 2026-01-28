import * as Tone from 'tone';
import AudioSource from './AudioSource.js';

export default class ToneSource extends AudioSource {
  /**
   * @param {AudioContext} audioContext - Web Audio context
   * @param {Object} opts - { waveform, frequency, amplitude }
   */
  constructor(audioContext, opts = {}) {
    super(audioContext);
    this.waveform = opts.waveform || 'sine';
    this.frequency = opts.frequency || 440;
    this.amplitude = opts.amplitude || 0.5;
    this.playing = false;

    // Tone.js synth → Web Audio analyser
    this.synth = new Tone.Oscillator({
      type: this.waveform,
      frequency: this.frequency,
      volume: Tone.gainToDb(this.amplitude),
    });

    // Route Tone.js output to our AnalyserNode
    const toneDestination = Tone.getContext().createMediaStreamDestination();
    this.synth.connect(toneDestination);

    const sourceNode = audioContext.createMediaStreamSource(toneDestination.stream);
    this.connectSource(sourceNode);
    this._mediaSourceNode = sourceNode;
  }

  async start() {
    await Tone.start();
    this.synth.start();
    this.playing = true;
  }

  stop() {
    if (this.playing) {
      this.synth.stop();
      this.playing = false;
    }
  }

  setWaveform(waveform) {
    this.waveform = waveform;
    this.synth.type = waveform;
  }

  setFrequency(frequency) {
    this.frequency = frequency;
    this.synth.frequency.value = frequency;
  }

  setAmplitude(amplitude) {
    this.amplitude = amplitude;
    this.synth.volume.value = Tone.gainToDb(Math.max(amplitude, 0.001));
  }

  dispose() {
    super.dispose();
    this.stop();
    this.synth.dispose();
    if (this._mediaSourceNode) {
      this._mediaSourceNode.disconnect();
    }
  }
}
