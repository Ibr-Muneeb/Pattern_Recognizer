#include "pattern_header.h"

/* ── Terminal width ──────────────────────────────────────── */
#define BOX_WIDTH 60

/* UTF-8 box-drawing strings */
#define S_HORIZ  "\xe2\x94\x80"   /* ─ */
#define S_VERT   "\xe2\x94\x82"   /* │ */
#define S_TL     "\xe2\x94\x8c"   /* ┌ */
#define S_TR     "\xe2\x94\x90"   /* ┐ */
#define S_BL     "\xe2\x94\x94"   /* └ */
#define S_BR     "\xe2\x94\x98"   /* ┘ */
#define S_ML     "\xe2\x94\x9c"   /* ├ */
#define S_MR     "\xe2\x94\xa4"   /* ┤ */

/* ── Box-drawing helpers ─────────────────────────────────── */
static void print_line(const char *left, const char *fill,
                       const char *right, int width) {
    printf("%s", left);
    for (int i = 0; i < width - 2; i++) printf("%s", fill);
    printf("%s\n", right);
}

static void print_center(const char *text) {
    int len       = (int)strlen(text);
    int left_pad  = (BOX_WIDTH - 2 - len) / 2;
    int right_pad = BOX_WIDTH - 2 - len - left_pad;
    if (left_pad  < 0) left_pad  = 0;
    if (right_pad < 0) right_pad = 0;
    printf("%s%*s%s%*s%s\n", S_VERT,
           left_pad, "", text, right_pad, "", S_VERT);
}

static void print_blank_row(void) { print_center(""); }

/* ── Banner ──────────────────────────────────────────────── */
void print_banner(void) {
    printf("\n");
    print_line(S_TL, S_HORIZ, S_TR, BOX_WIDTH);
    print_center("  SEQUENCE PATTERN DETECTOR  ");
    print_line(S_BL, S_HORIZ, S_BR, BOX_WIDTH);
    printf("\n");
}

/* ── Pattern type name ───────────────────────────────────── */
static const char *type_name(int type) {
    switch (type) {
        case ARITHMETIC:  return "Arithmetic";
        case GEOMETRIC:   return "Geometric";
        case EXPONENTIAL: return "Power  (n^k)";
        case EXP_OFFSET:  return "Exponential with Offset";
        case POLYNOMIAL:  return "Polynomial";
        case FACTORIAL:   return "Factorial-based";
        case RECURRENCE:  return "Linear Recurrence (order 2)";
        case ALTERNATING: return "Alternating Arithmetic";
        case PERIODIC:    return "Periodic";
        case FLOOR_SEQ:   return "Floor  \xe2\x8c\x8a An+B \xe2\x8c\x8b";
        case CEIL_SEQ:    return "Ceiling \xe2\x8c\x88 An+B \xe2\x8c\x89";
        case TRIANGULAR:  return "Triangular Numbers";
        case FIBONACCI:   return "Fibonacci-like";
        default:          return "Unknown";
    }
}

