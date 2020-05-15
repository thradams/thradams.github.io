# The language between C and C++ I would like to have

Updated 15 May 2020

## Objetive

Add the minimum possible set of features to remove boilerplate code from C.

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

## Template functions

User can write template functions using the keyword typename.

Sample

```c
void swap(typename* a, typename* b)
{
   decltype(a) temp = *a;
   *a = *b;
   *b = temp;
}

int main()
{
  struct X x1;
  struct X x2;
  
  swap(&x1, &x2);
}
```

The compiler has some built-in template functions.

```c
typename auto * new(typename value)
{
   decltype(value)* p  = malloc(sizeof * p);
   if (p)
   {
     *p = value;
   }
   return p;
}

void delete(typename * auto p)
{
   if (p)
   {
      destroy(p)
      free(p);
   }
}

void destroy(typename * p)
{
  /*
    this function cannot be written just by
    parametrization
    
    this is an especial function.
    
    The default implementation of destroy calls each destroy of each member
    recursivally.

  */
}
```


### Using new and delete


```cpp

struct X {
    char * name = NULL;
};

int main() {
  struct X* pX = new ((struct X) {});
  delete(pX);
}

```

## The template function destroy is called at the end of scope

The compiler calls the template function destroy at the end of scope.

```cpp
struct Person {
    char * name = NULL;
};

int main() {

   struct Person x;

} //destroy(x) called
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
When a pointer qualified with auto is destroyed it calls the delete template function.

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


## if with initializer 
Same of C++.  Togueter with auto it creates an interting pattern.

```cpp

  if (struct X* auto pX = new((struct X){}), p)
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

If you set of types have a common discriminant we also can select the
appropriated operator in runtime according with the type.

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

## Resizable arrays

```cpp

 void push(typename a[auto], typename item)
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
 
 int a[auto];
 push(a, 1);
 
 a.data[0] = 1; //ok
 a[0] = 1; //ok
 
```
## Parametrized structs

Just like C++.

```c
template<class T1, class T2> struct map
{  
 T1 data1;
 T2 data2;
};

struct map<int, string> map;

```


## Standard build system 
Pragma source is a way to make source files discoverable respecting platform configuration.
This allow compilers and other tools like lint finds the source code in a standard way.
 
[Pragma source](pragmasource.md)




