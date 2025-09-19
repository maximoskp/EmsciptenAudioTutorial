#include <math.h>

#define TWO_PI 6.28318530717958647692

// Generate a sine wave into the buffer
// freq = frequency in Hz
// sampleRate = sampling rate
// phase = pointer to phase accumulator (keeps continuity across calls)
void generate_sine(float* buffer, int length, float freq, float sampleRate, float* phase) {
    float increment = TWO_PI * freq / sampleRate;
    float p = *phase;
    for (int i = 0; i < length; i++) {
        buffer[i] = sinf(p);
        p += increment;
        if (p >= TWO_PI) p -= TWO_PI; // wrap
    }
    *phase = p; // update caller’s phase
}
