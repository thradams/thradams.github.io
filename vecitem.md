[Make container](makecontainer.md)

```cpp

#pragma once
#include <stdlib.h>
#include <assert.h>

struct item {
    int index;
    int count;
};

void item_destroy(struct item* p) {}

struct item_array
{
    struct item* data;
    int size;
    int capacity;
};

int int_array_reserve(struct item_array* p, int n)
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

int item_array_push(struct item_array* p, int index, int count)
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
            return 0;
        }
    }

    p->data[p->size].index = index;
    p->data[p->size].count = count;

    p->size++;

    return p->size;
}

void item_array_destroy(struct item_array* p)
{
    for (int i = 0; i < p->size; i++)
    {
        item_destroy(&p->data[i]);
    }

    free(p->data);
}


#include <stdio.h>

int main()
{
    struct item_array a = { 0 };
    item_array_push(&a, 1, 2);
    item_array_push(&a, 2, 2);
    for (int i = 0; i < a.size; i++)
    {
        printf("%d %d\n", a.data[i].index, a.data[i].count);
    }
    item_array_destroy(&a);
}

```
