[Home](home.html) | [Manual](manual.html) | [Playground]([playground.html)

# Manual

This manual explains the changes the compiler does when compiling
C23 to previous versions.

## Command line
option 	description

* -r 	Remove code comments
* -E 	Preprocess to console
* -rm 	Remove macros, output as compiler sees
* -std=c99 	Input language standard, use: -std=c99, -std=c11, -std=c2x

## Token level changes

These changes are done using tokens not AST. This has the advantage
of working in preprocessor.

 * Digit separators
 * Binary literals
 * elifdef
 * u8 literals
 

## Pragma expand

Tells the C back end to expand the MACRO.

```c
#define SWAP(a, b) \
    do { \
      typeof(a) temp = a; a = b; b = temp; \
    } while(0)


#pragma expand SWAP


int main()
{
   int a = 1;
   typeof(a) b = 2;
   SWAP(a, b);
   return 1;
}

```

```c
#define SWAP(a, b) \
    do { \
      typeof(a) temp = a; a = b; b = temp; \
    } while(0)

#pragma expand SWAP

int main()
{
   int a = 1;
   int b = 2;
    do {int temp = a; a = b; b = temp; } while(0);
   return 1;
}
```
