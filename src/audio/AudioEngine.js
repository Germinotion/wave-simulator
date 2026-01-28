import MicrophoneSource from './MicrophoneSource.js';
import FileSource from './FileSource.js';
import ToneSource from './ToneSource.js';
import FFTAnalyzer from './FFTAnalyzer.js';

/**
 * Manages multiple AudioSources and provides a combined analyser.
 */
export default class AudioEngine {
  constructor() {
    this.ctx = null;
    this.sources = new Map(); // id → { source, analyzer }
    this.combinedAnalyser = null;
    this.combinedData = { amplitude: 0, bass: 0, mid: 0, treble: 0, waveform: new Float32Array(256) };
    this._nextId = 1;
  }

  async init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Combined analyser — sources are merged into this
    this.combinedAnalyser = this.ctx.createAnalyser();
    this.combinedAnalyser.fftSize = 512;
    this.combinedAnalyser.smoothingTimeConstant = 0.75;
    this._combinedFFT = new FFTAnalyzer(this.combinedAnalyser);
  }

  _ensureCtx() {
    if (!this.ctx) throw new Error('AudioEngine not initialised. Call init() first.');
  }

  /**
   * Add a microphone source.
   * @returns {number} source id
   */
  async addMicrophone() {
    this._ensureCtx();
    const mic = new MicrophoneSource(this.ctx);
    await mic.start();
    // Also connect to combined
    mic.analyser.connect(this.combinedAnalyser);

    const id = this._nextId++;
    const analyzer = new FFTAnalyzer(mic.analyser);
    this.sources.set(id, { source: mic, analyzer, type: 'mic', label: 'Microphone' });
    return id;
  }

  /**
   * Add a file source.
   * @param {File} file
   * @returns {number} source id
   */
  async addFile(file) {
    this._ensureCtx();
    const fs = new FileSource(this.ctx);
    await fs.loadFile(file);
    fs.play();
    fs.analyser.connect(this.combinedAnalyser);

    const id = this._nextId++;
    const analyzer = new FFTAnalyzer(fs.analyser);
    this.sources.set(id, { source: fs, analyzer, type: 'file', label: file.name });
    return id;
  }

  /**
   * Add a tone generator source.
   * @param {Object} opts - { waveform, frequency, amplitude }
   * @returns {number} source id
   */
  async addTone(opts = {}) {
    this._ensureCtx();
    const tone = new ToneSource(this.ctx, opts);
    await tone.start();
    tone.analyser.connect(this.combinedAnalyser);

    const id = this._nextId++;
    const analyzer = new FFTAnalyzer(tone.analyser);
    this.sources.set(id, {
      source: tone,
      analyzer,
      type: 'tone',
      label: `${opts.waveform || 'sine'} ${opts.frequency || 440}Hz`,
    });
    return id;
  }

  /** Remove a source by id */
  removeSource(id) {
    const entry = this.sources.get(id);
    if (!entry) return;
    entry.source.analyser.disconnect(this.combinedAnalyser);
    entry.source.dispose();
    this.sources.delete(id);
  }

  /** Get per-source FFT data */
  getSourceData(id) {
    const entry = this.sources.get(id);
    if (!entry) return null;
    return entry.analyzer.analyze();
  }

  /** Get the source instance (for ToneSource parameter changes, etc.) */
  getSource(id) {
    return this.sources.get(id)?.source ?? null;
  }

  /**
   * Get combined FFT data from all sources.
   * Call once per frame.
   */
  getCombinedData() {
    if (!this.combinedAnalyser || this.sources.size === 0) {
      return this.combinedData;
    }
    return this._combinedFFT.analyze();
  }

  dispose() {
    for (const [id] of this.sources) {
      this.removeSource(id);
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
