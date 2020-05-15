# The language between C and C++ I would like to have

Updated 15 May 2020

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

There is no 'constructor' runtime function.

### Overloaded functions

```c
void draw(struct X* p) overload;
```

Reference:
https://clang.llvm.org/docs/AttributeReference.html#overloadable

### Operator new

The compiler auto generates the implementation of the new operator.

The usage (syntax):

```cpp

struct X {
    char * name = NULL;
};

int main() {
  struct X* pX = new (struct X) {};
}

```

The default implementation is equivalent of:

```cpp
struct T* new(struct T initValue)
{
  struct T* p = malloc(sizeof initValue);
  if (p)
  {
    *p = initValue;
  }
  return p;
}
```

It does not throw. There is no runtime (appart of malloc) error.

We can create a overload function that overrides the new operator. 

```cpp

struct T* new(struct T initValue) overload
{
  struct T* p = malloc(sizeof * p);
  if (p)
  {
    *p = initValue;
  }
  return p;
}
```

New operator does works for arrays.  (although  I think it is not  used too much)

```cpp
int main() {
  char * str = new((char[200]){}); 
}
```



## Operator destroy

The compiler has an auto generated destroy function that is called at the end of scope.

```cpp
struct Person {
    char * name = NULL;
};

int main() {

   struct Person x;

} //destroy(x) called
```
We can override destroy using the overload  function syntax

```c
void destroy(struct Person* person) overload;
```

## NOT Calling destroy at the end of scope

To to this, add the type modifier view.

Sample:

```cpp

int main() {

   struct X x1[10];
   
   view struct X x2[2]; 
   
   x1[0] = x2[1]; 
   
} //ONLY destroy of x1[0] ... x1[9] is called

```



## Operator delete

The compiler has an auto generated delete function that destroy the object that the pointer points to and also free the memory.

```cpp
struct Person {
    char * name = NULL;
};

int main() {
   struct Person* pX = new (struct Person){};
   delete(pX);
}
```
We can override delete using the overload function syntax

```c
void delete(struct Person* person) overload;
```



## Auto pointers

Pointers can be qualified with auto.
When a pointer qualified with auto is destroyed it deletes the object it points to.

```cpp

struct X {
    char * name = NULL;
};

int main()
{
  struct X* auto pX = new (struct X){};
  
} //delete(pX) is called

```

The compiler has a default implementation for any pointer qualified with auto that is equivalent of

```cpp
void operator destroy(T * auto p)
{
  if (p)
  {
    destroy(*p);
    free(p);
  }
}
```

To destroy the content of a non auto pointer we can cast.

```cpp
  struct X* pX = new (struct X){};
  ...
  destroy( (struct X* auto) pX);  
```

Or call destroy for the content and them free.

```cpp
  struct X* pX = new (struct X){};
  ...
  destroy(*pX);  
  free(pX);
```

We can imagine that all pointer are by default 'view' and other types are by default 'auto'.



## Struct members

The default implementation of destroy calls each member recursivally.

So

```cpp

struct Y {
  int i;
};

struct X
{ 
  struct Y y1;
  view struct Y y2;  
};

int main() {
  auto struct X x = {};  
}  //only destroy(x.y1) is called 
````


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

## overriding destroy for existing types

typedefs are only alias in C. But for the operators they are considered.
For instance, let's say FILE is a typedef for int. We can override
the operator and that doen't means that any int will call this function.

```cpp

void destroy (FILE * auto f) overload
{
  fclose(f);
}

int main()
{
  if (FILE* auto f = fopen("file.txt", "r"), f)
  {
  }
} 
```

## Lambdas 
Similar of C++.

Lambdas without capture will be function pointers.
Lambdas with capture (to be defined)


## Polimorphism

Pointers that can point to a especific set of types.

If you set of types have a common discriminant we also can select the
appropriated operator in runtime according with the type.

Sample:
```cpp


 
struct Box
{
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
  
  shapes[0] = new (struct Box){};
  shapes[1] = new (struct Circle){};
  
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

## Resizable arrays

```cpp

 void operator push(auto a[auto], auto item)
 {
    if (a.size + 1 > a.capacity)
    {
        int n = a.capacity * 2;
        if (n == 0)
        {
            n = 1;
        }
        decltype(a.data[0]) * pnew = a.data;
        pnew = realloc(pnew, n * sizeof(a[0]));
        if (pnew)
        {
            pItems->data = pnew;
            pItems->capacity = n;
        }
    }
    a.data[a.size] = item;
    a.size++;
 }
 
 int a[auto]; //synonym of struct some_name_mangling  { int * data; int size; int capacity;}
 push(a, 1);
 
 a.data[0] = 1; //ok
 a[0] = 1; //ok
 
```

## Standard build system 
Pragma source is a way to make source files discoverable respecting platform configuration.
This allow compilers and other tools like lint finds the source code in a standard way.
 
[Pragma source](pragmasource.md)




