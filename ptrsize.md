
## Pointer + size in C

I created this post in respose of 
https://news.ycombinator.com/edit?id=34084894


Sample there was

```c
//Checked C:

    int a[5] = { 0, 1, 2, 3, 4};
    _Array_ptr<int> p : count(5) = a;  // p points to 5 elements.

//My proposal for C:

    int a[5] = { 0, 1, 2, 3, 4};
    int p[..] = a;  // p points to 5 elements.

```

We can do this in C.

```c
    int a[5] = { 0, 1, 2, 3, 4};
    int (*p)[sizeof(a)/sizeof(a[0])] = &a;  // p points to array of 5 elements.
```

The diference is that we have a pointer to array of 5 elements. 
and not a pointer to the first element of a sequence of 5.


Let`s see your current options.

For fixed size we can have just

```c
 int a[5] = { 0, 1, 2, 3, 4};
```

and we have a type that is knows its size in compile time.

But, passing an array to a function it will lose the size

```c
 void f(int a[5]){
   //a is just a pointer here
 }
   
 int main() {
     int a[5] = { 0, 1, 2, 3, 4};
     f(a);
 }

```


One  alternative is to pass a pointer to array[5] then we don`t lose
the type size.

```c

 void f(int (*a)[5]){
   (*a)[4]=1;
 }
   
 int main() {
     int a[5] = { 0, 1, 2, 3, 4};
     f(&a);
 }

```

The problem in this case the syntax becames (*a)[index] instead
of just a[index]. 

Another alternative is use static

```c

 void f(int a[static 5]){

 }
   
 int main() {
     int a[5] = { 0, 1, 2, 3, 4};
     f(a);
 }


```

Doing this the compiler may or may not complaing if we pass
the an smaller size. The problem is that there is no garantee. Some compilers (msvc) 
dont even parse this.

We also can use variable modified types. Doing this the type has a connection
with a variable that have the size.

```c

 void f(int n, int a[n]){
   
 }
   
 void f1(int n) {
     int a[5] = { 0, 1, 2, 3, 4};
     f(sizeof(a)/sizeof(a[0]), a);
 }

 int main() {
    f1(1);
 }

```


In this case the size is not magically hidden
inside the type. Instead it is explicitly in some variable
that needs to be present. In this case the size was
passed as first argument.

There is one problem. The size argument needs to come 
before the array. And we cannot this type as structs member
because there is not way to connect to the struct member
that represents the size.


We also can create pointer to variable modified array types
created on the heap.

```c
#include <stdlib.h>

 void f(int n, int a[n]){
   
 }
   
 void f1(int n) {
     
     int (*a)[n] = calloc(n, sizeof(int));
     f(n, *a);
 }

 int main() {
    f1(1);
 }

```

If the objetive of the proposal is security I think C compiler already have
ways of understanding static or dynamic sizes for arrays. Maybe
compilers are not doing a great job on this or programmers
are not using this in a safer style.

Even without any new syntax I believe static analisers should
take into account the size we declare here.

```c
 void f(int a[4]){}
 ```

 I didn`d find more details about  ```int p[..] = a;``` idea
 but it should try to address any of the problems we have
 today maybe ofering a better ergonomy.

 For instance, having to pass the size manually and
 before the variable modified array.

```c
#include <stdlib.h>

 void f(int a[..]){
    
    //we could have a hidden size variable
    //that can be extracted if necessary. 
    //_vla_size(a)
 }
   
 void f1(int n) {
     
     int (*a)[n] = calloc(n, sizeof(int));
     f(*a);
 }

 int main() {
    f1(1);
 }

```

or better syntax to not having to use (*a)[index] and just a[index]
knowing the pointer variable associated with it.


