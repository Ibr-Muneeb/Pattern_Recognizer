#include "pattern_header.h"

#define MAX_SIZE 256


/* add alternating, floor and prime based */

int main() {
    Pattern best;
    best.complexity = 1000;

    float arr[MAX_SIZE];
    
    int size = sequence(arr, MAX_SIZE);

    if (size < 2) {
        printf("Need at least 2 numbers.\n");
        return 1;
    }

    float diff = is_arithmetic(arr, size);
    if (diff != 0) {
        Pattern p;
        p.type = ARITHMETIC;
        p.params[0] = diff;
        p.complexity = 1;

        if (p.complexity < best.complexity)
            best = p;
    }
    
    float ratio = is_geometric(arr, size);
    if (ratio != 0) {
        Pattern p;
        p.type = GEOMETRIC;
        p.params[0] = ratio;
        p.params[1] = arr[0];
        p.complexity = 2;

        if (p.complexity < best.complexity)
            best = p;
    }

    float expo = is_exponential(arr, size);
    if (expo != 0) {
        Pattern p;
        p.type = EXPONENTIAL;  
        p.params[0] = expo;     
        p.complexity = 5;       

        if (p.complexity < best.complexity)
            best = p;
    }


    float table[MAX_SIZE][MAX_SIZE];
    int degree = build_difference_table(arr, size, table);
    if (degree > 0) {
        Pattern p;
        p.type = POLYNOMIAL;
        p.degree = degree;
        p.complexity = 6 + degree;

        if (p.complexity < best.complexity)
            best = p;
    }

    
    float A, B;
    int recurrence = is_recurrence(arr, size, &A, &B);
    if (recurrence) {
    Pattern p;
    p.type = RECURRENCE;
    p.params[0] = A;
    p.params[1] = B;
    p.complexity = 10;

    if (p.complexity < best.complexity)
        best = p;
    }


    float C;
    int fact = is_factorial_pattern(arr, size, &C);
    if (fact) {
        Pattern p;
        p.type = FACTORIAL;
        p.params[0] = C;     
        p.complexity = 8;    

        if (p.complexity < best.complexity) {
            best = p;
        }
    }
    
    Pattern oddP, evenP;

    if (is_alternating(arr, size, &oddP, &evenP)) {
        Pattern p;
        p.type = ALTERNATING;
        p.complexity = 3; 

        p.params[0] = oddP.params[0];
        p.params[1] = evenP.params[0];

        if (p.complexity < best.complexity) {
            best = p;
        }
    }



    switch (best.type) {

        case ARITHMETIC:
            printf("Arithmetic sequence\n");
            printf("f(n) = %.2fn + %.2f\n",
            best.params[0],
            arr[0] - best.params[0]);
            break;

        case GEOMETRIC:
            printf("Geometric sequence\n");
            printf("f(n) = %.2f * %.2f^(n-1)\n",
            best.params[1],
            best.params[0]);
            break;
        case EXPONENTIAL:
            printf("Power sequence detected\n");
            printf("f(n) = n^%.0f\n", best.params[0]);
            break;

        case FACTORIAL:
            printf("Factorial-based sequence detected\n");
            printf("f(n) = n! + %.2f\n", best.params[0]);
            break;

        case POLYNOMIAL:
            printf("Polynomial of degree %d\n", best.degree);
            print_polynomial_expanded(table, best.degree);
            break;

        case RECURRENCE:
            printf("Second-order recurrence\n");
            printf("f(n) = %.2f*f(n-1) + %.2f*f(n-2)\n", best.params[0], best.params[1]);
            break;
            
        case ALTERNATING:
            printf("Alternating arithmetic pattern detected\n");
            printf("Odd terms: arithmetic diff %.2f\n", best.params[0]);
            printf("Even terms: arithmetic diff %.2f\n", best.params[1]);
            break;

        default:
            printf("No recognizable simple pattern\n");
    }

    return 0;
}
