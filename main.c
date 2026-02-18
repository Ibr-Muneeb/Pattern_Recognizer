#include "pattern_header.h"

int main() {
    int sequence[256] = {};
    int i;
    
    printf("Please enter 5 integers of your sequence: ");
    for (i = 0; i < 5; i++) {
        scanf("%d,", &sequence[i]);
    }
    
    if (is_arithmetic(sequence, i) != 0) {
        printf("The sequence for this pattern is: f(n-1) + %d", is_arithmetic(sequence, i));
    } else if (is_geometric(sequence, i) != 0) {
        printf("The sequence for this pattern is: f(n-1) * %d", is_geometric(sequence, i));
    } else {
        printf("There is no pattern to this sequence");
    }
}
