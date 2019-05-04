# Memory leak detector

Memory leaks detector for malloc, realloc and free.

It adds the allocated memory into a linked list with source name and line.

free removes the node.

If there are remaing itens, they are leaks.

```cpp


#pragma once

void* MallocDbg(int line, const char* file, size_t size);
void FreeDbg(void *p);
void* ReallocDbg(int line, const char* file, void *p, size_t s);

void PrintLeaksDbg();

#define malloc(s) MallocDbg(__LINE__, __FILE__, (s))
#define free(p) FreeDbg((p))
#define realloc(p, s) ReallocDbg(__LINE__, __FILE__, (p), (s))


```

```cpp

#include <stdlib.h>
#include <stdio.h>

struct Mem
{
  struct Mem* pPrev;
  struct Mem* pNext;
  const char* file;
  size_t line;
};

struct Mem* pRoot = 0;

void* MallocDbg(int line, const char* file, size_t size)
{
  struct Mem* p = (struct Mem*) malloc(sizeof(struct Mem) + size);
  p->line = line;
  p->file = file;
  p->pPrev = 0;
  p->pNext = 0;
  if (pRoot)
  {
    p->pPrev = pRoot;
    p->pNext = pRoot->pNext;
    pRoot->pNext = p;
  }
  else
  {
    pRoot = p;
  }
  return ((char*)p) + sizeof(struct Mem);
}

void* ReallocDbg(int line, const char* file, void *p, size_t s)
{
  struct Mem* pMem = (struct Mem*)((char*)p - sizeof(struct Mem));
  pMem = (struct Mem*)realloc(pMem, sizeof(struct Mem) + s);
  pMem->line = line;
  pMem->file = file;
  return ((char*)pMem) + sizeof(struct Mem);
}

void FreeDbg(void *p)
{
  struct Mem* pMem = (struct Mem*)((char*)p - sizeof(struct Mem));

  if (pMem == pRoot)
  {
    pRoot = pRoot->pNext;
  }
  else
  {
    pMem->pPrev->pNext = pMem->pNext;
  }

  free(pMem);
}

void PrintLeaksDbg()
{
  struct Mem* p = pRoot;
  while (p)
  {
    printf("%s %d\n", p->file, p->line);
    p = p->pNext;
  }
}
```


Sample:

```cpp

#include "m.h"

int main()
{
  int *p1 = (int *)malloc(sizeof(int));
  p1 = (int *)realloc(p1, sizeof(int) * 10);
  int *p2 = (int *)malloc(sizeof(int));
  free(p2);
  PrintLeaksDbg();
  return 0;
}

--
```

