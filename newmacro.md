
```cpp

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct X {
    int i;
};

#define X_INIT {.i = 1}

/*
  Allocates size bytes and initialized coping the value.
*/
void* mallocinit(size_t size, void* value)
{
    void* p = malloc(size);
    if (p) {
        memcpy(p, value, size);
    }
    return p;
}

#define NEW(...) mallocinit(sizeof(__VA_ARGS__), & __VA_ARGS__)

int main()
{
    struct X* p = NEW( (struct X) X_INIT ); 
    if (p)
    {
      free(p);
    } 
}
```

