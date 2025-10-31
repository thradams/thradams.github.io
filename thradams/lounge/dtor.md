```c
#include <assert.h>
#include <stdlib.h>
#include <string.h>

#define strdup _strdup 
static inline void* allocate_and_copy(void* s, size_t n)
{
    void* pNew = malloc(n);
    if (pNew)
    {
        memcpy(pNew, s, n);
    }

    return pNew;
}

#define new(...) allocate_and_copy(&(__VA_ARGS__), sizeof(__VA_ARGS__))

struct X
{
    char* name;
    int i;
};

#define X_INIT (struct X){0, .i = 2}
#define X_Destroy(x) free((x)->name);

struct Y
{
    struct X x;
};
#define Y_INIT (struct Y){X_INIT}
#define Y_Destroy(y) X_Destroy(&((y)->x))

struct Z
{
    struct Y y;
};

#define Z_INIT (struct Z){Y_INIT}
#define Z_Destroy(z) Y_Destroy(&((z)->y))
#define Z_Delete(z) if (z) { Z_Destroy((z)) } free(z)

int main()
{
    struct Z* pZ = new (Z_INIT);
    pZ->y.x.name = strdup("teste");
    Z_Delete(pZ);
}
```
