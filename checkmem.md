# Memory leak detector

Memory leaks detector for malloc, realloc and free.

It adds the allocated memory into a linked list with source name and line.

free removes the node.

If there are remaing itens, they are leaks.

```cpp
#pragma once
#include <stdlib.h>

#ifdef _DEBUG

void* MallocDbg(int line, const char* file, size_t size);
void FreeDbg(void* p);
void* ReallocDbg(int line, const char* file, void* p, size_t s);

void PrintLeaksDbg();

#define malloc(s) MallocDbg(__LINE__, __FILE__, (s))
#define free(p) FreeDbg((p))
#define realloc(p, s) ReallocDbg(__LINE__, __FILE__, (p), (s))

#endif // DEBUG


```

```cpp

#include <stdlib.h>
#include <stdio.h>

void* MallocDbg(int line, const char* file, size_t size);
void FreeDbg(void* p);
void* ReallocDbg(int line, const char* file, void* p, size_t s);
void PrintLeaksDbg();

struct Mem
{
    struct Mem* pPrev;
    struct Mem* pNext;
    const char* file;
    size_t line;
};

struct Mem* pHead = 0;

void* MallocDbg(int line, const char* file, size_t size)
{
    struct Mem* p = (struct Mem*) (malloc)(sizeof(struct Mem) + size);
    if (p)
    {
        p->line = line;
        p->file = file;
        p->pPrev = 0;
        p->pNext = pHead;

        if (pHead)
        {
            pHead->pPrev = p;
        }
        pHead = p;        
        p = ((char*)p) + sizeof(struct Mem);
    }

    return p;
}

void* ReallocDbg(int line, const char* file, void* p, size_t s)
{
    struct Mem* pMem = 0;
    if (p)
    {
        
        pMem = (struct Mem*)((char*)p - sizeof(struct Mem));
        

        pMem = (struct Mem*)(realloc)(pMem, sizeof(struct Mem) + s);
        if (pMem)
        {
            //update line and source
            pMem->line = line;
            pMem->file = file;
            
            if (pMem->pPrev)
            {
                pMem->pPrev->pNext = pMem;
            }
            
            if (pMem->pNext)
            {
                pMem->pNext->pPrev = pMem;
            }

            if (pHead == (struct Mem*)((char*)p - sizeof(struct Mem)))
            {
                pHead = pMem;
            }

            pMem = ((char*)pMem) + sizeof(struct Mem);
        }
    }
    else
    {
        pMem = MallocDbg(line, file, s);
    }
    return pMem;
}

void FreeDbg(void* p)
{
    if (p)
    {
        struct Mem* pMem = (struct Mem*)((char*)p - sizeof(struct Mem));

        if (pMem == pHead)
        {
            pHead = pHead->pNext;
        }
        else
        {
            pMem->pPrev->pNext = pMem->pNext;
        }

        (free)(pMem);
    }
}

void PrintLeaksDbg()
{
    struct Mem* p = pHead;
    while (p)
    {
        printf("%s %d\n", p->file, p->line);
        p = p->pNext;
    }
}



```
