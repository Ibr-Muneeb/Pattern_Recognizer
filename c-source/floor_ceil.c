#include "pattern_header.h"

/*
 * floor_pattern: checks if arr[i] == floor(A*(i+1) + B)
 * ceil_pattern:  checks if arr[i] == ceil(A*(i+1) + B)
 *
 * Strategy: try rational A values (p/q) and infer B from first term.
 * We test A = p/q for small p (1..10) and q (1..10), and also negative.
 */

static int _test_floor(float arr[], int size, float A, float B) {
    float epsilon = 0.4999f;   /* floor/ceil are integers; allow half-unit slack */
    for (int i = 0; i < size; i++) {
        float n        = (float)(i + 1);
        float expected = floorf(A * n + B);
        if (fabsf(expected - arr[i]) > epsilon) return 0;
    }
    return 1;
}

static int _test_ceil(float arr[], int size, float A, float B) {
    float epsilon = 0.4999f;
    for (int i = 0; i < size; i++) {
        float n        = (float)(i + 1);
        float expected = ceilf(A * n + B);
        if (fabsf(expected - arr[i]) > epsilon) return 0;
    }
    return 1;
}

int is_floor_pattern(float arr[], int size, float *A, float *B) {
    if (size < 3) return 0;

    for (int p = 1; p <= 12; p++) {
        for (int q = 1; q <= 12; q++) {
            float candidates[2] = { (float)p / q, -(float)p / q };
            for (int s = 0; s < 2; s++) {
                float Ab = candidates[s];
                /* Infer B so that floor(A*1 + B) == arr[0] */
                /* B = arr[0] - A*1, with possible fractional part */
                /* Try B in {arr[0]-A, arr[0]-A+0.5, arr[0]-A-0.5, arr[0]-A+0.1, ...} */
                float base_B = arr[0] - Ab;
                float B_offsets[] = {0.0f, 0.1f, 0.2f, 0.3f, 0.4f,
                                    -0.1f, -0.2f, -0.3f, -0.4f,
                                     0.5f, -0.5f};
                int n_off = (int)(sizeof(B_offsets) / sizeof(B_offsets[0]));
                for (int k = 0; k < n_off; k++) {
                    float Bb = base_B + B_offsets[k];
                    if (_test_floor(arr, size, Ab, Bb)) {
                        *A = Ab;
                        *B = Bb;
                        return 1;
                    }
                }
            }
        }
    }
    return 0;
}

int is_ceil_pattern(float arr[], int size, float *A, float *B) {
    if (size < 3) return 0;

    for (int p = 1; p <= 12; p++) {
        for (int q = 1; q <= 12; q++) {
            float candidates[2] = { (float)p / q, -(float)p / q };
            for (int s = 0; s < 2; s++) {
                float Ab = candidates[s];
                float base_B = arr[0] - Ab;
                float B_offsets[] = {0.0f, 0.1f, 0.2f, 0.3f, 0.4f,
                                    -0.1f, -0.2f, -0.3f, -0.4f,
                                     0.5f, -0.5f};
                int n_off = (int)(sizeof(B_offsets) / sizeof(B_offsets[0]));
                for (int k = 0; k < n_off; k++) {
                    float Bb = base_B + B_offsets[k];
                    if (_test_ceil(arr, size, Ab, Bb)) {
                        *A = Ab;
                        *B = Bb;
                        return 1;
                    }
                }
            }
        }
    }
    return 0;
}
