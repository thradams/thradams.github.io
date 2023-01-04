# what if structs were passed by pointers?



On early versions of C, structs could not be passed as functions arguments 
direclty, only pointer to struct could be used. 

At the first edition of "The C programming language" we can see this was not
impemented yet.[1]

Besides, structs arguments, returning structs from funtions were not allowed
and copy was not implemented. All this features came together. 

This was the point in history where the decision "pass structs by copy or reference" was made.


BYTE magazine 1983 has an intersting description.

"Some compilers accept the structure name without & while still passing
only a pointer..." [2]

This tell us some compilers were passing structs by refefernce even without
address of operator. I imagine the declaration of the argument still a pointer.

What are the reason behing this design? 
Maybe because "const" was not added yet, so this would be a way to prevent 
unwanted changes on the structs?
Maybe because simple types are passed with copy?

You also may imagine the design was choosen to not create an expetion on the type
system. But the exepeton already exists. 

Arrays are passed by reference.


Many decalers later, I write C code and 99.9%  of time I pass
structs by pointers.





```c

#include <stdio.h>
struct X { int i; };

void F(struct X x) { x.i = 2; /*changes a copy*/}

int main() {
  struct X x = {0};
  F(x);
  printf("%d", x.i); //prints 0
}

```


Some compilers use to pass structs to function without & as we can 
see on Byte magazine August 1983, pag 168

"Some compilers accept the structure
name without & while still passing
only a pointer, and they mayor may
not give a warning message telling
what's going on. Obviously this can
lead to trouble if you then transport
that code into a true Unix version 7
environment." [2]

I didn[t find the motivation for this design, but I may suspect
that the objective was to make each function 






```c
#include <stdio.h>

void F(int a[10]) { a[0] = 2; }

int main() {
  int a[] = {0, 0, 0};
  F(a);
  printf("%d", a[0]); //prints 2
}

```

Most of code I write in C pass structs by pointer because
most of time we don´t need copies.

https://csapp.cs.cmu.edu/3e/docs/chistory.html


# References

[1] See first edition of "The C programming language " 1978.

"There are a number of restrictions on C structures. The essential rules
are that the only operations that you can perform on a structure are take its
address with &, and access one of its members. This implies that structures
may not be assigned to or copied as a unit, and that they can not be passed
to or returned from functions." 


[2] https://ia800309.us.archive.org/26/items/byte-magazine-1983-08/1983_08_BYTE_08-08_The_C_Language.pdf
[1] https://www.bell-labs.com/usr/dmr/www/cchanges.pdf

