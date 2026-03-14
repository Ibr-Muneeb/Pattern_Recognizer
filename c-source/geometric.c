#include "pattern_header.h"

/*
 * Returns the common ratio if arr[] is geometric, 0 otherwise.
 * Bug fix: original reset ratio inside the loop body unnecessarily.
 * Also guards against division by zero.
 */
float is_geometric(float arr[], int size) {
    if (size < 2)        return 0;
    if (arr[0] == 0.0f)  return 0;   /* undefined ratio */

    float ratio   = arr[1] / arr[0];
    float epsilon = 0.0001f;

    for (int i = 0; i < size - 1; i++) {
        if (fabsf(arr[i]) < epsilon) return 0;   /* zero term, skip */

        float r = arr[i + 1] / arr[i];
        if (fabsf(r - ratio) > epsilon) {
            return 0;
        }
    }

    return ratio;
}
