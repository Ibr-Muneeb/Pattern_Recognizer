#include "pattern_header.h"

int is_exponential_offset(float arr[], int size, float *A, float *r, float *C) {
    if (size < 4) return 0;

    float epsilon = 0.01f;

    /* Candidate bases to try */
    float bases[] = {2.0f, 3.0f, 0.5f, 0.25f, 1.0f/3.0f,
                     -1.0f, -2.0f, 4.0f, 0.1f};
    int n_bases = (int)(sizeof(bases) / sizeof(bases[0]));

    for (int b = 0; b < n_bases; b++) {
        float rb = bases[b];

        if (fabsf(rb - 1.0f) < 1e-6f) continue;

        float Ab = (arr[1] - arr[0]) / (rb - 1.0f);
        float Cb = arr[0] - Ab;

        int match = 1;
        for (int i = 0; i < size; i++) {
            float expected = Ab * (float)pow(rb, i) + Cb;
            if (fabsf(expected - arr[i]) > epsilon) {
                match = 0;
                break;
            }
        }

        if (match) {
            *A = Ab;
            *r = rb;
            *C = Cb;
            return 1;
        }
    }

    return 0;
}
