In C, we can have closures passing a context to the function called.

The only thing the function Call needs to known is the signature of the function to call (f).

```cpp
void Call(void* p, void(*f)(void*))
{
  f(p);
}
```

```cpp
void f(void* pv)
{
  printf("hello world!");
}

int main()
{
  Call(0, &f);
  return 0;
}
```

Now, let's capture one string.\\
Note that the function "Call" didn't change.

```cpp
void f(void* pv)
{
  const char * s = (const char*)pv;
  printf("hello %s!", s);
}

int main()
{
  Call((void*)"closure", &f);
  return 0;
}
```


In case we need two or more variables.

```cpp
struct strings2
{
  const char* s1;
  const char* s2;
};

void f(void* pv)
{
  struct strings2 * p = (struct strings2 *)pv;
  printf("%s %s!", p->s1, p->s2);
}

int main()
{
  struct strings2 c = { "Hi", "closure" };
  Call((void*)&c, &f);
  return 0;
}

```

How to store closures and use them in a polimorphic way.

```cpp

#include "closure.h"

void f(void*)
{
  printf("hello closure!\n");
}

void f2(void* pv)
{
  struct closure_void_str* p = (struct closure_void_str*)pv;
  printf("hello %s!\n", p->text);
}


int main()
{
  struct closure_void cv = CLOSURE_VOID_INIT(&f);
  struct closure_void * p = closure_void_new(&f);

  closure_void_call(&cv);
  closure_void_call(p);

  closure_void_delete(p);


  struct closure_void * p2 = closure_void_str_new(&f2, "thiago");
  closure_void_call(p2);
  closure_void_delete(p2);
}

```

closure.h

```cpp

#ifndef _CLOSURE_H
#define _CLOSURE_H


struct closure_void
{
  void(*call)(void*);
  void(*free)(void*);
};

#define CLOSURE_VOID_INIT(f) { f , 0 }

void closure_void_init(struct closure_void* p,
                       void(*call)(void*),
                       void(*free)(void*));

struct closure_void* closure_void_new(void(*pf)(void*));

void closure_void_call(struct closure_void* p);
void closure_void_free(struct closure_void* p);
void closure_void_delete(struct closure_void* p);


struct closure_void_str
{
  void(*call)(void*);
  void(*free)(void*);
  const char* text;
};

struct closure_void* closure_void_str_new(void(*pf)(void*), const char* text);

#endif //_CLOSURE_H

```

Closure.cpp
```cpp
#include "closure.h"
#include <stdlib.h>
#include <string.h>


void closure_void_init(struct closure_void* p,
  void(*call)(void*),
  void(*free)(void*))
{
  p->call = call;
  p->free = free;
}

struct closure_void* closure_void_new(void(*pf)(void*))
{
  struct closure_void* p = (struct closure_void*) malloc(sizeof(struct closure_void));
  closure_void_init(p, pf, 0);
  return p;
}

void closure_void_call(struct closure_void* p)
{
  p->call(p);
}

void closure_void_free(struct closure_void* p)
{
  if (p->free)
    p->free(p);
}

void closure_void_delete(struct closure_void* p)
{
  closure_void_free(p);
  free(p);
}

//////////////////

static void closure_void_str_free(void* pv)
{
  struct closure_void_str * p = (struct closure_void_str *)(pv);
  free((void*)p->text);
}

struct closure_void* closure_void_str_new(void(*pf)(void*), const char* text)
{
  struct closure_void_str * p = (struct closure_void_str*)malloc(sizeof(struct closure_void_str));
  p->call = pf;
  p->free = &closure_void_str_free;
  p->text = (const char*)malloc(sizeof(char) * (strlen(text) + 1));
  strcpy((char*)p->text, text);
  return (struct closure_void*)p;
}


```


