#include "pattern_header.h"

/*
 * Checks whether arr[i] == (i+1)! + C for some constant C.
 * C is inferred from the first term: C = arr[0] - 1!.
 */
int is_factorial_pattern(float arr[], int size, float *C) {
    float epsilon = 0.001f;

    if (size < 2) return 0;

    *C = arr[0] - factorial(1);

    for (int i = 0; i < size; i++) {
        float expected = factorial(i + 1) + *C;
        if (fabsf(expected - arr[i]) > epsilon) return 0;
    }

    return 1;
}
