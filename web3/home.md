[Home](home.html) | [Manual](manual.html) | [Playground]([playground.html)

# Home

This is a C23 front end compiler written from scratch in C by (twitter @thradams) as a hobby project.

It can be used for:

* Static Analisys
* Refatoring
* Code Documentation
* Add a backend (webassembly for instance)
* Code transformation
        
My main motivation was static analsis and experiment new ideas for the C language compiling experimental code to standard C.

C23 have introduced many features like attributes,digit separators etc.. that would not even parse in previous compilers. So I decided to experiment some code transformation from C23 to C99. The front end has a C input standard and a C output standard.
Features

* Preprocessor
* Syntax analisys
* Semantic analyss (incomplete)
* Stantandard C back end

Semantic analisys is required for static_analisys and sometimes for code generation.

The source code is multiplatform. I use Visual Studio to debug and and the front end can parse and generate itself.
Some microsoft extensions where added. 

## Source code

Source code for this project is not published yet.

## References

[n2912.pdf (C23 Draft)](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n2912.pdf)

[clang C23 status](https://clang.llvm.org/c_status.html)

[C23 gcc status?]()

[cppreference](https://en.cppreference.com/w/c/23)

