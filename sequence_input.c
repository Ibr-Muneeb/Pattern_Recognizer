#include "pattern_header.h"

void sequence(float *arr, int size) {
    char buffer[256];
    char *slash_pos;

    printf("Please enter 5 integers of your sequence: ");
    if (scanf("%s", buffer) != 1) {
        printf("Error reading input.\n");
        return;
    }
    
    char *one_str = strtok(buffer, ",");
    char *two_str = strtok(NULL, ",");
    char *three_str = strtok(NULL, ",");
    char *four_str = strtok(NULL, ",");
    char *five_str = strtok(NULL, ",");

    char *strings[] = {one_str, two_str, three_str, four_str, five_str}; 

    for (int i = 0; i < size; i++) {
        slash_pos = strchr(strings[i], '/');
    
        if (slash_pos == NULL) {
            arr[i] = atof(strings[i]);
        } else {
            *slash_pos = '\0'; 
    
            int numerator = atoi(strings[i]);
            int denominator = atoi(slash_pos + 1); 
            
            arr[i] = (float)numerator / denominator; 
        }
    }
}


