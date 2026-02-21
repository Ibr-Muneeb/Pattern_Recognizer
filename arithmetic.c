#include "pattern_header.h"

float is_arithmetic(float arr[], int size) {
    float difference = arr[1] - arr[0];
    float epsilon = 0.00001f;

    for (int i = 0; i < size - 1; i++) {
        if (fabsf((arr[i+1] - arr[i]) - difference) < epsilon) {
            difference = arr[1] - arr[0];
        } else {
            return 0;
        }
    }
    
    return difference;
}
