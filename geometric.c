#include "pattern_header.h"

int is_geometric(int arr[], int size) {
    int fraction = arr[1] / arr[0];

    for (int i = 0; i < size - 1; i++) {
        if (arr[i+1] / arr[i] == fraction) {
            fraction = arr[1] / arr[0];
        } else {
            fraction = 0;
        }
    }
    
    return fraction;
}