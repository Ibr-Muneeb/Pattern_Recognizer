#include "pattern_header.h"

/* ── sequence_input.c ───────────────────────────────────────
 * Reads a comma/space-separated sequence from stdin.
 * Supports fractional input like "1/3".
 */
int sequence(float *arr, int max_size) {
    char buffer[4096];

    printf("Enter your sequence (comma or space separated): ");
    fflush(stdout);

    if (!fgets(buffer, sizeof(buffer), stdin)) {
        printf("Error reading input.\n");
        return 0;
    }

    int   count = 0;
    char *token = strtok(buffer, ", \t\n");

    while (token != NULL && count < max_size) {
        char *slash = strchr(token, '/');
        if (!slash) {
            arr[count] = (float)atof(token);
        } else {
            *slash = '\0';
            int num = atoi(token);
            int den = atoi(slash + 1);
            arr[count] = (den != 0) ? (float)num / den : 0.0f;
        }
        count++;
        token = strtok(NULL, ", \t\n");
    }

    return count;
}
