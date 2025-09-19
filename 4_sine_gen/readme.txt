We’ll use C to fill a buffer with samples of a sine wave. JavaScript will request a new buffer periodically and feed it to the Web Audio API for playback.

We need to export generate_sine, plus _malloc and _free:

emcc sinegen.c -o sinegen.js \
  -sMODULARIZE=1 -sEXPORT_ES6=1 \
  -sEXPORTED_FUNCTIONS='["_generate_sine", "_malloc", "_free"]' \
  -sEXPORTED_RUNTIME_METHODS='["cwrap"]' \
  -sENVIRONMENT=worker \
  -sSINGLE_FILE=1


  Inside sinegen.html, at the bottom:

<script>
  var Module = {
    onRuntimeInitialized: function() {
      const generateSine = Module.cwrap("generate_sine", null,
        ["number", "number", "number", "number", "number"]);

      // Audio setup
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const sampleRate = audioCtx.sampleRate;
      const bufferSize = 1024;

      // Allocate WASM memory for buffer and phase
      const bufferPtr = Module._malloc(bufferSize * 4); // 4 bytes per float
      const phasePtr = Module._malloc(4); // single float phase

      // Initialize phase to 0
      new Float32Array(Module.HEAPF32.buffer, phasePtr, 1)[0] = 0.0;

      // ScriptProcessorNode (simple but slightly outdated — AudioWorklet is better)
      const node = audioCtx.createScriptProcessor(bufferSize, 0, 1);

      node.onaudioprocess = function(e) {
        // Call into WASM to fill buffer
        generateSine(bufferPtr, bufferSize, 440.0, sampleRate, phasePtr);

        // Get output channel data
        const out = e.outputBuffer.getChannelData(0);

        // Copy WASM buffer to JS Float32Array
        const wasmBuf = new Float32Array(Module.HEAPF32.buffer, bufferPtr, bufferSize);
        out.set(wasmBuf);
      };

      node.connect(audioCtx.destination);

      // Start after a user gesture (required by most browsers)
      document.body.innerHTML += "<button id='start'>Play Sine</button>";
      document.getElementById("start").onclick = () => {
        audioCtx.resume();
      };
    }
  };
</script>

What you’ll hear:
A continuous 440 Hz sine wave after clicking “Play Sine”.