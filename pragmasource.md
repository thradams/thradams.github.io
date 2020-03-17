# Pragma Source
Description for c compiler implementation.

Besides c compiler implementation, externals tools could be created to generate make files, visual studio solution, xcode solutions etc.. or existing tools could use the same representation as well as part of their configuration.

## What is a Pragma Source?

Pragma source is a way to make source files discoverable respecting platform configuration. 

Let's say I want to create a library for console functions. 
Other projects can use this library.

I have these files:

```
Console
  Src
     ConsoleWin.c
     ConsoleLinux.c
     UnitTest.c
  Include
     Console.h     
```

We want to especify that compiling for windows we need Console.h and ConsoleWin.c, for linux we need Console.h and ConsoleLinux.c  and UnitTest is not necessary.

At Console.h we add **#pragma source**

```c

/*
   Console.h
*/

#ifdef WIN32
#pragma source "..\Scr\ConsoleWin.c"
#elif LINUX
#pragma source "..\Scr\ConsoleLinux.c"
#endif

...

```

To use this library **all we need to do is to include the Console.h**

```c
/*
  MyProgram.c
*/

#include "Console.h"

int main()
{
}
```

To compile:

```
ccompiler -DLINUX MyProgram.c
```


## Non intrusive

Let's say the library for console was created before the pragma source concept.

```
Console
  Src
     ConsoleWin.c
     ConsoleLinux.c
     UnitTest.c
  Include
     Console.h     
```
Now we can create a new file separately from the orignal distribuition:

ConsoleLib.h

```c
/*
   ConsoleLib.h
*/

#include "Console.h"

#ifdef WIN32
#pragma source ".\Console\Scr\ConsoleWin.c"
#elif LINUX
#pragma source ".\Console\Scr\ConsoleLinux.c"
#endif
```

I can now use this library in MyProgram:

```c
/*
  MyProgram.c
*/

#include "ConsoleLib.h"  
int main()
{
}
```

```
ccompiler --DWIN32 MyProgram.c
```

Imagine library non intrusive descriptions for all existing libraries: openssl, libtiff, zlib, libjpeg..
Then if you want to use some of these libraries in your project you can just copy a folder and include some file.

We also can make the entire MyProgram a module in a way that the original source files don´t need the pragma source.

MyProgram.c
```c
#include "Console.h"  
int main()
{
}
```

MyProgramModule.c
```c

/*
  MyProgramModule.c
*/

#include "ConsoleLib.h"
#pragma source "MyProgram.c"

```

```
ccompiler --DWIN32 MyProgramModule.c
```


## Implementation

Basically at preprocessor phase we collect and merge the pragma sources considering their full paths. 
Then this map is compiled in any order and some flags can mark the file as alredy compiled.

## Automatic file deduction?

If some c file has the same name of header at the same position should we consider that this file is the pragma source?

```
   File1.h
   File.c
```

Then File1.h dont need to say pragma source "File1.c"
Whould we search in other directories?

## Typing less

Empty pragma source could say "the other file is the same name just the extension is .c "
#pragma source
```c

/*
file1.h
*/

#pragma source
//means that file1.c is the pair 
```

## Other pragmas

The idea is give information about libraries and include dir.

```c
#pragma includedir ""

#pragma library ""
//see #pragma comment(lib, "lib.lib") from Microsoft compiler

```
## pragma once span

This pragma tell the compiler that this header will be expanded just once
and the parsed result can be used in the other source files.

## References

comp lang c

Universal compiler options 
https://groups.google.com/d/msg/comp.lang.c/s7HDYJBHAeQ/S7TjEpL3CgAJ 


A modular build system for C 
https://groups.google.com/d/msg/comp.lang.c/xCE7YeVNJso/CsfwiMs0AgAJ 


## Emulating pragma source

file1.h
```c
#pragma once 

void F1(); 

#ifdef EMULATE_SOURCE 
#include "file1.c" 
#endif 
```

file1.c 
```c
#include "file1.h" 
#include "file2.h" 

void F1() { 
  F2(); 
} 

```
file2.h 

```c
#pragma once 

void F2(); 

#ifdef EMULATE_SOURCE 
#include "file2.c" 
#endif 
```

main.c

```c
#include "file1.h" 
int main() { 
  F1(); 
} 
```

### Limitations

Static functions that that were working previously without conflict
now can be duplicated generating an error. 

The good point about these limitations is that we can generate 
amalgamations using simple tools that just merge files but 
they have the same restrictions about static functions. 
