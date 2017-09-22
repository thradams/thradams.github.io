
"errorjmp.h"

```cpp

#pragma once

#include <setjmp.h>

#define _Thread_local _declspec(thread) 

_Thread_local jmp_buf* pCurrent = 0;

#define THROW longjmp(*pCurrent, 1)
#define THROW_(x) longjmp(*pCurrent, x)

#define STOP_PROPAGATION pCurrentOld = 0
#define EXCEPT_ERROR er

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
    if (er != 0 && pCurrentOld)\
    {\
        pCurrent = pCurrentOld;\
        longjmp(*pCurrentOld, EXCEPT_ERROR);\
    }\
}


```

```cpp


#include <stdio.h>
#include <string.h>
#include "errorjmp.h"


void F2() 
{ 
    printf("F2\n");
    THROW_(2);
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
        //STOP_PROPAGATION;
    }
    __EXCEPT_END
}

void F3() { printf("F3\n"); }

void F4() {  printf("F4\n"); }

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
        printf("__EXCEPT of main %d\n", EXCEPT_ERROR);
    }
    __EXCEPT_END

    return 0;
}




```

```cpp
#pragma once

#include <setjmp.h>

#define _Thread_local _declspec(thread) 

_Thread_local int errorcode = 0;

#define GOTO_ON_ERROR if (errorcode !=0) goto ERROR_LABEL; 

#define THROW errorcode = 1;  goto END_LABEL 
#define THROW_(x) errorcode = (x);  goto END_LABEL 

#define EXCEPT_ERROR errorcode 

#define __TRY if (1) 

#define __EXCEPT else  ERROR_LABEL: 

#define __EXCEPT_END if (errorcode != 0) goto END_LABEL; 

#define STOP_PROPAGATION errorcode= 0 
```

```cpp

#include <stdio.h>
#include <string.h>
#include "errorjmp.h"


void F2() 
{ 
    printf("F2\n");
    THROW_(2);
    
END_LABEL:;
}

void F1()
{
    printf("F1\n");

    __TRY
    {
        F2(); GOTO_ON_ERROR
    }
    __EXCEPT
    {
        printf("__EXCEPT of F1\n");
        //STOP_PROPAGATION;
    }
    __EXCEPT_END

   printf("__\n");

END_LABEL:;
}

void F3() { printf("F3\n"); }

void F4() {  printf("F4\n"); }

int main(int argc, char *argv[])
{
    __TRY
    {
        F1(); GOTO_ON_ERROR
        F3(); GOTO_ON_ERROR
        F4(); GOTO_ON_ERROR
    }
    __EXCEPT
    {
        printf("__EXCEPT of main %d\n", EXCEPT_ERROR);
    }
    __EXCEPT_END

    return 0;
END_LABEL:;
}




```
