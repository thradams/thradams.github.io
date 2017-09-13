```c

#include <stdio.h>
#include <setjmp.h>
#include <string.h>

struct Error
{
    jmp_buf * pCurrent;
    char buffer[200];
};

void Error_Set(struct Error* error, const char * s)
{
    strcpy(error->buffer, s);
    longjmp(*error->pCurrent, 1);
}

#define ERROR_BLOCK(error) { jmp_buf * pCurrentOld; jmp_buf jmp; int er = setjmp(jmp); if (er == 0) { pCurrentOld = (error)->pCurrent; (error)->pCurrent = &jmp; 
#define ERROR_PATH(error) (error)->pCurrent = pCurrentOld; } else {
#define ERROR_PATH_END(error) if (pCurrentOld) {(error)->pCurrent = pCurrentOld; longjmp(*pCurrentOld, er);}}}
#define STOP_PROPAGATION(error) pCurrentOld = 0; (error)->pCurrent = 0;


void F2(struct Error* error)
{
    printf("F2\n");
    Error_Set(error, "this error was set at F2");
}

void F1(struct Error* error)
{
    //Error_Set(error, "this error was set at F1 before error block");
    printf("F1\n");

    ERROR_BLOCK(error)

        //Error_Set(error, "this error was set at F1");
        F2(error);

    ERROR_PATH(error)

        printf("error path of F1\n");
        //STOP_PROPAGATION(error)
    ERROR_PATH_END(error)

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


    ERROR_BLOCK(&error)

        F1(&error);
        F3(&error);
        F4(&error);

    ERROR_PATH(&error)

        printf("%s", error.buffer);

    ERROR_PATH_END(&error)


    return 0;
}



```

