

## Make Tests

This program scans the source files passed on the command line and collects 
test functions that are inside ifdef TEST. It generates an ouputfile 
tha calls all test functions.

```
maketest output.c file1.c file2.c ....
```
Sample:

file1.c
```cpp
#ifdef TEST
void MyTestCase(void)
{
}
#endif
```

file2.c
```cpp
#ifdef TEST
void MyTestCase2(void)
{
}
#endif
```

```
maketest output.c file1.c
```

generates output.c

```cpp
#ifdef TEST

//forward declarations

//file1.c
void MyTestCase(void);

//file2.c
void MyTestCase2(void);

void DoUnitTests(void)
{
    //file1.c
    MyTestCase();    
    
    //file2.c
    MyTestCase2();    
}
#else
; //removes warning C4206: nonstandard extension used: translation unit is empty
#endif

```

## How Do I use it?

I define my ASSERT at unittest.h

```cpp
#pragma once

#include <stdio.h>
#include "terminal.h" /*colors*/

#define RESET ESC "[0m"

#define ASSERT(B) printf("%*d : ",  4, __LINE__ ); \
                  if (!(B)) {\
                      printf(RED "ERROR!" RESET); \
                      printf(" '%s' \n", #B); \
                      exit(1); \
                  } \
                  else {\
                      printf(GREEN "    OK" RESET);\
                      printf(" '%s' \n", #B); \
                  }

```

```cpp
/*
   Normal code goes here...
*/

#ifdef TEST
#include "unittest.h"
void MyTestCase2(void)
{
    ASSERT(1 == 1);
}
#endif
```

My program:

```cpp
#ifdef TEST
void DoUnitTests(void);//lint !e2701
#endif

int main(int argc, char** argv)
{
#ifdef TEST
        DoUnitTests();
#endif

```
---

maketest source code:

