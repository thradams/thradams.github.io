# The language between C and C++ I would like to have

Updated 15 May 2020

## Objetive

Remove boilerplate code adding few features. Make features inside the compiler
not libraries.

When reading this document consider that the features are additions into C and not changes in C++.

## Member initializer

```cpp

struct X {
   int i = 1;
   struct Point pt = { .x = 1, .y = 1 };
};

```

## Empty Initializer/Compound literal

```cpp
int main() {
   
   //new syntax
   struct X x = {};    

   //same as C99
   struct X x = { . i = 1, .pt = {.x = 1, .y = 1 } };
   
   //new syntax
   x = (struct X){};    

   //same as C99
   x = (struct X){ . i = 1, .pt = {.x = 1, .y = 1 } };
}


int main() {
  struct X x; //same as C today (unitialized)
}
```

```cpp
int main() { 
   struct X x1[2] = {};    
   
   //same as C99
   struct X x2[2] = {{.x = 1, .y = 1 }, {.x = 1, .y = 1 } }; 
}


int main() {
  struct X x; //same as C today (unitialized)
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



### New and delete operators


```cpp

struct X {
    char * name = NULL;
};

int main() {
  struct X* pX = new (struct X) {};
  delete pX;
}

```
new and delete operators can be overrided 

```cpp

void delete(struct X* p) {    
};

void new(struct X* p) {    
};

```


## Operator destroy

The compiler calls the destroy at the end of scope.

```cpp
struct Person {
    char * name = NULL;
};

int main() {

   struct Person x;

}
```

destroy cannot be overriden (more details will follow)
but there is one "event" destroy that is called and the
user can add some code on it.

```cpp
void destroy(struct X* p) {    
};

```


## NOT Calling destroy at the end of scope

To to this, add the type modifier __view__.

Sample:

```cpp

int main() {

   struct X x1[10];
   
   view struct X x2[2]; 
   
   x1[0] = x2[1]; 
   
} //ONLY destroy of x1[0] ... x1[9] is called

```

## Auto pointers

Pointers can be qualified with auto.
When am auto pointer scope ends it call the operator delete on it.

```cpp

struct X {
    char * name = NULL;
};

int main()
{
  struct X* auto pX = new (struct X){};
  
} //delete(pX) is called

```

We can imagine that all pointer are by default __view__ and other types are by default __auto__.

## More operators

swap, reset are also operators  that could be added.

Templates could be added but I prefer to keep the abstractions
at language level so the have a fixed and universal jop.




## if with initializer 
Same of C++.  Togueter with auto it creates an interting pattern.

```cpp

  if (struct X* auto pX = new (struct X){}, p)
  {
    //pX in scope AND != NULL
    ..
  }
  //pX not in scope

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
  
}

```

## Resizable arrays [auto]

We have some magic functions push and reserve for resizable arrays.


Resizeble arrays are equivalent of 


```cpp
Eg: int a[auto];

struct  some_name
{
  int * data;
  int size;
  int capacity;
}
```

```cpp
 
 int a[auto];
 
 push(a, 1);
 reserve(a, 10);

 a.data[0] = 1; //ok
 a[0] = 1; //ok
 
```

## Standard build system 
Pragma source is a way to make source files discoverable respecting platform configuration.
This allow compilers and other tools like lint finds the source code in a standard way.
 
[Pragma source](pragmasource.md)




