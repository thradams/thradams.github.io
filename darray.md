Usage:

```cpp

struct X
{
    int i;
};

int main()
{
    struct ArrayOf(int) a = { 0 };
   

    for (int j = 0; j < 10; j++)
    {
        ArrayPush(&a, j);
    }

    printf("[");
    for (int i = 0; i < a.size; i++)
    {
        if (i > 0)
            printf(", ");
        printf("%d ", a.data[i]);
    }
    printf("]\n");

    struct ArrayOf(struct X) a2 = { 0 };


    for (int j = 0; j < 10; j++)
    {
        ArrayPush(&a2, (struct X) {.i = j});
    }

    printf("[");
    for (int i = 0; i < a.size; i++)
    {
        if (i > 0)
            printf(", ");
        printf(".i=%d ", a2.data[i].i);
    }
    printf("]\n");

    struct ArrayOf(struct X*) a3 = { 0 };


    for (int j = 0; j < 10; j++)
    {
        struct X* p = malloc(sizeof * p);
        if (p)
        {
            *p = (struct X){ .i = j };
            ArrayPush(&a3, p);
        }
    }

    printf("[");
    for (int i = 0; i < a3.size; i++)
    {
        if (i > 0)
            printf(", ");
        printf(".i=%d ", a3.data[i]->i);
    }
    printf("]\n");
}
```

Source:

```cpp

#include <stdio.h>
#include <stdlib.h>

#define ArrayOf(T) { T* data; int size; int capacity; }

#define ArrayPush(A, V)\
do {\
    if ((A)->size + 1 > (A)->capacity)\
    {\
        int n = (A)->capacity * 2;\
        if (n == 0)\
        {\
            n = 1;\
        }\
        void* pnew = (A)->data;\
        pnew = realloc(pnew, n * sizeof((A)->data[0]));\
        if (pnew)\
        {\
            (A)->data = pnew;\
            (A)->capacity = n;\
            (A)->data[(A)->size] = (V); \
            (A)->size++;\
        }\
    } else \
    {\
      (A)->data[(A)->size] = (V);\
      (A)->size++;\
    }\
}while(0)




```

```cpp

#define getdata(a) ((a) ? ((void*)((char*)(a) + sizeof(int) * 2)) : a)
#define getptr(a) ((a) ? ((int*)((char*)(a) - sizeof(int) * 2)) : 0)
#define getsize(a)  ((a) ? (getptr(a)[0]) : 0)
#define capacity(a)  ((a) ? (getptr(a)[1]) : 0)

#define push(p, value) \
  do {\
    int* pints = (int*)getptr(p);\
    int size = getsize(p);\
    int capacity = capacity(p);\
    if (size + 1 > capacity) {\
      int n = capacity * 2;\
      if (n == 0) {\
         n = 1;\
      }\
      pints = (int*)realloc(pints, sizeof(int) * 2 + n * sizeof(p[0]));\
      if (pints) {\
         p = getdata(pints);\
         pints[0] = size;\
         pints[1] = n;\
      }\
    }\
   p[size] = value;\
   pints[0]++;\
  } while (0)


struct X
{
    int i;
};

int main()
{
    char* p = { 0 };
    
    push(p, 'a');
    push(p, 'b');
    push(p, 0);

    free(getptr(p));


    struct X* pX = { 0 };
    push(pX, (struct X) {.i = 1});
    push(pX, (struct X) {.i = 2});
    
    for (int i = 0; i < getsize(pX); i++)
    {
        printf("%d\n", pX[i].i);
    }
    free(getptr(pX));
}

```

