#ifndef PATTERN_H
#define PATTERN_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h> 

#define CONSTANT 0
#define ARITHMETIC 1
#define GEOMETRIC 2
#define EXPONENTIAL 3
#define POLYNOMIAL 4
#define FACTORIAL 5
#define RECURRENCE 6


typedef struct {
    int type;
    float params[4];   
    int degree;
    int complexity;
} Pattern;

float is_arithmetic(float arr[], int size);
float is_geometric(float arr[], int size);
int sequence(float *arr, int max_size);
float is_exponential(float arr[], int size);
float is_polynomial(float arr[], int size);
int build_difference_table(float arr[], int size, float table[256][256]);
float factorial(int n);
void print_polynomial_expanded(float table[256][256], int degree);
void multiply_poly(float a[], int degA, float b[], int degB, float result[]);
int is_recurrence(float arr[], int size, float *A, float *B);
int is_factorial_pattern(float arr[], int size, float *C);

#endif