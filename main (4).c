#include "pattern_header.h"

int main() {
    float arr[256] = {};
    int size = 5;

    sequence(arr, size);
    
    if (is_arithmetic(arr, size) != 0) {
        printf("The sequence for this pattern is: f(n-1) + %0.2f", is_arithmetic(arr, size));
    } else if (is_geometric(arr, size) != 0) {
        printf("The sequence for this pattern is: f(n-1) * %0.2f", is_geometric(arr, size));
    } else {
        printf("There is no pattern to this sequence");
    }

    return 0;
}
