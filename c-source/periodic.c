#include "pattern_header.h"

/*
 * Checks if the sequence has period k (arr[i] == arr[i+k] for all i).
 * Returns 1 if a period <= max_k is found, sets *period.
 */
int is_periodic(float arr[], int size, int *period, Pattern subPatterns[], int max_k) {
    float epsilon = 0.0001f;

    if (size < 4) return 0;

    for (int k = 2; k <= max_k && k <= size / 2; k++) {
        int ok = 1;
        for (int i = 0; i + k < size; i++) {
            if (fabsf(arr[i] - arr[i + k]) > epsilon) {
                ok = 0;
                break;
            }
        }
        if (ok) {
            *period = k;
            return 1;
        }
    }

    return 0;
}
