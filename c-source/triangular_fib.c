#include "pattern_header.h"

/*
 * Triangular numbers: T(n) = n*(n+1)/2 + C
 * Check: second differences should be constant 1.
 */
int is_triangular(float arr[], int size, float *C) {
    if (size < 3) return 0;

    float epsilon = 0.001f;

    /* Build second differences */
    for (int i = 0; i < size - 2; i++) {
        float d2 = (arr[i + 2] - arr[i + 1]) - (arr[i + 1] - arr[i]);
        if (fabsf(d2 - 1.0f) > epsilon) return 0;
    }

    /* If we reach here, it's triangular. Compute C from first term:
       arr[0] = 1*(1+1)/2 + C = 1 + C => C = arr[0] - 1 */
    *C = arr[0] - 1.0f;
    return 1;
}

/*
 * Fibonacci-like: arr[n] = arr[n-1] + arr[n-2]
 * (Not necessarily starting at 1,1 — just the recurrence.)
 */
int is_fibonacci(float arr[], int size) {
    if (size < 4) return 0;

    float epsilon = 0.001f;

    for (int i = 2; i < size; i++) {
        if (fabsf((arr[i - 1] + arr[i - 2]) - arr[i]) > epsilon) return 0;
    }

    return 1;
}
