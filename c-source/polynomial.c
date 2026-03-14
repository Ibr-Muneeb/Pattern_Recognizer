#include "pattern_header.h"

/* ── is_polynomial ──────────────────────────────────────────
 * Returns the polynomial degree if the sequence of finite differences
 * eventually becomes constant, 0 otherwise.
 */
float is_polynomial(float arr[], int size) {
    float epsilon = 0.0001f;
    float temp[256];
    int   sz = size;

    for (int i = 0; i < sz; i++) temp[i] = arr[i];

    for (int degree = 1; sz > 1; degree++) {
        for (int i = 0; i < sz - 1; i++)
            temp[i] = temp[i + 1] - temp[i];
        sz--;

        int constant = 1;
        for (int i = 0; i < sz - 1; i++) {
            if (fabsf(temp[i] - temp[i + 1]) > epsilon) {
                constant = 0;
                break;
            }
        }
        if (constant) return (float)degree;
    }
    return 0;
}

/* ── build_difference_table ─────────────────────────────────
 * Fills a 2-D difference table and returns the detected degree.
 */
int build_difference_table(float arr[], int size, float table[256][256]) {
    float epsilon = 0.0001f;

    for (int i = 0; i < size; i++) table[0][i] = arr[i];

    int degree = 0;

    for (int level = 1; level < size; level++) {
        for (int i = 0; i < size - level; i++)
            table[level][i] = table[level-1][i+1] - table[level-1][i];

        int constant = 1;
        for (int i = 0; i < size - level - 1; i++) {
            if (fabsf(table[level][i] - table[level][i+1]) > epsilon) {
                constant = 0;
                break;
            }
        }
        if (constant) { degree = level; break; }
    }

    return degree;
}

/* ── factorial ───────────────────────────────────────────── */
float factorial(int n) {
    float result = 1.0f;
    for (int i = 2; i <= n; i++) result *= (float)i;
    return result;
}

/* ── multiply_poly ───────────────────────────────────────── */
void multiply_poly(float a[], int degA, float b[], int degB, float result[]) {
    for (int i = 0; i <= degA + degB; i++) result[i] = 0.0f;
    for (int i = 0; i <= degA; i++)
        for (int j = 0; j <= degB; j++)
            result[i + j] += a[i] * b[j];
}

/* ── print_polynomial_expanded ───────────────────────────── */
void print_polynomial_expanded(float table[256][256], int degree) {
    float final_coeffs[256] = {0};

    for (int i = 0; i <= degree; i++) {
        /* Build falling factorial (n-1)(n-2)...(n-i) as polynomial in n */
        float term[256] = {0};
        term[0] = 1.0f;
        int term_degree = 0;

        for (int j = 0; j < i; j++) {
            float factor[2];
            factor[0] = -(float)(j + 1);   /* constant part  */
            factor[1] =  1.0f;             /* n coefficient  */

            float tmp[256] = {0};
            multiply_poly(term, term_degree, factor, 1, tmp);
            term_degree++;
            for (int k = 0; k <= term_degree; k++) term[k] = tmp[k];
        }

        float coef = table[i][0] / factorial(i);
        for (int k = 0; k <= term_degree; k++)
            final_coeffs[k] += coef * term[k];
    }

    printf("  f(n) = ");
    int first = 1;
    for (int i = degree; i >= 0; i--) {
        if (fabsf(final_coeffs[i]) < 0.0001f) continue;
        if (!first && final_coeffs[i] >= 0) printf("+ ");
        if      (i == 0) printf("%.4g ", final_coeffs[i]);
        else if (i == 1) printf("%.4gn ", final_coeffs[i]);
        else             printf("%.4gn^%d ", final_coeffs[i], i);
        first = 0;
    }
    printf("\n");
}
