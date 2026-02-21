#include "pattern_header.h"

int sequence(float *arr, int max_size) {
    char buffer[1024];

    printf("Enter your sequence separated by commas: ");

    if (!fgets(buffer, sizeof(buffer), stdin)) {
        printf("Error reading input.\n");
        return 0;
    }

    int count = 0;
    char *token = strtok(buffer, ", \n");

    while (token != NULL && count < max_size) {
        char *slash_pos = strchr(token, '/');

        if (slash_pos == NULL) {
            arr[count] = atof(token);
        } else {
            *slash_pos = '\0';
            int numerator = atoi(token);
            int denominator = atoi(slash_pos + 1);
            arr[count] = (float)numerator / denominator;
        }

        count++;
        token = strtok(NULL, ", \n");
    }

    return count;
}


