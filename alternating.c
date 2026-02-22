#include "pattern_header.h"

int is_alternating(float arr[], int size, Pattern *oddPattern, Pattern *evenPattern) {
    if (size < 4) {
        return 0;
    }
    
    float odd[256];
    float even[256];
    int oddCount = 0;
    int evenCount = 0;

    for (int i = 0; i < size; i++) {
        if (i % 2 == 0) {
            odd[oddCount++] = arr[i];
        } else {
            even[evenCount++] = arr[i];
        }
    }

    float diffOdd = is_arithmetic(odd, oddCount);
    float diffEven = is_arithmetic(even, evenCount);

    if (diffOdd != 0 && diffEven != 0) {

        oddPattern->type = ARITHMETIC;
        oddPattern->params[0] = diffOdd;

        evenPattern->type = ARITHMETIC;
        evenPattern->params[0] = diffEven;

        return 1;
    }

    return 0;
}
