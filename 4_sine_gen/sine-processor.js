import Module from "./sinegen.js";

class SineProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    Module().then((instance) => {
      this.module = instance;
      this.generateSine = instance.cwrap("generate_sine", null,
        ["number", "number", "number", "number", "number"]);

      this.bufferPtr = this.module._malloc(128 * 4);
      this.phasePtr = this.module._malloc(4);

      new Float32Array(this.module.HEAPF32.buffer, this.phasePtr, 1)[0] = 0.0;

      this.ready = true;
    });
  }
  process(inputs, outputs) {
    if (!this.ready) return true;
    const output = outputs[0][0];
    this.generateSine(this.bufferPtr, output.length, 440, sampleRate, this.phasePtr);
    const wasmBuf = new Float32Array(this.module.HEAPF32.buffer, this.bufferPtr, output.length);
    output.set(wasmBuf);
    return true;
  }
}
registerProcessor("sine-processor", SineProcessor);


// import Module from "./sinegen.js";

// class SineProcessor extends AudioWorkletProcessor {
//   constructor() {
//     super();

//     this.ready = false;
//     this.bufferSize = 128;
//     this.sampleRate = sampleRate;

//     // Initialize WASM inside the worklet thread
//     Module().then((instance) => {
//       this.module = instance;
//       this.generateSine = instance.cwrap("generate_sine", null,
//         ["number", "number", "number", "number", "number"]);

//       this.bufferPtr = this.module._malloc(this.bufferSize * 4);
//       this.phasePtr = this.module._malloc(4);

//       new Float32Array(this.module.HEAPF32.buffer, this.phasePtr, 1)[0] = 0.0;

//       this.ready = true;
//     });
//   }

//   process(inputs, outputs) {
//     if (!this.ready) return true; // skip until WASM ready

//     const output = outputs[0][0];

//     this.generateSine(this.bufferPtr, this.bufferSize, 440.0, this.sampleRate, this.phasePtr);

//     const wasmBuf = new Float32Array(this.module.HEAPF32.buffer, this.bufferPtr, this.bufferSize);

//     for (let i = 0; i < output.length; i++) {
//       output[i] = wasmBuf[i];
//     }

//     return true;
//   }
// }

// registerProcessor("sine-processor", SineProcessor);
