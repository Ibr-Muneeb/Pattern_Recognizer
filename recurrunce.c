#include "pattern_header.h"

int is_recurrence(float arr[], int size, float *A, float *B) {
    float epsilon = 0.0001f;

    if (size < 4)
        return 0;

    float a0 = arr[0];
    float a1 = arr[1];
    float a2 = arr[2];
    float a3 = arr[3];

    float determinant = (a1 * a1) - (a0 * a2);

    if (fabsf(determinant) < epsilon)
        return 0; 

    *A = (a2 * a1 - a3 * a0) / determinant;
    *B = (a3 * a1 - a2 * a2) / determinant;

    for (int i = 2; i < size; i++) {
        float expected = (*A) * arr[i - 1] + (*B) * arr[i - 2];

        if (fabsf(expected - arr[i]) > epsilon)
            return 0;
    }

    return 1;
}
