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



#define array_size(a)  ((a) ? (((int*)((char*)(a) - sizeof(int) * 2))[0]) : 0)
#define array_capacity(a)  ((a) ? (((int*)((char*)(a) - sizeof(int) * 2))[1]) : 0)
#define array_free(a) if (a) free((((int*)((char*)(a) - sizeof(int) * 2))))

#define array_reserve(p, newcapacity) \
  do {\
    int* pints = p ? ((int*)((char*)(p) - sizeof(int) * 2)) : 0;\
    int capacity = pints ? pints[1] : 0;\
    int size = pints ? pints[0] : 0;\
    if (newcapacity > capacity) {\
      pints = (int*)realloc(pints, sizeof(int) * 2 + newcapacity * sizeof(p[0]));\
      if (pints) {\
         p = ((void*)((char*)(pints) + sizeof(int) * 2));\
         pints[0] = size;\
         pints[1] = newcapacity;\
      }\
    }\
  } while (0)


#define array_push(p, value) \
  do {\
    int* pints = p ? ((int*)((char*)(p) - sizeof(int) * 2)) : 0;\
    int size = pints ? pints[0] : 0;\
    int capacity = pints ? pints[1] : 0;\
    if (size + 1 > capacity) {\
      int n = capacity * 2;\
      if (n == 0) {\
         n = 1;\
      }\
      pints = (int*)realloc(pints, sizeof(int) * 2 + n * sizeof(p[0]));\
      if (pints) {\
         p = ((void*)((char*)(pints) + sizeof(int) * 2));\
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
    struct X* pX = { 0 };
    
    array_reserve(pX, 1100);
    printf("%d %d", array_size(pX), array_capacity(pX));

    array_push(pX, (struct X) {.i = 1});
    array_push(pX, (struct X) {.i = 2});
    
    for (int i = 0; i < array_size(pX); i++)
    {
        printf("%d\n", pX[i].i);
    }
    array_free(pX);
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

```cpp

#include <stdlib.h>

struct Item
{
    int i;
    struct Item* /*@auto*/ pNext;
};
#define ITEM_INIT (struct Item){0}

void Item_Delete(struct Item* pItem) /*@default*/
{
    if (pItem)
    {
        Item_Delete(pItem->pNext);
        free((void*)pItem);
    }
}

#define DECLARE_LIST(T) struct list_##T { struct T * pHead, *pTail; };

#define ListOf(T) list_##T

DECLARE_LIST(Item)



#define list_push(pItems, pItem)\
    if ((pItems)->pHead == 0)\
    {\
        (pItems)->pHead = pItem;\
    }\
    else\
    {\
        (pItems)->pTail->pNext = pItem;\
    }\
    (pItems)->pTail = pItem


#define list_destroy(list, F)\
  while ((list)->pHead) {\
     void* p = (list)->pHead->pNext;\
     (F)((list)->pHead);\
     (list)->pHead = p;\
  }\
  (list)->pTail = 0

#define new(p)  malloc(sizeof * (p)); if (p) (*(p)) =


int main()
{
    struct ListOf(Item) list = { 0 };
    struct Item* pItem = new(pItem) ITEM_INIT;

    list_push(&list, pItem);
    
    struct Item* pItem2 = malloc(sizeof * pItem);
    *pItem2 = (struct Item){ 0 };
    list_push(&list, pItem2);

    list_destroy(&list, free);

   
}

```
