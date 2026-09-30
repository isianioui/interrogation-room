const TARGET_SAMPLE_RATE = 16000;

export interface MicCapture {
  stop: () => void;
  setMuted: (muted: boolean) => void;
}

/**
 * Captures mic audio, downsamples it to PCM16 mono 16kHz via an
 * AudioWorklet, and calls `onChunk` with each raw PCM16 ArrayBuffer chunk.
 * AssemblyAI's Streaming API takes these as raw binary WebSocket frames —
 * no base64/JSON wrapping needed (unlike the Voice Agent API).
 */
export async function startMicCapture(
  onChunk: (pcm16Chunk: ArrayBuffer) => void
): Promise<MicCapture> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioCtx = new AudioContext();
  await audioCtx.audioWorklet.addModule("/worklets/pcm-processor.js");

  const source = audioCtx.createMediaStreamSource(stream);
  const node = new AudioWorkletNode(audioCtx, "pcm-processor", {
    processorOptions: { targetSampleRate: TARGET_SAMPLE_RATE },
  });

  let muted = false;
  node.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
    if (muted) return;
    onChunk(event.data);
  };

  source.connect(node);

  return {
    stop: () => {
      node.port.onmessage = null;
      source.disconnect();
      node.disconnect();
      stream.getTracks().forEach((t) => t.stop());
      audioCtx.close().catch(() => {});
    },
    setMuted: (value: boolean) => {
      muted = value;
    },
  };
}
