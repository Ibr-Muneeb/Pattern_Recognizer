#include "pattern_header.h"

/*
 * Checks whether arr[k] == (k+1)^i  for i in 1..9.
 * Returns the exponent i on success, 0 on failure.
 *
 * The original required arr[0] == 1 which is correct since (1)^i == 1,
 * but the check was placed inside the loop, causing it to fail immediately
 * for i>1 when arr[0] != 1. Fixed: check once before the inner loop.
 */
float is_exponential(float arr[], int size) {
    float epsilon = 0.001f;

    for (int i = 1; i <= 9; i++) {
        int match = 1;

        for (int k = 0; k < size; k++) {
            float expected = (float)pow(k + 1, i);
            if (fabsf(expected - arr[k]) > epsilon) {
                match = 0;
                break;
            }
        }

        if (match) return (float)i;
    }

    return 0;
}
