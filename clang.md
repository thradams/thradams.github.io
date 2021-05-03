# Part I - Additions into C language I would like to have

April 2021

Most of these features have been implemented in my transpiler that can be  visualized here:

[cprime online](/web2/cprime.html)



## Struct member initializer

struct members can be annotated with their respective 
initialization value.

```cpp

struct X {
   int i = 1;
   struct Point pt = { .x = 1, .y = 1 };
};

```

This information is used for empty initialization and 
empty compound literals.

```cpp
int main() {
   
   struct X x = {};       
   x = (struct X) {};       
}

```

C++ has this features but with some unexpected 
design.


```cpp

struct point {
    int x = 1;
    int y = 2;
};

struct line {
  struct point point = { .x= 3, .y = 4 };
};

int main() {
  struct line line = { .point = { .x = 5} };
  printf("%d\n", line.point.y);
}

```

This sample prints 2 in C++. 

I was expecting 4.

C++ also accepts non constant initialization. 


## if with initializer 

This is the same of C++ 17.  See [https://en.cppreference.com/w/cpp/language/if](https://en.cppreference.com/w/cpp/language/if)

```cpp

  if (struct X* pX = malloc(sizeof * pX); pX)
  {    
    ...
    free(pX);
  }
  
  //pX out of scope

````

## if with initializer and defer-expression

Considering the interesting pattern above (that is very useful to avoid bugs) 
we also have an option with 'defer' to put everything at same line.

```cpp
  if (FILE* f = fopen("file.txt", "r"); f; fclose(f))
  {        
     
  }
```

When jumps like continue, break or goto are used 
the defer is called before the jump.

When return is called first the result is copied to a local 
variable then defer is called then  copied variable is returned.


## try-block statement and throw

try block statement creates a region where we can use throw 
and jump to the end of statement of inside catch block.


```cpp

   try {
      throw; /*jump*/
   }
   /*here*/
   
   try {
      throw; /*jump*/
   }
   catch
   {
     /*here*/
   }
      

```

The difference for C++ is that throw can only be used 
inside try-blocks making the jump path visible.

## defer

 Using defer the statement is executed at the end of scope
 or before leaving the scope with jumps like return break etc.

```cpp
  defer statement
```


## Lambdas 

Similar of C++ but without capture.

```
 lambda-expression:
    [] ( parameters opt ) -> return type (optional) compound-statement
    [] compound-statement -> return type (optional) 
```


## Literal string copy to fixed array

```cpp

   char s[3];
   s = "ab";//OK
   s = "abc";//compile time error
   s = "abcd";//compile time error
```

(not implemented yet in cprime)

### Overloaded functions

Overload functions are functions with name mangling. 

```cpp
void draw(struct Box* p) overload;
void draw(struct Circle* p) overload;
```

See reference : 
https://clang.llvm.org/docs/AttributeReference.html#overloadable

We can think of it as an inverse of extern "C".


### New operator


```
 postfix-expression:
   new (type-name)
   new (type-name) { }
   new (type-name) { initializer-list }
```

The objective of the new operator is allocate memory an them copy 
the default compound literal or user provided compound literal,

The allocation is done using malloc.

```cpp

struct X {
    char * name;
};

int main() {

  struct X* pX = new (struct X) {};
  if (pX != NULL)
  {
    free(pX->name);
  }
}

```
Comparison with C++: There is not constructor here. There is no need for exceptions.


So far there is no way to customize the allocator. I am considering 
other alternatives to make it generic without adding C++ complexity.

```cpp
struct X* p = malloc(sizeof * p) *= {struct X}{};
```

## Destroy operator

Destroy operator instantiates an especial function that is used 
to destroy object parts recursively.


The user can optionally inform a destructor (overloading destroy function) 
that is called just before the object destruction.

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

Pointers can be qualified with auto. 

This tells the type system that this pointer is the owner of the pointed object. When the lifetime ends it should call a function to free the resource it points to.


At this moment auto is used to generate destructors but it also could be 
used for static analysis in the future.


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

When a pointer qualified with auto is destroyed it calls 
the destructor of the pointed object and then free the memory.

By default it calls free.

Alternatively we can do,

```cpp
struct X {
    char * name = NULL;
};

void destroy(struct X* p) { free(p->name); }

int main() {
  struct X x = {};
  destroy(x);
}

```

```cpp
struct X {
    char * auto name = NULL;
};

int main()
{
  struct X* pX = new (struct X);
  destroy(pX); //warning does nothing
  destroy(*pX); //destroy the object but does not free memory

  struct X* auto pAuto = new (struct X);
  destroy(pAuto); //destroy the pointed object and calls free
  destroy(*pAuto); //destroy the object but does not free memory
}

```

Specifying a free function.

Not is not implemented yet.

```cpp
struct X {
    char * auto(customFree) name = NULL;
};


```

This is useful for custom allocator. Sometimes a pointer
to the allocator is also required, in this case the best
solution is auto() to say it is the owner pointer
but don't use this information to free it, I will do it manually
for instance at the destructor.


## Polymorphism

Pointers that can point to a specific **set of struct types**. 

Syntax:


```
 struct <tag-list> 
 
 tag-list:
  identifier
  identifier , tag-list
```

```cpp
 struct <X | Y>* p; // points to struct X or struct Y (or equivalent typedef) 
```

Structs must have a **common discriminant** that is used
in runtime to select the appropriated type.

For instance:

```cpp
 struct X {  int type = 1;  }
 struct Y {  int type = 2;  }
```

We can define a name for this type without typedef

```cpp

 struct <Box | Circle> Shape;

 struct Shape* pShape;
```

This name can be used in other pointers and the result 
is the union set of types.

```cpp
 struct <Shape | Data> Serializable;
```


The definition of the struct is automatic (auto generated). We provide only the declaration.




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

struct <Box | Circle> Shape;

int main()
{
  struct Shape * auto shapes[2] = {};
  
  shapes[0] = new (struct Box);
  shapes[1] = new (struct Circle);
  
  for (int i = 0; i < 2; i++)
  {    
    draw(shapes[i]); 

    printf("%d", shapes[i].id);
  }
  
  destroy(shapes);
}

```

The discriminant can be constant strings or enuns etc.

```cpp
struct Box {
    const char * type= "box";
};

struct Circle {
    const char * type= "circle";
};
```

(strings are not implemented yet)

We also need a way to cast. The syntax is a open question but 
the C++ syntax can be used.

```cpp
struct Box *pBox = dynamic_cast<struct Box*>(pShape);
```

Alternatives:
```cpp
struct Box *pBox = pShape as Box;

if (pShape is Box)
{

}
```
Cast from box to shape for instance are normal casts but in the future 
the compiler can check the if the types are on the same set. 


## Resizable arrays [auto]


```cpp
int a[auto];
 
  capacity(a);
  size(a);
  push(a, 1);
  reserve(a, 10);
  a[0] = 1; //ok
 
```

(not implemented yet)



## Parametrized types

(not implemented yet)

```cpp
template <typename T>
struct vector{
  T * data;
  int size;
  int capacity;
};

void F(vector<int> * v) {}

```

## Parametrized functions


```cpp
template <typename T>
struct vector
{
  T * data;
  int size;
  int capacity;
};

template<class T>
void destroy(vector<T> * v) 
{

}

template<class T>
void push(vector<T> * v, T i) {

}

int main()
{
   vector<int> v = {};
   push(v, 1);
   destroy(v);
}
/*
  if T is struct is is passed by pointer otherwise by copy. 
*/

```

