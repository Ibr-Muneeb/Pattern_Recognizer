#include "pattern_header.h"

/*
 * Alternating sequence: odd-indexed and even-indexed terms each form
 * their own arithmetic sequence.
 */
int is_alternating(float arr[], int size, Pattern *oddPattern, Pattern *evenPattern) {
    if (size < 4) return 0;

    float odd[256], even[256];
    int oddCount = 0, evenCount = 0;

    for (int i = 0; i < size; i++) {
        if (i % 2 == 0)
            odd[oddCount++]  = arr[i];
        else
            even[evenCount++] = arr[i];
    }

    if (oddCount < 2 || evenCount < 2) return 0;

    float diffOdd  = is_arithmetic(odd,  oddCount);
    float diffEven = is_arithmetic(even, evenCount);

    if (diffOdd != 0 && diffEven != 0) {
        oddPattern->type      = ARITHMETIC;
        oddPattern->params[0] = (fabsf(diffOdd)  < 1e-8f) ? 0.0f : diffOdd;

        evenPattern->type      = ARITHMETIC;
        evenPattern->params[0] = (fabsf(diffEven) < 1e-8f) ? 0.0f : diffEven;

        return 1;
    }

    return 0;
}
