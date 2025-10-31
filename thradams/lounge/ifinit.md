Macro emulating a new feature for the C language that allow
if with initialization and  "defer"


One macro also emulating c++ 17 if initializer

```cpp

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define defer(init, defer) for(init, *ptemp=(void*)1; ptemp; (defer), ptemp=0)

#define _if(init, condition) for(init, *ptemp=(void*)1; (condition) && ptemp; ptemp=0)

#define __if(init, condition, defer) for(init, *ptemp=(void*)1; ptemp && (condition)  ; (defer), ptemp=0)

int main()
{

  _if(char* s = malloc(10), s)
  {
  }

  __if(FILE* f = fopen("file.txt", "w"), f, fclose(f))
  {
    fprintf(f, "hi!");
  }

  __if(char* s = malloc(10), s, free(s))
  {
  }
}



```

References:

C++ if
https://en.cppreference.com/w/cpp/language/if


http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2016/p0305r0.html

proposal P00305r0