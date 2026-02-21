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

void print_polynomial_expanded(float table[256][256], int degree) {
    float final[256] = {0};   // stores final coefficients
    float factorial(int);

    for (int i = 0; i <= degree; i++) {

        // Build (n-1)(n-2)...(n-i)
        float term[256] = {1};  // start with 1
        int term_degree = 0;

        for (int j = 0; j < i; j++) {

            float factor[2];
            factor[0] = -(j + 1);  // constant term
            factor[1] = 1;         // n term

            float temp[256];
            multiply_poly(term, term_degree, factor, 1, temp);

            term_degree++;

            for (int k = 0; k <= term_degree; k++)
                term[k] = temp[k];
        }

        float coef = table[i][0] / factorial(i);

        for (int k = 0; k <= term_degree; k++) {
            final[k] += coef * term[k];
        }
    }

    printf("f(n) = ");

    int first = 1;
    for (int i = degree; i >= 0; i--) {
        if (fabsf(final[i]) < 0.0001f)
            continue;

        if (!first && final[i] >= 0)
            printf("+ ");

        if (i == 0)
            printf("%f ", final[i]);
        else if (i == 1)
            printf("%fn ", final[i]);
        else
            printf("%fn^%d ", final[i], i);

        first = 0;
    }

    printf("\n");
}


void multiply_poly(float a[], int degA, float b[], int degB, float result[]) {
    for (int i = 0; i <= degA + degB; i++)
        result[i] = 0;

    for (int i = 0; i <= degA; i++) {
        for (int j = 0; j <= degB; j++) {
            result[i + j] += a[i] * b[j];
        }
    }
}
