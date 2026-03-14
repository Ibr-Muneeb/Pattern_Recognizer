#include "pattern_header.h"

/*
 * Returns the common difference if arr[] is arithmetic, 0 otherwise.
 * Handles the constant sequence (diff == 0) by returning a tiny sentinel?
 * No — a constant sequence IS arithmetic with diff 0, but we return 0 to
 * mean "not detected", so we special-case it: return the diff only when
 * the whole array is consistent. We let main treat diff==0 as constant.
 *
 * Bug fix from original: the inner reset `difference = arr[1]-arr[0]`
 * was inside the success branch, which is a no-op and misleading.
 */
float is_arithmetic(float arr[], int size) {
    if (size < 2) return 0;

    float difference = arr[1] - arr[0];
    float epsilon    = 0.0001f;

    for (int i = 0; i < size - 1; i++) {
        float d = arr[i + 1] - arr[i];
        if (fabsf(d - difference) > epsilon) {
            return 0;
        }
    }

    /* Return a tiny non-zero sentinel for constant sequences so callers
       can distinguish "not arithmetic" from "arithmetic with diff 0". */
    if (fabsf(difference) < epsilon)
        return 1e-9f;   /* constant sequence */

    return difference;
}
