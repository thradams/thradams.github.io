
```cpp
#pragma once
#include <stdarg.h>

struct error
{
    char* str; /*c-string*/
    int size; /*number of chars excluding the 0 at end*/
    int capacity; /*size in bytes including 0 at the end*/
};

struct error* tls_error;
int error(const char* fmt, ...);
```

```cpp
#include <stdio.h>
#include <assert.h>
#include "error.h"

#define thread_local __declspec(thread)

struct error* tls_error;

int error_vafprintf(struct error* error, const char* fmt, va_list args)
{
    int size = 0;
    va_list tmpa;
    va_copy(tmpa, args);
    size = vsnprintf(error->str + error->size, error->capacity - error->size, fmt, tmpa);
    va_end(tmpa);

    if (size < 0)
        return -1;

    error->size += size;

    if (error->size > error->capacity)  /*truncated*/ {        
        error->size = error->capacity - 1;
    }

    return size;
}

int error(const char* fmt, ...)
{
    va_list args;
    va_start(args, fmt);
    int size = error_vafprintf(tls_error, fmt, args);
    va_end(args);
    return size;
}

```


```cpp

#include <stdio.h>
#include "tinycthread.h"
#include  "error.h"
#include <stdlib.h>
#include <stdbool.h>

bool F()
{
    error("1234");
    return false;
}

int Start(void* arg)
{
    char buffer[50] = {0};
    struct error er = { .str = buffer, .capacity = sizeof(buffer)};
    tls_error = &er;
    
    if (!F())
    {
        //tls_error
    }

    return 1;
}

int main()
{
    thrd_t thr1;
    int r = thrd_create(&thr1, Start, 0);
    
    thrd_t thr2;
    r = thrd_create(&thr2, Start, 0);
    

    int res;
    thrd_join(thr1, &res);
    thrd_join(thr2, &res);
}

```
