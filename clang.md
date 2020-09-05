# The language between C and C++ I would like to have

05 september 2020

## Objetive

- Remove boilerplate code.

When reading this document consider that the features are additions into C and not changes in C++.

## Member initializer

```cpp

struct X {
   int i = 1;
   struct Point pt = { .x = 1, .y = 1 };
};

```

## Empty Initializer/Compound literal

Static initialization using the values of member initializer

```cpp
int main() {
   
   //new syntax
   struct X x = {};       
   struct X x1[200] = {};   
}

```

This initialization works for global static variables.
There is no runtime function called like C++ constructor.
Diferently from C++, we only accept constants. 

### Overloaded functions

Overload functions are especial functions with name mangling.

```c
void draw(struct X* p) overload;
```

See reference:
https://clang.llvm.org/docs/AttributeReference.html#overloadable



### new and destroy functions


```cpp

struct X {
    char * name = NULL;
};

int main() {
  struct X* auto pX = new((struct X) {});
  destroy(pX);
}

```

## Auto pointers

Pointers can be qualified with auto.

```cpp

struct X {
    char * auto name = NULL;
};

int main()
{
  struct X x0 = {};
  struct X* auto pX = new((struct X){});  

  destroy(x0);
  destroy(pX);
}

```

## if with initializer 
Same of C++.  Togueter with auto it creates an interting pattern.

```cpp

  if (struct X* auto pX = new ((struct X){}), p)
  {
    //pX in scope AND != NULL
    ..
    destroy(pX);
  }
  //pX not in scope

````

## if with initializer  and final expression


```cpp
  if (struct X* auto pX = new ((struct X){}), p, destroy(pX))
  {
    ...
    /* final expression goes here*/
  }

  if (struct X* auto pX = new ((struct X){}), p, destroy(pX))
  {
      /* final expression goes here*/
      break;
      return;
      goto label:
  }


````

## Lambdas 
Similar of C++.

## Polimorphism

Pointers that can point to a especific set of types.

If you set of types have a common discriminant we also can 
select the appropriated operator in runtime according with the type.

Sample:
```cpp
 
struct Box {
    const int id = 1; //discriminant
};

void draw(struct Box* pBox) overload {
    printf("Box");
}

struct Circle {
    const int id = 2; //discriminant
};

void draw(struct Circle* pCircle) overload {
    printf("Circle");
}

int main()
{
  struct <Box | Circle> * auto shapes[2] = {};
  
  shapes[0] = new ((struct Box){});
  shapes[1] = new ((struct Circle){});
  
  for (int i = 0; i < 2; i++)
  {    
    //runtime selecion according with the discriminant
    //auto generated  draw for shape
    draw(shapes[i]); 
    
    //when types have a common discriminant it is available
    printf("%d", shapes[i].id);
  }
  
  destroy(shapes);
}

```

## Resizable arrays [auto]


```cpp
int a[auto];
 
 capacity(a);
 size(a);
 push(a, 1);
 reserve(a, 10);
 
 a[0] = 1; //ok
 
```

## Standard build system 
Pragma source is a way to make source files discoverable respecting platform configuration.
This allow compilers and other tools like lint finds the source code in a standard way.
 
[Pragma source](pragmasource.md)




