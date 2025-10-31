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



```cpp
#include <stdio.h>
#include <stdlib.h>


#define ArrayOf(T)\
{\
    T* pData;\
    int Size;\
    int Capacity;\
}

int reserve(void** ppItems, size_t size, size_t* capacity, size_t sz)
{
  if (size > * capacity)
  {
    int n = *capacity * 2;
    if (n == 0)
    {
      n = 1;
    }
    void* pnew = *ppItems;
    pnew = (void*)realloc(pnew, n * sz);
    if (pnew)
    {
      *ppItems = pnew;
      *capacity = n;
    }
  }
  return 1;
}

#define Push(pItems, i)\
do {\
    if (reserve((void**)&((pItems)->pData), (pItems)->Size + 1, &((pItems)->Capacity), sizeof((pItems)->pData[0])))\
    {\
      (pItems)->pData[(pItems)->Size] = i;\
      (pItems)->Size++;\
    }\
} while(0)

struct Y
{
  int i;
};

struct Items
{
  struct Y* p;
  int count;
};

void Load(struct Items* p)
{
  struct ArrayOf(struct Y) a = {0};
  Push(&a, (struct Y) {.i = 1});
  p->count = a.Size;
  p->p = a.pData;
}

int main()
{
  struct Items items = {0};
  Load(&items);  
  free(items.p);
}


```


```c

#pragma once
#include <stdlib.h>

struct ptrarray
{
    void** data; int size, capacity;
};

#define Array(item) array_##item
#define DECLARE_ARRAY(item) struct Array(item) { struct item** data; int size, capacity; }

#define array_push(a, v) ptrarray_push((struct ptrarray*) a, v)

static inline ptrarray_push(struct ptrarray* a, void* value)
{
    if (a->size + 1 > a->capacity)
    {
        int n = a->capacity * 2;
        if (n == 0)
        {
            n = 1;
        }
        void** pnew = a->data;
        pnew = (void**)realloc(pnew, n * sizeof(void*));
        if (pnew)
        {
            a->data = pnew;
            a->capacity = n;
        }
    }
    a->data[a->size] = value;
    a->size++;
}



```

```c
#include "array.h"

struct X
{
    int i;
};

DECLARE_ARRAY(X);

void F(struct Array(X)* a)
{
    struct X* p = malloc(sizeof * p);
    p->i = 1;
    array_push(a, p);    
}
int main()
{
    struct Array(X) a = {0};
    struct X* p = malloc(sizeof * p);
    p->i = 1;
    array_push(&a, p);
    F(&a);
}





```
