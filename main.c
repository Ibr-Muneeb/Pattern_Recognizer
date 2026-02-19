#include "pattern_header.h"

int main() {
    float arr[256] = {};
    int size = 5;

    sequence(arr, size);

    float diff = is_arithmetic(arr, size);
    float ratio = is_geometric(arr, size);
    float expo = is_exponential(arr, size);

    float table[256][256];
    int degree = build_difference_table(arr, size, table);

    if (diff != 0) {
        printf("The pattern is arithmetic: f(n) = f(n-1) + %.2f\n", diff);
    } else if (ratio != 0) {
        printf("The pattern is geometric: f(n) = f(n-1) * %.2f\n", ratio);
    } else if (expo != 0) {
        printf("The pattern is exponential: f(n) = n^%.0f\n", expo);
    } else if (degree > 0) {
        printf("The pattern is polynomial of degree %d\n", degree);
        print_polynomial(table, degree);
    } else {
        printf("No recognizable pattern.\n");
    }

    return 0;
}
