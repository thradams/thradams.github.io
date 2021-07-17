
## Linked malloc

This code implements an allocator that accepts a destructor for each item.

It calls the destructor if not null before free.

Items can be removed using free (double linked list for this) but they also
will be destroyed together with the allocator.

Removing allocator_free we can use singled linked list.


Sample:
```cpp

#include <stdio.h>
#include <stdlib.h>
#include <string.h>


union header {
    struct {
        union header* prev; /* next block*/
        union header* next; /* next block*/
        void (*DTOR)(void*);     /* destructor */
    } s;
    long double x;         /* force alignment of blocks */
};

struct allocator
{
    union header* head;
};

void* alloc(struct allocator* allocator, int nbytes, void (*F)(void*))
{
    int nunits = (nbytes + sizeof(union header) - 1) / sizeof(union header) + 1;
    union header* p = malloc(nunits * sizeof(union header));
    if (p)
    {
        p->s.prev = NULL;
        p->s.next = allocator->head;
        p->s.DTOR = F;
        if (allocator->head != NULL)
        {
            allocator->head->s.prev = p;
        }
        allocator->head = p;


        return (void*)(p + 1);
    }
    return NULL;
}
void allocator_free(struct allocator* allocator, void* p)
{

    union header* del = ((union header*)p) - 1;

    /* If node to be deleted is head node */
    if (allocator->head == del)
        allocator->head = del->s.next;

    /* Change next only if node to be
    deleted is NOT the last node */
    if (del->s.next != NULL)
        del->s.next->s.prev = del->s.prev;

    /* Change prev only if node to be
    deleted is NOT the first node */
    if (del->s.prev != NULL)
        del->s.prev->s.next = del->s.next;


    if (del->s.DTOR)
    {
        void* pobj = (void*)((union header*)p + 1);
        del->s.DTOR(pobj);
    }

    /* Finally, free the memory occupied by del*/
    free(del);
    return;

}

void allocator_destroy(struct allocator* allocator)
{
    union header* p = allocator->head;
    while (p)
    {
        union header* next = p->s.next;
        if (p->s.DTOR)
        {
            void* pobj = (void*)((union header*)p + 1);
            p->s.DTOR(pobj);
            free(p);
        }
        p = next;
    }
}

struct X
{
    char* name;
};

void DestroyX(struct X* p)
{
    printf("DestroyX");
}

int main()
{
    struct allocator allocator = { 0 };
    struct X* pX = alloc(&allocator, sizeof(struct X), DestroyX);
    if (pX)
    {
        pX->name = alloc(&allocator, strlen("teste"), NULL);
        strcpy(pX->name, "teste");
        allocator_free(&allocator, pX->name);
    }

    allocator_free(&allocator, pX);

    allocator_destroy(&allocator);
}


```


Without free.

```cpp

#include <stdio.h>
#include <stdlib.h>.
#include <string.h>


union header {
    struct {
        union header* next; /* next block*/
        void (*DTOR)(void*);     /* destructor */
    } s;
    long double x;         /* force alignment of blocks */
};

struct allocator
{
    union header* head;
};

void* alloc(struct allocator* allocator, int nbytes, void (*F)(void*))
{
    int nunits = (nbytes + sizeof(union header) - 1) / sizeof(union header) + 1;
    union header* p = malloc(nunits * sizeof(union header));
    if (p)
    {        
        p->s.next = allocator->head;
        p->s.DTOR = F;        
        allocator->head = p;


        return (void*)(p + 1);
    }
    return NULL;
}

void allocator_destroy(struct allocator* allocator)
{
    union header* p = allocator->head;
    while (p)
    {
        union header* next = p->s.next;
        if (p->s.DTOR)
        {
            void* pobj = (void*)((union header*)p + 1);
            p->s.DTOR(pobj);
            free(p);
        }
        p = next;
    }
}

struct X
{
    char* name;
};

void DestroyX(struct X* p)
{
    printf("DestroyX");
}

int main()
{
    struct allocator allocator = { 0 };
    struct X* pX = alloc(&allocator, sizeof(struct X), DestroyX);
    if (pX)
    {
        pX->name = alloc(&allocator, strlen("teste"), NULL);
        strcpy(pX->name, "teste");
        
    }
    

    allocator_destroy(&allocator);
}


```

