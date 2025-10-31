
# Borrow Checker jorney in cake


First of all, I chose the title borrow checker because Rust made 
the term popular and it may be easier to transmit the idea.

The feature I want for C is "imaginary flags". They are imaginary because
they don´t exist in runtime.

These flags are meant to describe in code something already described 
in documentation in a way compiler can check the code. 

For instance, if we use the ```malloc``` and it returns a non 
null pointer, then we need to call ```free```. 
Compiler is not checking this.

They jorney of cake compiler for these imaginary flags started with
5 operations (set, clear, scope\_set, scope\_clear and check). 

Each declarator can have 32 imaginary flags. They are bits.

Sample:

```c
#define FLAG_1 1
int d;
_set_flag(d, FLAG_1);
static_assert(_check(d, FLAG_1) == 1);
_clear_flag(d, FLAG_1);
static_assert(_check(d, FLAG_1) == 0);
```

These imaginary operations are not dependent on runtime conditions.

For instance:

```c
void f(int i)
 int d;
 if (i > 3)
 {
	  _set_flag(d, 1);
 }
 static_assert(_check(d, 1) == 1);
```

flag will be set doens't matter the condition.


The diference from scope\_set and scope\_clear is that it changes
de flag and returns to the previous state after leaving the scope.


```c
 void * p = malloc(1);
 if (p)
 {
	  _scope_set_flag(d, NOT_NULL);
 }
```

 The sample above makes we think that we could have some default flags like 
 MAYBE\_NULL or NOT\_NULL. It also makes we think that we could have these
 default imaginary flags set automatically for us.

 
 We can do this using C23 attributes.

 ```c
 [[free]] void *malloc(int size);
 ```


 The attribute free for instance can set the flag "must free". And now
 we can add not only default flags but default semantics on these flags.
 
 Cake will check if the flag "must free" is cleared at the end of scope,
 otherwise it will print an warning.


 To clear this flag we can declare and call a function.

```c
 void free([[free]]void * p);
```

```c
 void * p = malloc(1);
 if (p)
 {
	  free(p);
 }
```
or 

```c
 void * p = malloc(1);
 /*flag must free is ON*/
 if (p)
 {

 }
 free(p);
 /*flag must free is OFF*/
```


So cake has these imaginary flags

 * must free
 * must destroy
 * uninitialized
 * maybe null
 * not null

Must destroy flag is similar of "must free". The diference 
it may be applied to structs in this way.

```c
 
struct [[destroy]] X {
  int i;
};

void x_destroy([[destroy]] struct x *p) { }

int main() {
   struct X x = {0};   
   /*flag must destroy is ON*/
   
   x_destroy(&x);

   /*flag must destroy is OFF*/
}

```


continues...

implementation is instable  at

http://thradams.com/cake/playground.html







