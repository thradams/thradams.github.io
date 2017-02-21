===FileDepends===


**FileDepends** is command line tool that shows the file include dependencies recursively.

It also shows the corresponding .cpp file.

For instance, if you have:
{{{
a.h
a.cpp
}}}
and

b.h
{{{
#include "a.h"
class B { A a; };
}}}

Running the command line:
{{{
filedepends b.h
}}}
Results:
{{{
=== standard C++ headers ===
Total : 0

=== Header Files === 

c:\YourDir\a.h
c:\YourDir\b.h
Total : 2

=== Implementation ===
c:\YourDir\a.cpp
c:\YourDir\b.cpp
}}}

If you have self-sufficient headers then the result is which files you need to use to declare and implement the specific class/functions declared in analyzed header.

[[filedepends.zip|Download Visual C++ Project]]

**Note1**: The FileDepends is a simple tool and it doesn't have a pre-processor.

**Note2**: The source code if free, and you can use it and change ir for your needs.

**Note3**: This software is provided "as is" without express or implied
 warranty, and with no claim as to its suitability for any purpose.


Command line help
{{{
filedepends file.h [optional include dir1] [optional include dir2] ...
}}}

See also:

[[http://www.drdobbs.com/184401705]]


===History===
* 29/11/2010 published


