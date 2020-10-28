# Error object

error.h

```cpp

#pragma once
#include <stdio.h>

struct error
{
    /*pointer to the buffer that will receive the error message*/
    char* message;

    /*size of the buffer pointed by message*/
    int capacity; 
};

/*
  The seterror function returns the number of characters that are written,
  not counting the terminating null character.

  If the buffer size specified by er->capacity isn't sufficiently large to contain
  the output specified by format and argptr, the return value of seterror is the
  number of characters that would be written, not counting the null character,
  if er->capacity were sufficiently large.

  If the return value is greater than count - 1, the output has been truncated.

  A return value of -1 indicates that an encoding error has occurred.
*/
int seterror(struct error* er, _In_z_ _Printf_format_string_ const char* fmt, ...);

/*Return true if the error object is not empty*/
#define haserror(er) ((er)->message[0] != 0)

```


error.c

```cpp
#include <stdio.h>
#include <stdarg.h> 
#include <assert.h>
#include "error.h"

/*
  The seterror function returns the number of characters that are written,
  not counting the terminating null character. 
  
  If the buffer size specified by er->capacity isn't sufficiently large to contain 
  the output specified by format and argptr, the return value of seterror is the 
  number of characters that would be written, not counting the null character, 
  if er->capacity were sufficiently large.
  
  If the return value is greater than count - 1, the output has been truncated. 
  
  A return value of -1 indicates that an encoding error has occurred.
*/
int seterror(struct error* er, _In_z_ _Printf_format_string_  const char* fmt, ...)
{
    /*the usage follow a pattern that the error is set just once*/
    assert(er->message[0] == 0);

    va_list args;
    va_start(args, fmt);
    int n = vsnprintf(er->message, er->capacity, fmt, args);
    va_end(args);


    /*maybe you should know that your message has been truncated?*/
    //assert(n > er->capacity - 1);

    return n;
}

```

Usage:

```cpp

#include "error.h"
#include <stdbool.h>
#include <assert.h>
#include <string.h>

bool F(struct error* e)
{
    seterror(e, "teste");

    return haserror(e);
}

void Test1()
{
    struct error e = { .message = (char[4]) {0}, .capacity = 4 };
    int n = seterror(&e, "te");
    assert(strcmp(e.message, "te") == 0);
    assert(n == 2);
}

void Test2()
{
    struct error e = { .message = (char[4]) {0}, .capacity = 4 };
    int n = seterror(&e, "teste");
    assert(strcmp(e.message, "tes") == 0);
    assert(n == 5);
    assert(n > e.capacity - 1);
}


void Test3()
{
    struct error e = { .message = (char[6]) {0}, .capacity = 6 };
    int n = seterror(&e, "teste");
    assert(strcmp(e.message, "teste") == 0);
    assert(n == 5);
    assert(n == e.capacity - 1);
}

bool F1(struct error* e)
{
    seterror(e, "error!");
    return haserror(e);
}

bool F2(struct error* e)
{
    if (F1(e))
    {
    }
    return haserror(e);
}

int main()
{
    Test1();
    Test2();
    Test3();    

    struct error e = { .message = (char[100]) {0}, .capacity = 100 };
    if (F2(&e))
    {
        printf("%s\n", e.message);
    }
} 

```
