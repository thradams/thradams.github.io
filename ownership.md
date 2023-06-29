
## Abstract
In C, there are several functions that must be called in pairs. For instance, ```fopen/fclose```, ```malloc/free``` and so on.    
  
In this text, I will use the term "destructor" to refer to the closing function, such as ```fclose``` and ```free```.
   
When the programmer forgets to call the destructor, it can lead to memory leaks and other problems. In many scenarios, they are silent problems, as they may not affect the program's behavior or cause immediate issues.  They can even go undetected during unit tests, giving a false sense of stability.

Our objective, is to check the correct usage of the destructor during the compilation issuing warnings when the programmer forgets to call it. 

## Defining destructors
The following types can have destructors:

 * structs/unions
 * pointers
 * arrays
 
## Destructors for struct/union

We declare struct/union have a destructor adding ~ before the tag name. 

```c  
struct ~ X {...};  
```

Then if we don't call it's destructor we have a warning

```c
int main()
{
  struct X x = {};
  //warning destructor of x not called
}
```

To eliminate the warning we need to destroy the variable before the end of scope.   
  
For this task, what we have is a kind of destructive parameter. We define this parameter adding ~.

```c  
void x_destroy(~ struct X * p){...}
```

Then:

```c
int main()
{
  struct X x = {};
  x_destroy(&x);
}
```

In case we have struct members with destructors, at the destructor implementation we need to call all destructors members as well.

```c  
struct ~ Y {...};  

struct ~ X {
   struct Y y;
};

void x_destroy(~ struct X * p) {
  /*
    warning destructor 
    of p->y not called
  */
}
```


## Destructors for pointers

Adding auto after * (like const qualifier) creates a pointer that needs destructor. We are going to call them owner pointer.

Sample

```c
void * auto malloc(size_t n);

int main()
{
  int * auto p = malloc(1);
  //warning destructor of p not called
} 
```

The destructor syntax of owner pointer is 

```c
void free(~ int * auto p);
```

**Rule** : We cannot call pointer destructor for non owner pointers.

**Rule**: If the pointed object has destructor then we also need to call the destructor of the pointed object.

Sample:

```c
int main() {
  struct X * auto p = malloc(sizeof(struct X));
  free(p);
} //warning, not calling the destructor of the pointed object
```

We can do the following

```c
void x_delete(~struct X * auto p) {
   x_destroy(p->x);
   free((void*)p);
}
int main() {
  struct X * auto p = malloc(1);
  x_delete(p);
}
```

**Rule** Similarly of what happens with struct members, the compiler must check that at the implementation of x_delete we call the destructor of struct X or each destructor of x members.


```c
void x_delete(~struct X * auto p) {  
  //x_destroy(p);
  free(p);
} //warning destructor of X not called
```

We can pass owner pointers normally for function using non owning pointers.

```c
void x_print(struct X * p);   
int main(){
  struct X * auto p = malloc(sizeof(struct X));
  x_printf(p);
  x_delete(p);
}
```

Destructor for void * is an especial case.

## Destructor for arrays

We use [auto] to declare the array needs a destructor, and like pointer we add ~in function arguments to create destructors.
   
```c
void x_array_destroy(int n, ~ struct X x[auto n]){
  for (int i = 0; i < n; i++) x_destroy(x[i]);  
}
int main() {
  struct X a[auto 10] = {};
  x_array_destroy(10, a);
}
```

We also can call array destructors using owner pointers.

```c
void f() {
  struct X * auto p = calloc(10, sizeof(struct X));
  x_array_destroy(10, p);
  free(p);
}
```


## Checking the rules I
Let's check if these rules can help us with ```fopen/fclose```.

```c 
FILE* auto fopen(char const* name,char const* mode);
int fclose(~ FILE* auto f);
```

```c
int main() {
  FILE * auto p = fopen("text.txt", "r");
  if (p) {
    fclose(p);
  }
}
```

We have a problem, because the not all control paths are calling the destructor and the compiler will emit an warning.

However, the code is correct because we don't need, and we cannot, call fclose on null pointer.

To solve this problem we also need null-checks in your static analyzer.  
  
**Rule**:  if we can prove that a pointer with destructor is null or uninitialized at the end of scope we don't need to destroy the object.


## Move assignment
We can move one variable to another using the move assignment.

```
a = move b;
```

This move will make b 'uninitialized'.
The variable a must be null (all zeros) or 'uninitialized'.

a and b types must have destructor.

a object is ending it's live time, we need ensure it is null, all zero, or uninitialized.

This may be a little hard for struct member, then we can override this information using assert.

## Returning types with destructor
When returning local variable (pointer or struct/union) that have destructor the object is moved automatically.

**Rule** Returning a type with destructor requires the caller to not ignore the result.

## Moving variables to function arguments
We also can move objects to function arguments, similarly of the move assignment.

```c
void list_add(struct list* list, struct node item){}
list_add(&list, move item);
//item is uninitialized here
```

```
void list_add(struct list* list, struct node* auto item){}
list_add(&list, move p_item);
//p_item is uninitialized here
```

## Checking the rules II

```c
struct book {
    char * auto title;
};

void book_destroy(~ struct book* book)
{ 
  free(book->title);
}

void book_delete(~ struct book* auto book) {
    if (book) {
       book_destroy(book);
       free(book);
    }
}

struct books {
    struct book * auto * auto data;
    int size;
    int capacity;
};

void books_destroy(~ struct books * books) {
   for (int i = 0; i < books->size; i++) {
     book_delete(books->data[i]);
   }
   free(books->data);
}

int main() 
{
   struct books books = {};
   struct book* auto book = calloc(1, sizeof (struct book));
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
  FILE * auto f = NULL;
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

