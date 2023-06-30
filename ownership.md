
V0.2 - 30/06/2023

## Abstract

In C, resources such as memory are managed manually. For example, we utilize the ```malloc``` function to allocate memory and store the resulting address in a variable. When the memory is no longer needed, we need the address returned by malloc to be able to call ```free```.  

Therefore, the variable holding the address is considered the owner of the memory, as this address cannot be simply discarded, otherwise we have a memory leak.

Resource leaks pose a significant challenge as they tend to be silent problems that don't immediately impact a program's behavior or cause immediate issues. Moreover, they can easily go unnoticed during unit tests, creating a false sense of security. Therefore, it is absolutely crucial to address and track these problems early on. By doing so, not only can potential complications be prevented, but it can also save valuable time and resources in the long run.

I propose we add two new type qualifiers `owner` and `view`. 
The owner qualifier will qualify the variable as the `owner` and `view` can be used to override (negate) owner.

Owner variables cannot be discarded, they must be moved or destroyed.

These qualifiers will not change the program behavior in any way.

## Syntax
  
The syntax of owner qualifier is similar of const and others. 

```c  
typedef owner int handle; 
handle a;

void * owner p = malloc(1);

int a[owner 10];
```

structs/unions/enuns can be qualified at declaration.

```c
owner struct X { ... };
```

The compiler will emit a warning in case this variable goes out of scope without being moved or destroyed.

```c
int main() {
  void * owner p = malloc(1);
} //warning variable p not moved/destroyed

```

`view` qualifier is the default. It can be used to override the owner qualifier used at the struct declaration.

```
owner struct X { ... };
int main()
{
 struct X x1;
 view struct X x2;
 x2 = x1;
}
```

## Owner pointer to owner object

When we have owner pointer to a owner object, the compiler will check if both, pointer and pointed object are moved/destroyed.  

```c
owner struct X { ... };
```

```c
int main()
{
 struct X * owner p = calloc(1, sizeof(*p)); 
} //warning owner variable p not destroyed/moved
```

```
int main()
{
 struct X * owner p = calloc(1, sizeof(*p));
 free(p);
} //warning object pointed by p, not moved/destroyed
```

```
int main()
{
 struct X * owner p = calloc(1, sizeof(*p));
 x_destroy(p);
} //warning memory pointed by p not destroyed/moved
```

```
owner struct X { ... };
int main()
{
 struct X * owner p = calloc(1, sizeof(*p));
 x_destroy(p);
 free(p);
}//ok
```


## Move assignment

The move assignment is used to transfer the ownership. After this assignment the source variable became uninitialized. The uninitialized state is not something in runtime, it is just conceptual state. If we try to use p2 after move, we receive a warning "using a uninitialized variable".

```c
void * owner p1 = malloc(1);
void * owner p2 = nullptr;
p2 = move p1;
free(p2);
```
 
Assignment a non owner variable creates a "view". 

 ```c
void * owner p1 = malloc(1);
void * p2 = nullptr;
p1 = p2;
free(p1);
```

We also can use move at initialization

```c
void * owner p1 = malloc(1);
void * p2 = move p1;
free(p2);
```

Only types qualified with owner can be on the right side of the move assignment. 

## Moving to function arguments

Passing a variable to a function is very similar of assignment. The same rules apply.

```c
owner struct list {...};
owner struct node {...};

struct list list = {0};
struct node node = {0}
...
list_add(&list, move node);

```

## Implicit move

Some moves are so obvious that we can make them optional. For instance, free, close, destroy and delete are good candidates.
For this job we can use the attribute.

```c
void list_destroy([[implicit]] struct list l) { }

int main()
{
  owner struct list {...};
  list_destroy(list);
}
```

## Returning owner type
Returning a owner variable is the same of moving it and it is implicit.

```c
struct list make()
{
  struct list {...};
  return list;
}
```


## Destructors

We can create destructors like

```c
void x_destroy(struct list list)
{
}

int main()
{
  struct list list = {};
  x_destroy(move list);
}
```

But in case we want to use pointer, we need a diferente qualifier becase owner 
pointer are owners of memory and object, and for destructors used in statck objects
we want to destroy the object only not the memory.

```c
void x_destroy(struct list* obj_owner list) {
}

int main()
{
  struct list list = {};
  x_destroy(&list);
}
```



## Owner arrays
As expected arrays and pointer are related.

```c
void array_destroy(int n, struct X a[owner n])
{
}

int main()
{
  struct X a[owner 100];
  array_destroy(100, a);
}
```

But the array syntax is similar of owner of the objects not the memory.

```c
void array_destroy(int n, struct X a[owner n])
{
}

int main()
{
  struct X * owner p = calloc(100, sizeof(struct X));
  array_destroy(100, p);
  free(p);
}
```

or

```c
void array_delete(int n, struct X * owner p)
{
}

int main()
{
  struct X * owner p = calloc(100, sizeof(struct X));
  array_delete(100, p);  
}
```

or

```c
void array_delete(int n, struct X (* owner) [onwer n])
{
}

int main()
{
  struct X * owner p = calloc(100, sizeof(struct X));
  array_delete(100, p);  
}
```


## Reality check I

Let's check if these rules can help us with ```fopen/fclose```.

```c 
FILE* owner fopen(char const* name,char const* mode);
int fclose([[implicit]] FILE* owner f);
```

```c
int main() {
  FILE * owner p = fopen("text.txt", "r");
  if (p) {
    fclose(p);
  }
}
```

We have a problem, because the not all control paths are calling the destructor and the compiler will emit an warning.

However, the code is correct because we don't need, and we cannot, call fclose on null pointer.

To solve this problem we also need null-checks in your static analyzer.  
  
**Rule**:  if we can prove that a pointer with destructor is null or uninitialized at the end of scope we don't need to destroy the object.

## Reality check I

```c
struct book {
    char * owner title;
};

void book_destroy([[dtor]] struct book * owner book)
{ 
  free(book->title);
}

void book_delete(struct book* owner book) {
    if (book) {
       book_destroy(book);
       free(book);
    }
}

struct books {
    struct book * owner * owner data;
    int size;
    int capacity;
};

void books_destroy([[dtor]] struct books * owner books) {
   for (int i = 0; i < books->size; i++) {
     book_delete(books->data[i]);
   }
   free(books->data);
}

int main() 
{
   struct books books = {};
   struct book* owner book = calloc(1, sizeof (struct book));
   if (book == NULL) goto continuation;
   
   book->title = strdup("book1");
   if (book->title == NULL) goto continuation;
   
   if (books_push_back(&books, move book) == 0) {
     book = NULL;
   }
 continuation:
  book_delete(book);
  books_destroy(&books);
}
```




## Checking the rules III
```c
int main()
{
  FILE * owner f = NULL;
  if (fopen_s( &f,"f.txt", "r") == 0)  {
    fclose(f);
  }
}
```
The problem here is that in previous fopen we could check for null to decide if we need or not a warning if the destructor is not called.

One way we could fix this is adding assert(f == NULL) for the else path.

```c
int main()
{
  FILE * auto f = NULL;
  if (fopen_s( &f,"f.txt", "r") == 0)  {
    fclose(f);
  }
  else
    assert(f == NULL);
}
```

