
Non intrusive, non "vtable" polimorphism in C.

button.h
```cpp

#ifndef BUTTON_H
#define BUTTON_H

struct button
{
  int y;
};

struct button* button_create();
void button_destroy(struct button*);
void button_draw(struct button*);


#endif /*BUTTON_H*/

```

button.c
```cpp
#include "button.h"
#include <stdlib.h>
#include <stdio.h>

struct button* button_create()
{
  struct button* p = (struct button*)malloc(sizeof(struct button));
  return p;
}

void button_draw(struct button* btn)
{
  printf("button_draw\n");
}

void button_destroy(struct button* btn)
{
  printf("button_destroy\n");
}

```


edit.h
```cpp

#ifndef EDIT_H
#define EDIT_H

struct edit
{
  int y;
};

struct edit* edit_create();
void edit_draw(struct edit*);
void edit_destroy(struct edit*);


#endif /*EDIT_H*/

```

edit.c
```cpp

#include "edit.h"
#include <stdlib.h>
#include <stdio.h>


struct edit* edit_create()
{
  return (struct edit*)malloc(sizeof(struct edit));
}

void edit_destroy(struct edit* edt)
{
  printf("edit_destroy\n");
}

void edit_draw(struct edit* edt)
{
  printf("edit_draw\n");
}

```


This file defines what is "control". In this case, the control set is { button , edit } 


controls.h
```cpp

#ifndef CONTROLS_H
#define CONTROLS_H

/*Include your headers here*/
#include "button.h"
#include "edit.h"

/*include your types here*/
#define TYPES(p, f, ...) \
  X(button, p, f, __VA_ARGS__)\
  X(edit, p, f, __VA_ARGS__)


#define X(a, obj, f, ...) a##_id,
enum
{
  TYPES(p, f)
};
#undef X

#define X(T, obj, func, ...) \
  case T##_id: T##_##func((struct T*)((obj).pointer), __VA_ARGS__);  break;

#define dynamic_call(obj, func, ...)\
    switch ((obj).type)\
    {\
     TYPES(obj, func, __VA_ARGS__)\
    }


#endif /*CONTROLS_H*/



```

sample.c
```cpp
#include <stdlib.h>
#include "controls.h"
#include "type_ptr_array.h"

void controls_destroy(struct type_ptr* p)
{
  dynamic_call(*p, destroy);
}

int main(int argc, char* argv[])
{
  struct type_ptr_array controls = TYPE_PTR_INIT;

  type_ptr_array_push(&controls, button_id, button_create());
  type_ptr_array_push(&controls, edit_id, edit_create());

  for (size_t i = 0; i < controls.size; i++)
  {
    dynamic_call(controls.data[i], draw);
  }

  type_ptr_array_destroy(&controls, &controls_destroy);

  return 0;
}

```

type_ptr_array.h
```cpp
#ifndef TYPE_PTR_ARRAY_H
#define TYPE_PTR_ARRAY_H

struct type_ptr
{
  int type;
  void* pointer;
};

struct type_ptr_array
{
  size_t    size;
  size_t    capacity;
  struct type_ptr* data;
};

#define TYPE_PTR_INIT {0,0,0}

void type_ptr_array_destroy(struct type_ptr_array* p,
                           void(*destroy)(struct type_ptr*));

void type_ptr_array_push(struct type_ptr_array* p, int type, void* item);


#endif /*TYPE_PTR_ARRAY_H*/

```

type_ptr_array.c
```cpp

#include <stdlib.h>
#include "type_ptr_array.h"

static size_t type_ptr_array_reserve(struct type_ptr_array* p, size_t nelements)
{
  void *pnew = 0;
  if (nelements > p->capacity)
  {
    pnew = realloc((void*)p->data, nelements * sizeof(p->data[0]));
    if (pnew)
    {
      p->data = (struct type_ptr*)pnew;
      p->capacity = nelements;
    }
  }

  return (pnew != 0) ? nelements : 0;
}

size_t type_ptr_array_grow(struct type_ptr_array* p, size_t nelements)
{
  if (nelements > p->capacity)
  {
    size_t newCap = p->capacity == 0 ? 4 : p->capacity;
    while (newCap < nelements)
    {
      newCap *= 2;
      if (newCap < nelements ||
        newCap >(size_t)(UINT_MAX / sizeof(p->data[0])))
      {
        newCap = (size_t)(UINT_MAX / sizeof(p->data[0]));
      }
    }
    return type_ptr_array_reserve(p, newCap);
  }
  return p->capacity;
}

void type_ptr_array_destroy(struct type_ptr_array* p,
                            void (*destroy)(struct type_ptr*))
{
  for (size_t i = 0; i < p->size; i++)
  {
    destroy(&p->data[i]);
  }
}

void type_ptr_array_push(struct type_ptr_array* p,
                         int type,
                         void* item)
{
  size_t result = type_ptr_array_grow(p, p->size + 1);

  if (result == 0)
  {
    exit(1);
    return;
  }
  p->data[p->size].type = type;
  p->data[p->size].pointer = item;
  p->size += 1;
}

```


