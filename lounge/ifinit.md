```c


#include <stdio.h>
#include <stdlib.h>
#include <string.h>


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
