#include "pattern_header.h"

float is_geometric(float arr[], int size) {
    float ratio = arr[1] / arr[0];
    float epsilon = 0.00001f;
    
    for (int i = 0; i < size - 1; i++) {
        if (fabsf((arr[i+1] / arr[i]) - ratio) < epsilon) {
            ratio = arr[1] / arr[0];
        } else {
            ratio = 0;
        }
    }
    
    return ratio;
}