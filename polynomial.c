#include "pattern_header.h"

float is_polynomial(float arr[], int size) {
    float epsilon = 0.0001f;

    float temp[256];
    
    for (int i = 0; i < size; i++) {
        temp[i] = arr[i];
    }

    int degree = 0;

    while (size > 1) {
        int constant = 1;

        for (int i = 0; i < size - 1; i++) {
            temp[i] = temp[i + 1] - temp[i];
        }

        size--;
        degree++;

        for (int i = 0; i < size - 1; i++) {
            if (fabsf(temp[i] - temp[i + 1]) > epsilon) {
                constant = 0;
                break;
            }
        }

        if (constant) {
            return degree;
        }
    }

    return 0; 
}

int build_difference_table(float arr[], int size, float table[256][256]) {
    float epsilon = 0.0001f;

    for (int i = 0; i < size; i++) {
        table[0][i] = arr[i];
    }

    int degree = 0;

    for (int level = 1; level < size; level++) {

        for (int i = 0; i < size - level; i++) {
            table[level][i] = table[level - 1][i + 1] - table[level - 1][i];
        }

        int constant = 1;
        for (int i = 0; i < size - level - 1; i++) {
            if (fabsf(table[level][i] - table[level][i + 1]) > epsilon) {
                constant = 0;
                break;
            }
        }

        if (constant) {
            degree = level;
            break;
        }
    }

    return degree;
}

float factorial(int n) {
    float result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

void print_polynomial(float table[256][256], int degree) {
    printf("f(n) = %.2f", table[0][0]);

    for (int i = 1; i <= degree; i++) {
        float coef = table[i][0] / factorial(i);

        printf(" + (%.2f)", coef);

        for (int j = 0; j < i; j++) {
            printf("(n-%d)", j+1);
        }
    }

    printf("\n");
}


