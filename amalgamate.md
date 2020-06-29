# Amalgamation

This tool merges c source files and headers to create the amalgamation.

```cpp

void almagamate(const char* file_name_out, bool bHeaderMode, const char* files[], int count);

//Sample:

 chdir("../lib/");

    const char* files[] = {
         "file1.c",
         "file2.c",
    };

    almagamate("lib.c", /*bHeaderMode*/false, files, (sizeof(files) / sizeof(files[0])));

    const char* headers[] = {
        "Header1.h",
        "Header2.h",
    };


    almagamate("http.h",  /*bHeaderMode*/true, headers, (sizeof(headers) / sizeof(headers[0])));
```

When **bHeaderMode** is true only some regions  are included.

For instance:

```c
//My header file

#pragma once

..etc..

# //BEGIN_EXPORT
//only this part is included
# //END_EXPORT

```

For C source file the files are merged normaly (each header/source is included once)

 * pragma once is removed
 * #undefs are generated for each macro defined inside .c files
 * static function needs to be managed by the user (don't use two static functions with the same name)


* Make unique function/variables names even for internal linkage (static)

## Similar tools

https://github.com/svaarala/duktape/blob/master/tools/combine_src.py

https://github.com/vinniefalco/Amalgamate
