#include "pattern_header.h"

int main() {
    float arr[256] = {};
    int size = 5;

    sequence(arr, size);
    
    float diff = is_arithmetic(arr, size);
    float ratio = is_geometric(arr, size);
    float poly = is_polynomial(arr, size);
    
    if (diff != 0) {
        printf("The sequence for this pattern is: f(n-1) + %0.2f", diff);
    } else if (ratio != 0) {
        printf("The sequence for this pattern is: f(n-1) * %0.2f", ratio);
    } else if (poly != 0) {
        printf("The sequence for this pattern is: n^%0.0f", poly);
    } else {
        printf("There is no pattern to this sequence");
    }

    return 0;
}
