# Additions into C language I would like to have

08 september 2020

( I have a project to implement these features called cprime )

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
This initialization can be used for global scope variables.


### Overloaded functions

Overload functions are functions with name mangling. 

```cpp
void draw(struct Box* p) overload;
void draw(struct Circle* p) overload;
```


See reference:
https://clang.llvm.org/docs/AttributeReference.html#overloadable



### New function

New is an especial function that calls malloc and if malloc suceeded
it  initializes the object using the compound literal.

```cpp

struct X {
    char * name;
};

int main() {

  struct X* pX = new((struct X) {});
  if (pX != NULL)
  {
    assert(pX->name == NULL);
    
    ...

    free(pX->name);
  }
}

```

## Destroy
Destroy is a especial function that is generated but also call
a user function to destroy the object.

See the sample:

```cpp

struct X {
    char * name = NULL;
};

void destroy(struct X* pX) overload {
   free(pX->name);
}

struct Y {
    struct X x;
};

int main()
{
  struct Y y = {};
  destroy(y);
}

```


## Auto pointers

Pointers can be qualified with auto. This tells the type system
that this pointer is the onwer of the pointed object.


```cpp
struct X {
    char * auto name = NULL;
};

int main()
{
  struct X x = {};
  destroy(x);
}

```

When auto pointers are destroyed they check if the pointer is not null
and then destroy the content  of the pointer.

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



