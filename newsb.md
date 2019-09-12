String formatter that allocates memory when necessary.

```c
#pragma once

#include <stdbool.h>
#include <stdarg.h>

struct sb
{
    char* c_str;
    int size;
    int capacity;
    bool heap;
} ;

#define SB_INIT(N)  {.size = 0, .capacity = N, .c_str = (char[N + 1]){0}, .heap = 0 }

void sb_free(struct sb* p);
int sb_reserve(struct sb* p, int nelements);
int sb_printf(struct sb* stream, const char* fmt, ...);
int ss_vafprintf(struct sb* stream, const char* fmt, va_list args);

```

```c

#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include "sb.h"

void sb_free(struct sb* p)
{
    if (p->heap)
        free(p->c_str);
}

int sb_reserve(struct sb* p, int nelements)
{
    int result = 0;
    if (nelements > p->capacity)
    {
        char* pnew = NULL;
        if (!p->heap)
        {
            pnew = (char*)malloc((nelements + 1) * sizeof(char));
            if (pnew)
            {
                memcpy(pnew, p->c_str, nelements);
                p->heap = true;
            }
        }
        else
        {
            pnew = (char*)realloc(p->c_str, (nelements + 1) * sizeof(char));
        }
        if (pnew)
        {
            p->c_str = pnew;
            p->capacity = nelements;
            result = p->capacity;
        }
    }
    else
    {
        result = p->capacity;
    }

    return result;
}



int ss_vafprintf(struct sb* stream, const char* fmt, va_list args)
{
    va_list tmpa;
    va_copy(tmpa, args);

    int size = vsnprintf(stream->c_str, stream->capacity, fmt, tmpa);

    va_end(tmpa);

    if (size < 0)
    {
        return -1;
    }

    if (size > stream->capacity)
    {
        if (sb_reserve(stream, size) == 0)
        {
            return -1;
        }

        size = vsprintf(stream->c_str, fmt, args);
        if (size > 0)
        {
            stream->size = size;
        }
    }
   


    return size;
}

int sb_printf(struct sb* stream, const char* fmt, ...)
{
    va_list args;
    va_start(args, fmt);
    int size = ss_vafprintf(stream, fmt, args);
    va_end(args);
    return size;
}

```

```c
#include <stdio.h>
#include "sb.h"

int main()
{
    struct sb sb = SB_INIT(10);

    sb_printf(&sb, "%s", "test");

    sb_printf(&sb, "%s", "big string test");

    sb_printf(&sb, "%s", "small");

    sb_reserve(&sb, 400);

    sb_free(&sb);
}
```
