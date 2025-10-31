

```

#ifndef  _WSTR_H_
#define _WSTR_H_

struct wstr
{
  wchar_t* psz;
  size_t size;
  size_t capacity;
};

#define WSTR_INIT { 0, 0, 0 }

void wstr_init(struct wstr* wstr);

int wstr_reserve(struct wstr* p, size_t nelements);

void wstr_destroy(struct wstr* wstr);

void wstr_clear(struct wstr* wstr);

int wstr_set_n(struct wstr* p,
               const wchar_t * source,
               size_t nelements);

int wstr_set(struct wstr* p,
             const wchar_t * source);

int wstr_append_n(struct wstr* p,
                  const wchar_t * source,
                  size_t nelements);

int wstr_append(struct wstr* p,
                const wchar_t * source);

#endif  /*_WSTR_H_*/


```


```cpp

#include "stdafx.h"

#include "wstr.h"
#include <stdlib.h>
#include <assert.h>
#include <string.h>

void wstr_init(struct wstr* wstr)
{
  wstr->psz = NULL;
  wstr->size = 0;
  wstr->capacity = 0;
}

void wstr_destroy(struct wstr* wstr)
{
  if (wstr)
  {
    free(wstr->psz);
    wstr->size = 0;
    wstr->capacity = 0;
  }
}

static int reserve(struct wstr* p, size_t nelements)
{
  int r = 0;
  if (nelements > p->capacity)
  {
    wchar_t* pnew = (wchar_t*)realloc(p->psz, nelements * sizeof(p->psz[0]));
    if (pnew)
    {
      p->psz = pnew;
      p->capacity = nelements;
    }
    else
    {
      r = 1;
    }
  }
  return r;
}

int wstr_reserve(struct wstr* p, size_t nelements)
{
  return reserve(p, nelements + 1);
}

static int wstr_grow(struct wstr* p, size_t nelements)
{
  int r = 0;
  if (nelements > p->capacity)
  {
    size_t new_nelements = p->capacity + p->capacity / 2;
    if (new_nelements < nelements)
    {
      new_nelements = nelements;
    }
    r = reserve(p, new_nelements);
  }
  return r;
}

int wstr_set_n(struct wstr* p,
               const wchar_t * source,
               size_t nelements)
{
  int r = wstr_grow(p, nelements + 1);
  if (r == 0)
  {
    wcsncpy(p->psz, source, nelements);
    p->psz[nelements] = 0;
    p->size = nelements;
  }
  return r;
}

int wstr_set(struct wstr* p,
               const wchar_t * source)
{
  return wstr_set_n(p, source, wcslen(source));
}

int wstr_append_n(struct wstr* p, 
                  const wchar_t * source,
                  size_t nelements)
{
  int r = wstr_grow(p, p->size + nelements + 1);
  if (r == 0)
  {    
    wcsncpy(p->psz + p->size, source, nelements);
    p->psz[p->size + nelements] = 0;
    p->size += nelements;
  }
  return r;
}

int wstr_append(struct wstr* p,
                const wchar_t * source)
{
  return wstr_append_n(p, source, wcslen(source));
}


void wstr_clear(struct wstr* wstr)
{
  if (wstr->psz)
  {
    wstr->psz[0] = 0;
    wstr->size = 0;
  }
}


```
