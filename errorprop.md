
"errorjmp.h"

```c
#pragma once

#include <setjmp.h>

#define _Thread_local _declspec(thread) 

_Thread_local jmp_buf* pCurrent = 0;

#define THROW longjmp(*pCurrent, 1)

#define ERROR_BLOCK \
{\
  jmp_buf* pCurrentOld = pCurrent; \
  jmp_buf jmp; \
  int er = setjmp(jmp); \
  if (er == 0)\
  {\
    pCurrent = &jmp;
  
#define ERROR_PATH \
    pCurrent = pCurrentOld; \
  }\
  else\
  { \

#define ERROR_PATH_END \
    if (pCurrentOld)\
    {\
      pCurrent = pCurrentOld; \
      longjmp(*pCurrentOld, 1);\
    }\
  }\
 }

#define STOP_PROPAGATION pCurrentOld = 0



#define __TRY \
{\
    jmp_buf* pCurrentOld = pCurrent;\
    jmp_buf jmp;\
    int er = setjmp(jmp);\
    if (er == 0)\
    {\
        pCurrent = &jmp;\
    }\
    if (er == 0)
        
#define __EXCEPT\
    if (er == 0)\
    {\
        pCurrent = pCurrentOld;\
    }\
    else

#define __EXCEPT_END \
    if (er == 1 && pCurrentOld)\
    {\
        pCurrent = pCurrentOld;\
        longjmp(*pCurrentOld, 1);\
    }\
}

```

```c

#include <stdio.h>
#include <string.h>
#include "errorjmp.h"


void F2()
{
    printf("F2\n");
    THROW;
}

void F1()
{
    printf("F1\n");

    __TRY
    {
        F2();
    }
    __EXCEPT
    {
        printf("__EXCEPT of F1\n");
        STOP_PROPAGATION;
    }
    __EXCEPT_END
}

void F3()
{
    printf("F3\n");
}

void F4()
{
    printf("F4\n");
}


int main(int argc, char *argv[])
{
    __TRY
    {
        F1();
        F3();
        F4();
    }
    __EXCEPT
    {
        printf("__EXCEPT of main\n");
    }
    __EXCEPT_END

    return 0;
}




```

