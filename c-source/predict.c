#include "pattern_header.h"

/*
 * Given the best-fit Pattern and a 1-based index n, return the predicted value.
 */
float predict_term(Pattern best, int n) {
    switch (best.type) {

        case ARITHMETIC:
            /* f(n) = a1 + (n-1)*d */
            return best.params[1] + (float)n * best.params[0];

        case GEOMETRIC:
            /* f(n) = a1 * r^(n-1) */
            return best.params[1] * (float)pow(best.params[0], n - 1);

        case EXPONENTIAL:
            /* f(n) = n^k */
            return (float)pow(n, best.params[0]);

        case EXP_OFFSET:
            /* f(n) = A * r^(n-1) + C  (n 1-based, stored 0-based) */
            return best.params[0] * (float)pow(best.params[1], n - 1) + best.params[2];

        case POLYNOMIAL:
            /* Use Newton forward difference formula — stored in poly_coeffs
             * but we reconstruct via predict_term not knowing the table here.
             * Fallback: caller should handle POLYNOMIAL separately. */
            return 0.0f;

        case FACTORIAL:
            /* f(n) = n! + C */
            return factorial(n) + best.params[0];

        case RECURRENCE:
            /* Cannot predict directly without full history; unsupported here */
            return 0.0f;

        case ALTERNATING:
            /* Odd positions: arithmetic with diff params[0], base params[2]
             * Even positions: arithmetic with diff params[1], base params[3] */
            if (n % 2 == 1) {
                int k = (n + 1) / 2;   /* which odd term */
                return best.params[2] + (float)(k - 1) * best.params[0];
            } else {
                int k = n / 2;
                return best.params[3] + (float)(k - 1) * best.params[1];
            }

        case FLOOR_SEQ:
            return floorf(best.params[0] * (float)n + best.params[1]);

        case CEIL_SEQ:
            return ceilf(best.params[0] * (float)n + best.params[1]);

        case TRIANGULAR:
            return (float)n * (float)(n + 1) / 2.0f + best.params[0];

        case FIBONACCI:
            /* Recurrence a(n)=a(n-1)+a(n-2), stored a0 and a1 */
            {
                float a = best.params[0], b = best.params[1];
                for (int i = 2; i <= n; i++) {
                    float c = a + b; a = b; b = c;
                }
                return (n == 0) ? best.params[0] : b;
            }

        case PERIODIC:
            /* params[0] = period, params[1..] = one cycle */
            {
                int period = (int)best.params[0];
                int idx    = ((n - 1) % period);
                return best.params[1 + idx];
            }

        default:
            return 0.0f;
    }
}
