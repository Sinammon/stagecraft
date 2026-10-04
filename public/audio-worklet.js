class PracticeCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(1600);
    this.offset = 0;
    this.recording = false;
    this.sampleCount = 0;
    this.port.onmessage = ({ data }) => {
      if (data.type === 'start') {
        this.recording = true;
        this.offset = 0;
        this.sampleCount = 0;
      }
      if (data.type === 'stop') {
        if (this.offset) this.emit(this.buffer.slice(0, this.offset));
        this.recording = false;
        this.offset = 0;
        this.port.postMessage({ type: 'stopped', samples: this.sampleCount });
      }
    };
  }
  emit(samples) {
    this.port.postMessage(
      { type: 'samples', recording: this.recording, sampleCount: this.sampleCount, samples },
      [samples.buffer],
    );
  }
  process(inputs, outputs) {
    const input = inputs[0]?.[0];
    for (const output of outputs) for (const channel of output) channel.fill(0); // No microphone feedback through speakers.
    if (!input) return true;
    for (const value of input) {
      this.buffer[this.offset++] = value;
      if (this.recording) this.sampleCount++;
      if (this.offset === this.buffer.length) {
        const chunk = this.buffer;
        this.buffer = new Float32Array(1600);
        this.offset = 0;
        this.emit(chunk);
      }
    }
    return true;
  }
}
registerProcessor('practice-capture', PracticeCapture);
