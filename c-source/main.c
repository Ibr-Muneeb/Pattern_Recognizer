#include "pattern_header.h"

/* ── helpers ──────────────────────────────────────────────── */
static void try_update(Pattern *best, Pattern *candidate) {
    if (candidate->complexity < best->complexity)
        *best = *candidate;
}

/* ─────────────────────────────────────────────────────────── */
int main(void) {
    print_banner();

    float arr[MAX_SIZE];
    int   size = sequence(arr, MAX_SIZE);

    if (size < 2) {
        printf("  Need at least 2 numbers. Exiting.\n\n");
        return 1;
    }

    /* Show the input back to the user */
    printf("\n  Input (%d terms): ", size);
    for (int i = 0; i < size && i < 12; i++)
        printf("%.4g%s", arr[i], (i < size - 1) ? ", " : "");
    if (size > 12) printf("...");
    printf("\n\n");

    /* ── Difference table (needed for POLYNOMIAL output) ── */
    float table[MAX_SIZE][MAX_SIZE];
    memset(table, 0, sizeof(table));

    /* ── Best-pattern tracker ────────────────────────────── */
    Pattern best;
    memset(&best, 0, sizeof(best));
    best.type       = UNKNOWN;
    best.complexity = 9999;

    /* ── Run all detectors ───────────────────────────────── */

    /* 1. Arithmetic */
    {
        float diff = is_arithmetic(arr, size);
        if (diff != 0) {
            Pattern p = {0};
            p.type        = ARITHMETIC;
            p.complexity  = 1;
            p.params[0]   = (fabsf(diff) < 1e-8f) ? 0.0f : diff;  /* real diff */
            p.params[1]   = arr[0] - p.params[0];                  /* a0        */
            try_update(&best, &p);
        }
    }

    /* 2. Triangular  (before polynomial — it IS degree-2, but simpler) */
    {
        float C;
        if (is_triangular(arr, size, &C)) {
            Pattern p = {0};
            p.type       = TRIANGULAR;
            p.complexity = 3;
            p.params[0]  = C;
            try_update(&best, &p);
        }
    }

    /* 3. Geometric */
    {
        float ratio = is_geometric(arr, size);
        if (ratio != 0) {
            Pattern p = {0};
            p.type       = GEOMETRIC;
            p.complexity = 2;
            p.params[0]  = ratio;
            p.params[1]  = arr[0];
            try_update(&best, &p);
        }
    }

    /* 4. Alternating */
    {
        Pattern oddP = {0}, evenP = {0};
        if (is_alternating(arr, size, &oddP, &evenP)) {
            Pattern p = {0};
            p.type       = ALTERNATING;
            p.complexity = 3;
            p.params[0]  = oddP.params[0];   /* odd diff  */
            p.params[1]  = evenP.params[0];  /* even diff */
            p.params[2]  = arr[0];           /* odd start */
            p.params[3]  = (size > 1) ? arr[1] : 0.0f; /* even start */
            try_update(&best, &p);
        }
    }

    /* 5. Exponential offset (before plain geometric, it's more specific) */
    {
        float A, r, C;
        if (is_exponential_offset(arr, size, &A, &r, &C)) {
            Pattern p = {0};
            p.type       = EXP_OFFSET;
            p.complexity = 4;
            p.params[0]  = A;
            p.params[1]  = r;
            p.params[2]  = C;
            try_update(&best, &p);
        }
    }

    /* 6. Power sequence: n^k */
    {
        float expo = is_exponential(arr, size);
        if (expo != 0) {
            Pattern p = {0};
            p.type       = EXPONENTIAL;
            p.complexity = 5;
            p.params[0]  = expo;
            try_update(&best, &p);
        }
    }

    /* 7. Polynomial */
    {
        int degree = build_difference_table(arr, size, table);
        if (degree > 0) {
            Pattern p = {0};
            p.type       = POLYNOMIAL;
            p.degree     = degree;
            p.complexity = 6 + degree;
            try_update(&best, &p);
        }
    }

    /* 8. Fibonacci-like */
    {
        if (is_fibonacci(arr, size)) {
            Pattern p = {0};
            p.type       = FIBONACCI;
            p.complexity = 7;
            p.params[0]  = arr[0];
            p.params[1]  = arr[1];
            try_update(&best, &p);
        }
    }

    /* 9. Factorial */
    {
        float C;
        if (is_factorial_pattern(arr, size, &C)) {
            Pattern p = {0};
            p.type       = FACTORIAL;
            p.complexity = 8;
            p.params[0]  = C;
            try_update(&best, &p);
        }
    }

    /* 10. Periodic */
    {
        int     period = 0;
        Pattern sub[8] = {0};
        if (is_periodic(arr, size, &period, sub, 8) && period > 0) {
            Pattern p = {0};
            p.type       = PERIODIC;
            p.complexity = 9;
            p.params[0]  = (float)period;
            for (int i = 0; i < period && i < 7; i++)
                p.params[1 + i] = arr[i];
            try_update(&best, &p);
        }
    }

    /* 11. General recurrence */
    {
        float A, B;
        if (is_recurrence(arr, size, &A, &B)) {
            Pattern p = {0};
            p.type       = RECURRENCE;
            p.complexity = 10;
            p.params[0]  = A;
            p.params[1]  = B;
            try_update(&best, &p);
        }
    }

    /* 12. Floor pattern */
    {
        float A, B;
        if (is_floor_pattern(arr, size, &A, &B)) {
            Pattern p = {0};
            p.type       = FLOOR_SEQ;
            p.complexity = 4;   /* prefer over polynomial for integer seqs */
            p.params[0]  = A;
            p.params[1]  = B;
            try_update(&best, &p);
        }
    }

    /* 13. Ceiling pattern */
    {
        float A, B;
        if (is_ceil_pattern(arr, size, &A, &B)) {
            Pattern p = {0};
            p.type       = CEIL_SEQ;
            p.complexity = 4;
            p.params[0]  = A;
            p.params[1]  = B;
            try_update(&best, &p);
        }
    }

    /* ── Display result ──────────────────────────────────── */
    print_result_box(best, arr, size, table);

    /* ── Prediction menu ─────────────────────────────────── */
    if (best.type == UNKNOWN) {
        printf("  No pattern matched — prediction unavailable.\n\n");
        return 0;
    }

    /* Check if we can predict this type — used implicitly below */

    printf("  What would you like to do?\n");
    printf("  [1] Predict next N terms\n");
    printf("  [2] Get term at specific index\n");
    printf("  [0] Exit\n");
    printf("  Choice: ");

    int choice = 0;
    if (scanf("%d", &choice) != 1) choice = 0;

    if (choice == 1) {
        int N = 0;
        printf("  How many additional terms? ");
        if (scanf("%d", &N) != 1) N = 0;
        if (N < 0)  N = 0;
        if (N > MAX_PREDICT_TERMS) N = MAX_PREDICT_TERMS;

        printf("\n  Next %d term(s):\n  ", N);

        for (int i = size + 1; i <= size + N; i++) {
            float val;

            if (best.type == POLYNOMIAL) {
                /* Newton forward difference prediction */
                int   n   = i - 1;   /* 0-based offset from arr[0] */
                float result = 0.0f;
                float binom = 1.0f;
                for (int k = 0; k <= best.degree; k++) {
                    result += binom * table[k][0];
                    binom  *= (float)(n - k) / (float)(k + 1);
                }
                val = result;
            } else if (best.type == RECURRENCE) {
                /* Extend the array iteratively */
                float *ext = (float*)malloc((size + N) * sizeof(float));
                memcpy(ext, arr, size * sizeof(float));
                for (int j = size; j < size + N; j++)
                    ext[j] = best.params[0] * ext[j-1] + best.params[1] * ext[j-2];
                val = ext[i - 1];
                free(ext);
            } else {
                val = predict_term(best, i);
            }

            printf("f(%d)=%.4g  ", i, val);
            if ((i - size) % 5 == 0) printf("\n  ");
        }
        printf("\n\n");
    }

    if (choice == 2) {
        int index = 0;
        printf("  Enter index n (1-based): ");
        if (scanf("%d", &index) != 1) index = 1;
        if (index < 1)                index = 1;
        if (index > MAX_INDEX_REQUEST) index = MAX_INDEX_REQUEST;

        float val;
        if (best.type == POLYNOMIAL) {
            int   n      = index - 1;
            float result = 0.0f;
            float binom  = 1.0f;
            for (int k = 0; k <= best.degree; k++) {
                result += binom * table[k][0];
                binom  *= (float)(n - k) / (float)(k + 1);
            }
            val = result;
        } else if (best.type == RECURRENCE) {
            float *ext = (float*)malloc((index + 1) * sizeof(float));
            int base = (index <= size) ? index : size;
            memcpy(ext, arr, base * sizeof(float));
            for (int j = base; j < index; j++)
                ext[j] = best.params[0] * ext[j-1] + best.params[1] * ext[j-2];
            val = ext[index - 1];
            free(ext);
        } else {
            val = predict_term(best, index);
        }

        printf("\n  f(%d) = %.6g\n\n", index, val);
    }

    return 0;
}
