
Public interfaces allows complete decoupling of implementation.


Interface.h

```cpp

pragma once

/*
 * Public Interface.
 * 
*/

struct Interface;

typedef struct InterfaceVtbl
{
  void (*Release)(Interface * This);
};

struct Interface
{
  InterfaceVtbl * lpVtbl;
};

inline void Interface_Release(Interface *p)
{
  p->lpVtbl->Release(p);
}

```

Object.h

```cpp
  #pragma once
  Interface * Object_New();
```

Object.c

```cpp

struct Object
{
  InterfaceVtbl * lpVtbl;
};

void Object_Release(Interface *p)
{  
  free((Object*)p);
}

Interface * Object_New()
{
  /*vtable*/
  static struct InterfaceVtbl vtbl = { &Object_Release };

  Object * p = (Object*)malloc(sizeof(Object));
  p->lpVtbl = &vtbl;

  return (Interface*)p;
}

```

```cpp

int main(int argc, char* argv[])
{
  Interface * p = Object_New();
  Interface_Release(p);
  return 0;
}
```


