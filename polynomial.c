#include "pattern_header.h"

float is_polynomial(float arr[], int size) {
    float epsilon = 0.00001f;

    for (int i = 1; i < 10; i++) {
        int match = 1;
        if (arr[0] != 1) {
            return 0;
        }
        
        for (int k = 1; k < size; k++) {
            if (fabsf(pow(k+1, i) - arr[k]) > epsilon) {
                match = 0;
                break;
            }
        }
        
        if (match) {
            return i;
        }
    }
    
    return 0;
}
