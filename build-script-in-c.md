# Multiplatform build with ZERO dependencies for C/C++


I will show here a simple alternative for build. 

We can add much more features starting from this simple idea.

I will use two files main.c and file.c to show the idea:


main.c

```cpp
#include "file.h"
int main() {  F(); }
```
file.h
```cpp
#pragma once
void F();
```
file.c
```cpp
#include <stdio.h>
#include "file.h"
void F() { printf("hello world\n"); }
```

Now lets create our **build.c** script:

```cpp

#include <stdlib.h>
#include <stdio.h>

/*Compiler and platform detection*/

#ifdef _MSC_VER
#define COMPILER "cl "
#elif __GNUC__ != 0
#define COMPILER "gcc "
#else
#error compiler not defined
#endif

/*Files you want*/
#define FILES "hellobuild.c file.c"

/*output*/
#define OUT "hellobuild"

#define COMMAND_LINE  COMPILER  " " FILES " -o " OUT

int main()
{
  printf("%s\n", COMMAND_LINE);
  system(COMMAND_LINE); 
}

```

How to build on linux:
```
   gcc build.c -o build
   ./build
```

How to build on windows -  Open Developer command prompt

```
   cl build.c
   build
```

That's it!

Now we can add warnings, includes, libs for each platform and each compiler...

We can make the build script more static using macros or it also can be dynamic using the args and build strings before calling 
system. 

It is up to you. 


I will try this in a real project. Comment on twitter.


### Extras

Visual C++ command line. Adding resources.

```
rc TesteWindowsApp.rc
cl /W4 TesteWindowsApp.cpp TesteWindowsApp.res  kernel32.lib user32.lib gdi32.lib winspool.lib comdlg32.lib advapi32.lib shell32.lib ole32.lib oleaut32.lib uuid.lib odbc32.lib odbccp32.lib
```

The cl compiler call the linker automatically.

[See also](https://docs.microsoft.com/en-us/cpp/build/reference/compiler-command-line-syntax?view=msvc-160)