/* ── Main result box ─────────────────────────────────────── */
void print_result_box(Pattern best, float arr[], int size,
                      float table[256][256]) {
    char buf[256];

    /* Top border */
    print_line(S_TL, S_HORIZ, S_TR, BOX_WIDTH);

    /* Pattern type */
    print_center(type_name(best.type));
    print_line(S_ML, S_HORIZ, S_MR, BOX_WIDTH);
    print_blank_row();

    /* Formula */
    switch (best.type) {

        case ARITHMETIC:
            if (fabsf(best.params[0]) < 1e-8f)
                snprintf(buf, sizeof(buf), "f(n) = %.4g  (constant)", arr[0]);
            else if (fabsf(best.params[1]) < 0.0001f)
                snprintf(buf, sizeof(buf), "f(n) = %.4g * n", best.params[0]);
            else
                snprintf(buf, sizeof(buf), "f(n) = %.4g*n %+.4g",
                         best.params[0], best.params[1]);
            print_center(buf);
            snprintf(buf, sizeof(buf), "common diff = %.4g", best.params[0]);
            print_center(buf);
            break;

        case GEOMETRIC:
            snprintf(buf, sizeof(buf), "f(n) = %.4g * %.4g^(n-1)",
                     best.params[1], best.params[0]);
            print_center(buf);
            snprintf(buf, sizeof(buf), "ratio = %.4g", best.params[0]);
            print_center(buf);
            break;

        case EXPONENTIAL:
            snprintf(buf, sizeof(buf), "f(n) = n^%.0f", best.params[0]);
            print_center(buf);
            break;

        case EXP_OFFSET:
            snprintf(buf, sizeof(buf), "f(n) = %.4g * %.4g^(n-1) %+.4g",
                     best.params[0], best.params[1], best.params[2]);
            print_center(buf);
            break;

        case POLYNOMIAL:
            print_center("(polynomial formula)");
            /* delegate to existing function, redirect output inline */
            printf("\u2502  ");
            print_polynomial_expanded(table, best.degree);
            /* fix: print_polynomial_expanded already writes a line; we just
               ensure the box border is printed around it in main instead */
            break;

        case FACTORIAL:
            if (fabsf(best.params[0]) < 0.001f)
                snprintf(buf, sizeof(buf), "f(n) = n!");
            else
                snprintf(buf, sizeof(buf), "f(n) = n! %+.4g", best.params[0]);
            print_center(buf);
            break;

        case RECURRENCE:
            snprintf(buf, sizeof(buf), "f(n) = %.4g*f(n-1) %+.4g*f(n-2)",
                     best.params[0], best.params[1]);
            print_center(buf);
            snprintf(buf, sizeof(buf), "seed: f(1)=%.4g, f(2)=%.4g",
                     arr[0], arr[1]);
            print_center(buf);
            break;

        case ALTERNATING:
            snprintf(buf, sizeof(buf),
                     "Odd  terms: diff = %.4g, start = %.4g",
                     best.params[0], best.params[2]);
            print_center(buf);
            snprintf(buf, sizeof(buf),
                     "Even terms: diff = %.4g, start = %.4g",
                     best.params[1], best.params[3]);
            print_center(buf);
            break;

        case PERIODIC: {
            int period = (int)best.params[0];
            snprintf(buf, sizeof(buf), "period = %d", period);
            print_center(buf);
            /* show one cycle */
            char cycle[256] = "cycle: [";
            for (int i = 0; i < period; i++) {
                char tmp[32];
                snprintf(tmp, sizeof(tmp), "%.4g", best.params[1 + i]);
                strncat(cycle, tmp, sizeof(cycle) - strlen(cycle) - 1);
                if (i < period - 1)
                    strncat(cycle, ", ", sizeof(cycle) - strlen(cycle) - 1);
            }
            strncat(cycle, "]", sizeof(cycle) - strlen(cycle) - 1);
            print_center(cycle);
            break;
        }

        case FLOOR_SEQ:
            snprintf(buf, sizeof(buf),
                     "f(n) = \xe2\x8c\x8a %.4g*n %+.4g \xe2\x8c\x8b",
                     best.params[0], best.params[1]);
            print_center(buf);
            break;

        case CEIL_SEQ:
            snprintf(buf, sizeof(buf),
                     "f(n) = \xe2\x8c\x88 %.4g*n %+.4g \xe2\x8c\x89",
                     best.params[0], best.params[1]);
            print_center(buf);
            break;

        case TRIANGULAR:
            if (fabsf(best.params[0]) < 0.001f)
                snprintf(buf, sizeof(buf), "f(n) = n*(n+1)/2");
            else
                snprintf(buf, sizeof(buf), "f(n) = n*(n+1)/2 %+.4g",
                         best.params[0]);
            print_center(buf);
            break;

        case FIBONACCI:
            snprintf(buf, sizeof(buf), "f(n) = f(n-1) + f(n-2)");
            print_center(buf);
            snprintf(buf, sizeof(buf), "seed: f(1)=%.4g, f(2)=%.4g",
                     arr[0], arr[1]);
            print_center(buf);
            break;

        default:
            print_center("No recognizable simple pattern found.");
            break;
    }

    print_blank_row();
    print_line(S_BL, S_HORIZ, S_BR, BOX_WIDTH);
    printf("\n");
}
