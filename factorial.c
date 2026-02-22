#include "pattern_header.h"

int is_factorial_pattern(float arr[], int size, float *C) {
    float epsilon = 0.0001f;

    if (size < 2)
        return 0;

    *C = arr[0] - 1.0f;  

    for (int i = 0; i < size; i++) {
        float expected = factorial(i + 1) + *C;

        if (fabsf(expected - arr[i]) > epsilon)
            return 0;
    }

    return 1;
}
