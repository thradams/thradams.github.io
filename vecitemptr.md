[Make container](makecontainer.md)

```cpp


#pragma once
#include <stdlib.h>
#include <assert.h>

struct item
{
    int index;
    int count;
};

void item_delete(struct item* p) {
    free(p); 
}

struct itemptr_array
{
    struct item** data;
    int size;
    int capacity;
};

int int_array_reserve(struct itemptr_array* p, int n)
{
    if (n > p->capacity)
    {
        void* pnew = realloc(p->data, n * sizeof(p->data[0]));
        if (pnew)
        {
            p->data = pnew;
            p->capacity = n;
        }
        else
        {
            return 0; /*out of mem*/
        }
    }
    
    return p->capacity;
}

int itemptr_array_push(struct itemptr_array* p, struct item* pitem)
{
    if (p->size + 1 > p->capacity)
    {
        int n = p->capacity * 2;
        if (n == 0)
        {
            n = 1;
        }
        if (int_array_reserve(p, n) == 0)
        {
            item_delete(pitem);
            return 0;
        }
    }

    p->data[p->size] = pitem;    
    p->size++;

    return p->size;
}

void itemptr_array_destroy(struct itemptr_array* p)
{
    for (int i = 0; i < p->size; i++)
    {
        item_delete(p->data[i]);
    }

    free(p->data);
}


#include <stdio.h>

int main()
{
    struct itemptr_array a = { 0 };
    itemptr_array_push(&a, calloc(1, sizeof (struct item)));    
    for (int i = 0; i < a.size; i++)
    {
        printf("%d %d\n", a.data[i]->index, a.data[i]->count);
    }
    itemptr_array_destroy(&a);
}


```
