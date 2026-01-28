/**
 * Extracts bass/mid/treble bands and waveform data from an AnalyserNode.
 */
export default class FFTAnalyzer {
  constructor(analyser) {
    this.analyser = analyser;
    this.frequencyData = new Uint8Array(analyser.frequencyBinCount);
    this.timeDomainData = new Uint8Array(analyser.frequencyBinCount);
    this.waveform = new Float32Array(256);
  }

  /**
   * Sample the analyser and return extracted bands.
   * @returns {{ amplitude, bass, mid, treble, waveform: Float32Array }}
   */
  analyze() {
    const analyser = this.analyser;
    analyser.getByteFrequencyData(this.frequencyData);
    analyser.getByteTimeDomainData(this.timeDomainData);

    const data = this.frequencyData;
    const bufferLength = data.length;

    const bassEnd = Math.floor(bufferLength * 0.1);
    const midEnd = Math.floor(bufferLength * 0.5);

    let bassSum = 0, midSum = 0, trebleSum = 0, totalSum = 0;

    for (let i = 0; i < bufferLength; i++) {
      const value = data[i] / 255;
      totalSum += value;
      if (i < bassEnd) bassSum += value;
      else if (i < midEnd) midSum += value;
      else trebleSum += value;
    }

    const bass = bassSum / bassEnd;
    const mid = midSum / (midEnd - bassEnd);
    const treble = trebleSum / (bufferLength - midEnd);
    const amplitude = totalSum / bufferLength;

    // Normalised waveform in [-1, 1] range, down-sampled to 256 floats
    const tdLen = this.timeDomainData.length;
    for (let i = 0; i < 256; i++) {
      const idx = Math.floor((i / 256) * tdLen);
      this.waveform[i] = (this.timeDomainData[idx] - 128) / 128;
    }

    return { amplitude, bass, mid, treble, waveform: this.waveform };
  }
}
