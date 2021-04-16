# Part I - Additions into C language I would like to have

September 2020

I have implemented (some of) these features in a c compiler that generates
c code.

[cprime online](/web2/cprime.html)


What is funny is that more I use C less things I want to change.


## Struct member initializer

The same syntax of declaring and initializing global variables 
but for struct members. 

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

This is the same of C++ 17. 

```cpp

  if (struct X* pX = malloc(sizeof * pX); pX)
  {    
    ...
    free(pX);
  }
  
  //pX out of scope

````

## if with initializer and defer

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


## try statement

```cpp
   try (condition);
   try (init-statement condition);
   try (init-statement condition; defer-expression);
```

try is like an if statement but it creates an imaginary compound-statement 
that is automatically closed at the end of scope.

When defer-expression exists it is executed if the condition is true 
before closing the imaginary compound-statement. 

The motivation is to avoid the indentation created by 'if' or the mess 
of many closing curly braces. 

```cpp
   int main()
   {

       try (char* s1 = malloc(100); s1; free(s1));
       try (char* s2 = malloc(100); s2; free(s2));
       if (condition)
       {
         /*ok*/
       }
   }  
```

it is equivalent of:

```cpp
   int main()
   {

       if (char* s1 = malloc(100); s1; free(s1)){
       if (char* s2 = malloc(100); s2; free(s2)){
       if (condition)
       {
          /*ok*/
       }
       }} /*<- try does this job*/
   }  
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



# Part II - Features for a "light C++"

These features are at this separated topic because they 
imply more changes in the "spirit of C" and they are more like 
"what if we had a simple C++"?



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

Open question: Should we accept string literals?

```cpp
char  *s = new ("text");
````

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

This tells the type system that this pointer is the owner of the pointed object.

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
the destructor of the pointed object.

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

