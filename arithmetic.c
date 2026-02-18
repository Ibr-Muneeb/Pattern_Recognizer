#include "pattern_header.h"

float is_arithmetic(float arr[], int size) {
    float difference = arr[1] - arr[0];

    for (int i = 0; i < size - 1; i++) {
        if (arr[i+1] - arr[i] == difference) {
            difference = arr[1] - arr[0];
        } else {
            difference = 0;
        }
    }
    
    return difference;
}