```cpp

#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <stdbool.h>
#include <sys/stat.h>

struct Test
{
    char name[100];
    struct Test* pNext;
    int bFileName;
};

struct TestList
{
    struct Test* pHead;
    struct Test* pTail;
};

static void Destroy(struct TestList* list)
{
    struct Test* pCurrent = list->pHead;
    while (pCurrent)
    {
        struct Test* pNext = pCurrent->pNext;
        free(pCurrent);
        pCurrent = pNext;
    }
}

static void Append(struct TestList* list, struct Test* p)
{
    if (list->pTail == NULL)
    {
        list->pHead = p;
        list->pTail = p;
    }
    else {
        list->pTail->pNext = p;
        list->pTail = p;
    }
}
enum Token
{
    IDENTIFER,
    OTHER,
    PRE,
    COMMENT,
    STRING,
    SPACES,
    NUMBER,
};

static const char* GetTokenName(enum Token e)
{
    switch (e)
    {
        case IDENTIFER: return "IDENTIFER";
        case OTHER:     return "    OTHER";
        case PRE:       return "      PRE";
        case COMMENT:   return "  COMMENT";
        case STRING:    return "   STRING";
        case SPACES:    return "   SPACES";
        case NUMBER:    return "   NUMBER";
    }
    return "??";
}
static enum Token Match(FILE* f, char* dest, int destsize)
{
    dest[0] = 0;

    if (ferror(f) || feof(f))
        return OTHER;



REPEAT:;
    
    enum Token tk = OTHER;
    int count = 0;
    char ch = fgetc(f);

    if ((ch >= 'a' && ch <= 'z') ||
        (ch >= 'A' && ch <= 'Z') ||
        ch == '_')
    {
        tk = IDENTIFER;

        if (count < destsize - 1)
        {
            dest[count] = ch;
            count++;
        }

        while (
            ((ch = fgetc(f)) != EOF) &&
            (ch >= 'a' && ch <= 'z') ||
            (ch >= 'A' && ch <= 'Z') ||
            (ch >= '0' && ch <= '9') ||
            ch == '_')
        {
            if (count < destsize - 1)
            {
                dest[count] = ch;
                count++;
            }
        }
        ungetc(ch, f);
    }
    else if (ch >= '0' && ch <= '9')
    {
        tk = NUMBER;
        dest[count] = ch;
        if (count < destsize - 1)
        {
            dest[count] = ch;
            count++;
        }

        while (((ch = fgetc(f)) != EOF) &&
               (ch >= '0' && ch <= '9'))
        {
            if (count < destsize - 1)
            {
                dest[count] = ch;
                count++;
            }
        }
        ungetc(ch, f);
    }
    else if (ch == '\'' || ch == '"')
    {
        char type = ch;

        tk = STRING;
        if (count < destsize - 1)
        {
            dest[count] = ch;
            count++;
        }

        while (((ch = fgetc(f)) != EOF))
        {
            if (ch == '\\')
            {
                if (count < destsize - 1)
                {
                    dest[count] = ch;
                    count++;
                }
                ch = fgetc(f);
                if (count < destsize - 1)
                {
                    dest[count] = ch;
                    count++;
                }
            }
            else if (ch == type)
            {
                if (count < destsize - 1)
                {
                    dest[count] = ch;
                    count++;
                }
                break;
            }
            else
            {
                if (count < destsize - 1)
                {
                    dest[count] = ch;
                    count++;
                }
            }
        }
    }
    else if (ch == ' ' || ch == '\n' || ch == '\r')
    {
        tk = SPACES;
        if (count < destsize - 1)
        {
            dest[count] = ch;
            count++;
        }

        while ((ch = getc(f)) != EOF)
        {
            if (!(ch == ' ' || ch == '\n' || ch == '\r'))
            {
                ungetc(ch, f);
                break;
            }
            if (count < destsize - 1)
            {
                dest[count] = ch;
                count++;
            }
        }
        goto REPEAT;
    }
    else if (ch == '/')
    {
        tk = OTHER;
        if (count < destsize - 1)
        {
            dest[count] = ch;
            count++;
        }
        ch = fgetc(f);

        if (ch == '/')
        {
            if (count < destsize - 1)
            {
                dest[count] = ch;
                count++;
            }

            tk = COMMENT;

            while (
                ((ch = fgetc(f)) != EOF) &&
                ch != '\r' &&
                ch != '\n' &&
                ch != '\0')
            {
                if (count < destsize - 1)
                {
                    dest[count] = ch;
                    count++;
                }
            }
        }
        else if (ch == '*')
        {
            tk = COMMENT;
            if (count < destsize - 1)
            {
                dest[count] = ch;
                count++;
            }

            ch = fgetc(f);

            while (!feof(f))
            {
                if (ch == '*')
                {
                    if (count < destsize - 1)
                    {
                        dest[count] = ch;
                        count++;
                    }

                    ch = fgetc(f);
                    if (ch == '/')
                    {
                        if (count < destsize - 1)
                        {
                            dest[count] = ch;
                            count++;
                        }
                        break;
                    }
                }
                else
                {
                    if (count < destsize - 1)
                    {
                        dest[count] = ch;
                        count++;
                    }
                }
                ch = fgetc(f);
            }
            goto REPEAT;
        }
        else
        {
            if (count < destsize - 1)
            {
                dest[count] = ch;
                count++;
            }
            ungetc(ch, f);
        }
    }
    else if (ch == '#')
    {
        tk = PRE;
        if (count < destsize - 1)
        {
            dest[count] = ch;
            count++;
        }
        while (((ch = fgetc(f)) != EOF) && ch != '\r' && ch != '\n')
        {
            if (count < destsize - 1)
            {
                dest[count] = ch;
                count++;
            }
        }
        
        if (ch == '\r')
        {
            ch = fgetc(f); // \n
        }
        
    }
    else
    {
        if (count < destsize - 1)
        {
            dest[count] = ch;
            count++;
        }
    }

    dest[count] = '\0';
    return tk;
}


static void CollectTests(FILE* f, struct TestList* list)
{
    int ifdefcount = 0;
    int ActiveSession = 0;

    while (!feof(f))
    {
        char lexeme[100];
        enum Token tk = Match(f, lexeme, sizeof lexeme);

        if (tk == PRE)
        {
            if (strcmp(lexeme, "#ifdef TEST") == 0)
            {
                ifdefcount = 1;
                ActiveSession = 1;
            }
            else if (strncmp(lexeme, "#ifdef", sizeof("#ifdef") - 1) == 0 ||
                     strncmp(lexeme, "#if", sizeof("#if") - 1) == 0 ||
                     strncmp(lexeme, "#ifndef", sizeof("#ifndef") - 1) == 0)
            {
                ifdefcount++;
            }
            else if (strcmp(lexeme, "#endif") == 0)
            {
                ifdefcount--;
                if (ifdefcount == 0)
                {
                    /*we are leaving the #ifdef TEST*/
                    ActiveSession = 0;
                }
            }
        }
        else if (tk == IDENTIFER && ActiveSession == 1)
        {
            //template
            // void name ( optional void ) {
            do
            {
                if (strcmp(lexeme, "void") != 0) break;
                tk = Match(f, lexeme, sizeof lexeme);
                if (tk != IDENTIFER) break;
                char name[200] = { 0 };
                strncpy(name, lexeme, sizeof name);
                tk = Match(f, lexeme, sizeof lexeme);
                if (strcmp(lexeme, "(") != 0) break;
                tk = Match(f, lexeme, sizeof lexeme);

                if (strcmp(lexeme, "void") == 0)
                {
                    /*optional*/
                    tk = Match(f, lexeme, sizeof lexeme);
                }
                if (strcmp(lexeme, ")") != 0) break;

                tk = Match(f, lexeme, sizeof lexeme);
                if (strcmp(lexeme, "{") != 0) break;

                //Pattern match! void name ( void ) {
                struct Test* p = calloc(1, sizeof * p);
                if (p)
                {
                    p->bFileName = 0;
                    strcpy(p->name, name);
                    printf("  %s\n", p->name);
                    Append(list, p);
                }
            }
            while (0);
        }
    }
}

void CollectTestsFile(const char* file, struct TestList* list)
{
    FILE* f = fopen(file, "r");
    if (f)
    {
        /*while (!feof(f))
        {
            char lexeme[100];
            enum Token tk = Match(f, lexeme, sizeof lexeme);
            printf("%s '%s'\n", GetTokenName(tk), lexeme);
        }*/


        struct Test* p = calloc(1, sizeof * p);
        if (p)
        {
            p->bFileName = 1;
            strcpy(p->name, file);
            Append(list, p);
        }

        printf("%s\n", file);
        CollectTests(f, list);
        fclose(f);
    }
}

void Generate(const char* output, struct TestList* list)
{
    FILE* fout = fopen(output, "w");
    if (fout)
    {

        fprintf(fout, "#ifdef TEST\n\n");
        fprintf(fout, "//forward declarations\n\n");

        struct Test* pCurrent = list->pHead;
        while (pCurrent)
        {
            if (pCurrent->bFileName)
            {
                if (pCurrent->pNext != NULL && pCurrent->pNext->bFileName == 0)
                    fprintf(fout, "//%s\n", pCurrent->name);
            }
            else
                fprintf(fout, "void %s(void);\n", pCurrent->name);
            pCurrent = pCurrent->pNext;
        }

        fprintf(fout, "\n");
        fprintf(fout, "void DoUnitTests(void)\n{\n");
        pCurrent = list->pHead;
        while (pCurrent)
        {
            if (pCurrent->bFileName)
            {
                if (pCurrent->pNext != NULL && pCurrent->pNext->bFileName == 0)
                {
                    fprintf(fout, "\n");
                    fprintf(fout, "    //%s\n", pCurrent->name);
                }
            }
            else
                fprintf(fout, "    %s();\n", pCurrent->name);
            pCurrent = pCurrent->pNext;
        }
        fprintf(fout, "}\n");

        fprintf(fout, "#else\n");
        fprintf(fout, "; //removes warning C4206: nonstandard extension used: translation unit is empty\n");
        fprintf(fout, "#endif\n");
        fclose(fout);

        printf("file '%s' was updated\n", output);
    }
    else
    {
        printf("cannot open the ouput '%s' file\n", output);
    }
}


int main(int argc, char** argv) {

    if (argc < 3)
    {
        printf("usage: output.c file1.c file2.c ...\n");
        return EXIT_FAILURE;
    }

    char* output = argv[1];


    struct TestList list = { 0 };

    for (int i = 1; i < (int)argc; i++)
    {
        if (strcmp(argv[i], output) != 0) /*ignore the ouputfile*/
        {
            CollectTestsFile(argv[i], &list);
        }
    }

    Generate(output, &list);
    Destroy(&list);
}


```

