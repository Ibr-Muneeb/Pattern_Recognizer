CC      = gcc
CFLAGS  = -Wall -Wextra -std=c11 -O2
LDFLAGS = -lm

# Added .exe extension for Windows compatibility
TARGET  = pattern_detector.exe

SRCS = main.c \
       arithmetic.c \
       geometric.c \
       exponential.c \
       exp_offset.c \
       polynomial.c \
       factorial.c \
       recurrence.c \
       alternating.c \
       periodic.c \
       floor_ceil.c \
       triangular_fib.c \
       predict.c \
       sequence_input.c \
       output.c

OBJS = $(SRCS:.c=.o)

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

%.o: %.c pattern_header.h
	$(CC) $(CFLAGS) -c -o $@ $<

clean:
	@if exist *.o del /f /q *.o
	@if exist $(TARGET) del /f /q $(TARGET)
