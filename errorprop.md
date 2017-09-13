
```c
#pragma once

#include <setjmp.h>

typedef jmp_buf* errorjmp_t;

void errorjmp_set(errorjmp_t e) { longjmp(*e, 1); }


#define ERROR_BLOCK(error) \
{\
  errorjmp_t* pCurrent = (error); \
  errorjmp_t  pCurrentOld; \
  jmp_buf jmp; \
  int er = setjmp(jmp); \
  if (er == 0)\
  {\
    pCurrentOld = *pCurrent; \
    *pCurrent = &jmp;
  

#define ERROR_PATH *pCurrent = pCurrentOld; \
  }\
  else\
  { \

#define ERROR_PATH_END \
    if (pCurrentOld)\
    {\
      *pCurrent = pCurrentOld; \
      longjmp(*pCurrentOld, 1);\
    }\
  }\
 }

#define STOP_PROPAGATION pCurrentOld = 0; *pCurrent = 0;


```

```c

#include <stdio.h>
#include <string.h>
#include "errorjmp.h"

struct Error
{
    errorjmp_t errorjmp;
    char buffer[200];
};

void Error_Set(struct Error* error, const char * s)
{
    strcpy(error->buffer, s);
    errorjmp_set(error->errorjmp);
}

void F2(struct Error* error)
{
    printf("F2\n");
    Error_Set(error, "this error was set at F2");
}

void F1(struct Error* error)
{
    //Error_Set(error, "this error was set at F1 before error block");
    printf("F1\n");

    ERROR_BLOCK(&error->errorjmp)

        //Error_Set(error, "this error was set at F1");
        F2(error);

    ERROR_PATH

        printf("error path of F1\n");
        //STOP_PROPAGATION(error)
    ERROR_PATH_END

}

void F3(struct Error* error)
{
    printf("F3\n");
    //Error_Set(error, "this error was set at F3");
}

void F4(struct Error* error)
{
    printf("F4\n");
}


int main(int argc, char *argv[])
{
    struct Error error = { 0 };


    ERROR_BLOCK(&error.errorjmp)
        //Error_Set(&error, "a");
        F1(&error);
        F3(&error);
        F4(&error);

    ERROR_PATH

        printf("%s", error.buffer);

    ERROR_PATH_END


    return 0;
}






```

