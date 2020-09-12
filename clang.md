# Additions into C language I would like to have

September 2020

See the current implementation online  

[cprime online](/web2/cprime.html)


## Member initializer

```cpp

struct X {
   int i = 1;
   struct Point pt = { .x = 1, .y = 1 };
};

```

C++ compararion: This is very similar. The only diference is that in C++ 
the init expression does not need to be a constant expression.



## Empty Initializer/Compound literal

Static initialization using the values of member initializer. 

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

The new operator allocates memory (using malloc) 
and if it succeeds it initialize the memory using 
the compound literal. 

https://en.cppreference.com/w/c/language/compound_literal

The { initializer-list } can be omitted and in this case 
it results in the default.



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
Comparion with C++: There is not constructor here. There is no need for exceptions.

Open question: Should we accept string literals?

```cpp
char  *s = new ("text");
````

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

Pointers can be qualified with auto. This tells the type system 
that this pointer is the onwer of the pointed object.

This information is used to generate destructors.

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
the destructor of the pointed object. So in this case the user 
does not need to overload destroy and free the name. He also can 
do this, in this case just removing auto.


## if with initializer 

This is the same of C++.  

Together with auto it creates an interesting pattern.

```cpp

  if (struct X* auto pX = new (struct X), p)
  {
    /*The scope of pX corresponds where it is alive*/
    destroy(pX);
  }
  

````

## if with initializer and defer

Here we add an extra expression that is executed at the end of 
scope.

```cpp
  if (struct X* auto pX = new (struct X), p, destroy(pX))
  {
        
  }

```

Open question:  What happend when break, return or goto is called?

Option 1: ban these keywords in this context.

Option2: call the defer expression before jump.


## Lambdas 

Similar of C++ but without capture.

```
 lambda-expression:
    [] ( parameters opt ) compound-statement
    [] compound-statement
```


## Polimorphism

Pointers that can point to a especific **set of types**.

If you set of types have a **common discriminant** we also can  
select the appropriated object in runtime according with the type.

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



