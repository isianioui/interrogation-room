/**
 * Downsamples the mic's native sample rate to 16kHz mono and converts to
 * PCM16, then posts each chunk (~100ms) to the main thread as a transferable
 * ArrayBuffer. AssemblyAI's Streaming API (v3) expects raw PCM16 mono 16kHz
 * binary audio frames (pcm_s16le), sent directly as WebSocket binary frames.
 */
class PCMProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.targetSampleRate = options?.processorOptions?.targetSampleRate ?? 16000;
    this.ratio = sampleRate / this.targetSampleRate;
    this.acc = 0;
    this.buffer = [];
    this.chunkSize = Math.round(this.targetSampleRate * 0.1); // ~100ms
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;
    const channelData = input[0];

    for (let i = 0; i < channelData.length; i++) {
      this.acc += 1;
      if (this.acc >= this.ratio) {
        this.acc -= this.ratio;
        this.buffer.push(channelData[i]);
      }
    }

    while (this.buffer.length >= this.chunkSize) {
      const chunk = this.buffer.splice(0, this.chunkSize);
      const pcm16 = new Int16Array(chunk.length);
      for (let j = 0; j < chunk.length; j++) {
        const s = Math.max(-1, Math.min(1, chunk[j]));
        pcm16[j] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
    }

    return true;
  }
}

registerProcessor("pcm-processor", PCMProcessor);
