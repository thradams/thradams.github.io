
sample

```cpp
#include <stdio.h>
#include "closure.h"
#include "vclosures.h"

void f(void*)
{
  printf("hello closure!\n");
}

void f2(struct closure_void_str* p)
{
  printf("hello %s!\n", p->text);
}

int main()
{
  vclosures vclosures = VCLOSURES_INIT;

  vclosures_append(&vclosures, closure_void_new(&f));
  vclosures_append(&vclosures, closure_void_str_new(&f2, "thiago"));

  for (size_t i = 0; i < vclosures_size(&vclosures); i++)
  {
    closure_void_call(vclosures_get(&vclosures, i));
  }

  vclosures_destructor(&vclosures);
  return 0;
}
```

header

```cpp
#ifndef _vclosures_H
#define _vclosures_H

#include "closure.h"

typedef struct vclosures_t
{
  size_t    size;
  size_t    capacity;
  closure_void** data;
} vclosures;

#define VCLOSURES_INIT { 0, 0, 0 }

void           vclosures_destructor(vclosures* p);
size_t         vclosures_reserve(vclosures* p, size_t size);
void           vclosures_erase_n(vclosures* p, size_t index, size_t count);
size_t         vclosures_append(vclosures* p, closure_void* pItem);
closure_void*  vclosures_get(const vclosures* p, size_t index);
size_t         vclosures_size(vclosures* p);
closure_void*  vclosures_back(vclosures* p);
closure_void*  vclosures_front(vclosures* p);
bool           vclosures_empty(vclosures* p);
void           vclosures_clear(vclosures* p);
void           vclosures_erase(vclosures* p, size_t index);
size_t         vclosures_capacity(vclosures* p);
closure_void** vclosures_data(vclosures* p);

#endif  //_vclosures_H


```

source

```cpp
#include "stdafx.h"
#include "vclosures.h"
#include <stdlib.h>


inline void delete_elements(closure_void** p, size_t nelements)
{
  for (size_t i = 0; i < nelements; i++)
  {
    closure_void_delete(p[i]);
  }
}

size_t vclosures_reserve(vclosures* p, size_t nelements)
{
  if (nelements > p->capacity)
  {
    size_t nelem = nelements;

    if (p->data == NULL)
    {
      p->data = (closure_void**)malloc(nelem * sizeof(closure_void*));
    }
    else
    {
      p->data = (closure_void**)realloc((void*)p->data, nelem * sizeof(closure_void*));
    }
    p->capacity = nelements;
  }

  return (p->data != 0) ? nelements : 0;
}

static size_t vclosures_grow(vclosures* p, size_t nelements)
{
  const size_t INITIAL_CAPACITY = 4;
  const size_t MAX_CAPACITY = (size_t)(UINT_MAX / sizeof(closure_void*));
  if (nelements > p->capacity)
  {
    size_t newCap = p->capacity == 0 ? INITIAL_CAPACITY : p->capacity;
    while (newCap < nelements)
    {
      newCap *= 2;

      if (newCap < nelements ||
        newCap > MAX_CAPACITY)
      {
        /*overflow check*/
        newCap = MAX_CAPACITY;
      }
    }
    return vclosures_reserve(p, newCap);
  }
  return p->capacity;
}

void vclosures_destructor(vclosures* p)
{
  vclosures_clear(p);
  free(p->data);
  p->data = 0;
}

static size_t vclosures_insert_n(vclosures* p,
  size_t index,
  closure_void** pSource,
  size_t nelements)
{
  size_t result = vclosures_grow(p, p->size + nelements);

  if (result == 0)
  {
    delete_elements(pSource, nelements);
    return 0;
  }

  if (index < p->size)
  {
    memmove(&p->data[index + nelements],
      &p->data[index],
      (sizeof(closure_void*)) * (p->size - index));
  }

  memcpy((void*)&p->data[index], &pSource[0], sizeof(closure_void*) * nelements);
  
  p->size += nelements;

  return nelements;
}

void vclosures_erase_n(vclosures* p,
  size_t position,
  size_t nelements)
{
  if (nelements > 0)
  {
    delete_elements(&p->data[position], nelements);
    memmove(p->data + position,
      p->data + position + nelements,
      sizeof(closure_void*) * nelements);

    p->size = p->size - nelements;
  }
}

size_t vclosures_append(vclosures* p, closure_void* pItem)
{
  return vclosures_insert_n(p, p->size, &pItem, 1);
}

closure_void* vclosures_get(const vclosures* p, size_t index)
{
  return p->data[index];
}

size_t vclosures_size(vclosures* p)
{
  return p->size;
}

closure_void* vclosures_back(vclosures* p)
{
  return vclosures_get(p, vclosures_size(p) - 1);
}

closure_void* vclosures_front(vclosures* p)
{
  return vclosures_get(p, 0);
}

bool vclosures_empty(vclosures* p)
{
  return vclosures_size(p) == 0;
}

void vclosures_clear(vclosures* p)
{
  vclosures_erase_n(p, 0, p->size);
}

void vclosures_erase(vclosures* p, size_t index)
{
  vclosures_erase_n(p, index, 1);
}

size_t vclosures_capacity(vclosures* p)
{
  return p->capacity;
}

closure_void** vclosures_data(vclosures* p)
{
  return p->data;
}


```

