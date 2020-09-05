
Usage:

```cpp

#include "shared.h"

struct X {
    int i;
};

int main()
{
    struct X* p1 = malloc_shared(sizeof * p1);
    p1->i = 2;
    
    if (p1)
    {
        struct X* p2 = NULL;
        p2 = share(p1);
        release(p2);
        release(p1);
    }
}

```

Header

```cpp

/*shared.h*/

#include <stdlib.h>

void* malloc_shared(size_t sz);
void* share(void* p);
int release(void* p);


```

Source

```cpp
/*shared.c*/
#include "shared.h"

#if defined(_WIN32) || defined(__WIN32__) || defined(__WINDOWS__)
#include <Windows.h>
#else
#endif

struct shared_object_counter
{
    int counter;
};

void* malloc_shared(size_t sz) {
    struct shared_object_counter* p1 = malloc(sizeof(struct shared_object_counter) + sz);
    if (p1)
    {
        p1->counter = 1;
    }
    return p1 + 1;
}

void* share(void* p) {
    struct shared_object_counter* p1 = ((struct shared_object_counter*)p - 1);
    InterlockedIncrement(&p1->counter);
    return p;
}

int release(void* p) {
    struct shared_object_counter* p1 = ((struct shared_object_counter*)p - 1);
    int c = InterlockedDecrement(&p1->counter);
    if (0 == c)
    {
        free(p1);
    }
    return c;
}


```

