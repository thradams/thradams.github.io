

C code for generating string-switch

Se [Online](switchgenerator.html)


```cpp

#include <stdio.h>
#include <string.h>
#include <time.h>
#include <assert.h>
#include <stdbool.h>


struct Stopwatch
{
    clock_t m_StartCount;
    clock_t m_StopCount;
};

bool Stopwatch_IsRunning(struct Stopwatch* stopwatch)
{
    return stopwatch->m_StartCount != 0 && stopwatch->m_StopCount == 0;
}

size_t GetFrequency() //in milliseconds
{
    return CLOCKS_PER_SEC / 1000;
}

void Stopwatch_Reset(struct Stopwatch* stopwatch)
{
    stopwatch->m_StopCount = 0;
    stopwatch->m_StartCount = 0;


}

void Stopwatch_Start(struct Stopwatch* stopwatch)
{
    bool resume = (stopwatch->m_StartCount != 0);
    if (resume)
        stopwatch->m_StopCount = 0;
    else
    {
        stopwatch->m_StartCount = clock();
    }

    //assert(Stopwatch_IsRunning());
}

void Stopwatch_Stop(struct Stopwatch* stopwatch)
{
    stopwatch->m_StopCount = clock();
}

clock_t Stopwatch_GetElapsedTicks(struct Stopwatch* stopwatch)
{
    if (Stopwatch_IsRunning(stopwatch))
        return (clock() - stopwatch->m_StartCount);

    return (stopwatch->m_StopCount - stopwatch->m_StartCount);
}

clock_t Stopwatch_GetElapsedMilliseconds(struct Stopwatch* stopwatch)
{
    return Stopwatch_GetElapsedTicks(stopwatch) / (CLOCKS_PER_SEC / 1000);
}



void GenerateCore(const char* keywords[], int first, int last, int level, int* count)
{
    int ident = (level + 1) * 2;
    printf("%*cswitch (text[%d])\n", ident, ' ', level);
    printf("%*c{\n", ident, ' ');

    for (int i = first; i <= last; i++)
    {
        int begin = i;
        int end = begin;
        for (int k = i + 1; k <= last; k++)
        {
            if (keywords[k][level] == keywords[begin][level])
            {
                i++;
                end++;
            }
            else
                break;
        }

        //we have the range
        if (begin == end)
        {
            //just one
            printf("%*ccase '%c': /*%s*/ if (",
                ident * 2, ' ', keywords[i][level], keywords[i]);

            int len = strlen(keywords[i]);

            int j = level + 1;
            for (; j < len; j++)
            {
                if (j != level + 1)
                    printf("&&");

                printf("text[%d]=='%c'", j, keywords[i][j]);
            }
            if (j != level + 1)
                printf("&&");
            printf("text[%d]=='\\0'", j);

            printf(") result = %d; break;\n", *count);

            (*count)++;
        }
        else
        {
            printf("%*ccase '%c':\n", ident * 2, ' ', keywords[i][level]);
            GenerateCore(keywords, begin, end, level + 1, count);
            printf("%*cbreak;\n", ident * 2, ' ');
        }

    }
    printf("%*cdefault : break;\n", ident * 2, ' ');

    printf("%*c}\n", ident, ' ');
}


void GenerateCore1(const char* keywords[], int first, int last, int level, int* count)
{
    int ident = (level + 1) * 2;
    printf("%*cswitch (text[%d])\n", ident, ' ', level);
    printf("%*c{\n", ident, ' ');

    for (int i = first; i <= last; i++)
    {
        int begin = i;
        int end = begin;
        for (int k = i + 1; k <= last; k++)
        {
            if (keywords[k][level] == keywords[begin][level])
            {
                i++;
                end++;
            }
            else
                break;
        }

        //we have the range
        if (begin == end)
        {
            //just one
            printf("%*ccase '%c': /*%s*/ if (strcmp(text, \"%s\") == 0) result = %d; break;\n", 
                ident * 2, ' ', keywords[i][level], keywords[i],
                keywords[i],
                *count);

            (*count)++;
        }
        else
        {
            printf("%*ccase '%c':\n", ident * 2, ' ', keywords[i][level]);
            GenerateCore1(keywords, begin, end, level + 1, count);
            printf("%*cbreak;\n", ident * 2, ' ');
        }

    }
    printf("%*cdefault : break;\n", ident * 2, ' ');

    printf("%*c}\n", ident, ' ');
}


void GenerateCore10(const char* keywords[], int first, int last, int level, int* count)
{
    int ident = (level + 1) * 2;
    printf("%*cswitch (text[%d])\n", ident, ' ', level);
    printf("%*c{\n", ident, ' ');

    for (int i = first; i <= last; i++)
    {
        int begin = i;
        int end = begin;
        for (int k = i + 1; k <= last; k++)
        {
            if (keywords[k][level] == keywords[begin][level])
            {
                i++;
                end++;
            }
            else
                break;
        }

        //we have the range
        if (begin == end)
        {
            //just one
            printf("%*ccase '%c': /*%s*/ if (strcmp(&text[%d], \"%s\") == 0) result = %d; break;\n",
                ident * 2, ' ', keywords[i][level], keywords[i],
                level + 1, &keywords[i][level + 1],
                *count);

            (*count)++;
        }
        else
        {
            printf("%*ccase '%c':\n", ident * 2, ' ', keywords[i][level]);
            GenerateCore10(keywords, begin, end, level + 1, count);
            printf("%*cbreak;\n", ident * 2, ' ');
        }

    }
    printf("%*cdefault : break;\n", ident * 2, ' ');

    printf("%*c}\n", ident, ' ');
}



void GenerateCore2(const char* keywords[], int first, int last, int level, int* count)
{
    int ident = (level + 1) * 2;
    printf("%*cswitch (text[%d])\n", ident, ' ', level);
    printf("%*c{\n", ident, ' ');

    for (int i = first; i <= last; i++)
    {
        int begin = i;
        int end = begin;
        for (int k = i + 1; k <= last; k++)
        {
            if (keywords[k][level] == keywords[begin][level])
            {
                i++;
                end++;
            }
            else
                break;
        }

        printf("%*ccase '%c':\n", ident * 2, ' ', keywords[i][level]);
        for (int j = begin; j <= end; j++)
        {
            printf("%*c", ident * 3, ' ');
            if (j != begin)
                printf("else ");

            printf("if (strcmp(\"%s\", text) == 0) result = %d;\n", keywords[j], *count);

            (*count)++;
        }

        printf("%*cbreak;\n", ident * 2, ' ');


    }
    printf("%*cdefault : break;\n", ident * 2, ' ');

    printf("%*c}\n", ident, ' ');
}


void Generate(const char* keywords[], int size)
{
    printf("int find(const char* text)\n");
    printf("{\n");
    int count = 0;
    printf("%*cint result = -1;\n", 2, ' ');
    GenerateCore(keywords, 0, size - 1, 0, &count);
    printf("%*creturn result;\n", 2, ' ');
    printf("}\n");
}

void Generate2(const char* keywords[], int size)
{
    printf("int find2(const char* text)\n");
    printf("{\n");
    int count = 0;
    printf("%*cint result = -1;\n", 2, ' ');
    GenerateCore2(keywords, 0, size - 1, 0, &count);
    printf("%*creturn result;\n", 2, ' ');
    printf("}\n");
}

void Generate1(const char* keywords[], int size)
{
    printf("int find1(const char* text)\n");
    printf("{\n");
    int count = 0;
    printf("%*cint result = -1;\n", 2, ' ');
    GenerateCore1(keywords, 0, size - 1, 0, &count);
    printf("%*creturn result;\n", 2, ' ');
    printf("}\n");
}


int find(const char* text)
{
    int result = -1;
    switch (text[0])
    {
    case 'a':
        switch (text[1])
        {
        case 'l': /*alignof*/ if (text[2] == 'i' && text[3] == 'g' && text[4] == 'n' && text[5] == 'o' && text[6] == 'f' && text[7] == '\0') result = 0; break;
        case 'u': /*auto*/ if (text[2] == 't' && text[3] == 'o' && text[4] == '\0') result = 1; break;
        default: break;
        }
        break;
    case 'b': /*break*/ if (text[1] == 'r' && text[2] == 'e' && text[3] == 'a' && text[4] == 'k' && text[5] == '\0') result = 2; break;
    case 'c':
        switch (text[1])
        {
        case 'a': /*case*/ if (text[2] == 's' && text[3] == 'e' && text[4] == '\0') result = 3; break;
        case 'h': /*char*/ if (text[2] == 'a' && text[3] == 'r' && text[4] == '\0') result = 4; break;
        case 'o':
            switch (text[2])
            {
            case 'n':
                switch (text[3])
                {
                case 's': /*const*/ if (text[4] == 't' && text[5] == '\0') result = 5; break;
                case 't': /*continue*/ if (text[4] == 'i' && text[5] == 'n' && text[6] == 'u' && text[7] == 'e' && text[8] == '\0') result = 6; break;
                default: break;
                }
                break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 'd':
        switch (text[1])
        {
        case 'e': /*default*/ if (text[2] == 'f' && text[3] == 'a' && text[4] == 'u' && text[5] == 'l' && text[6] == 't' && text[7] == '\0') result = 7; break;
        case 'o':
            switch (text[2])
            {
            case ' ': /*do*/ if (text[3] == '\0') result = 8; break;
            case 'u': /*double*/ if (text[3] == 'b' && text[4] == 'l' && text[5] == 'e' && text[6] == '\0') result = 9; break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 'e':
        switch (text[1])
        {
        case 'l': /*else*/ if (text[2] == 's' && text[3] == 'e' && text[4] == '\0') result = 10; break;
        case 'n': /*enum*/ if (text[2] == 'u' && text[3] == 'm' && text[4] == '\0') result = 11; break;
        case 'x': /*extern*/ if (text[2] == 't' && text[3] == 'e' && text[4] == 'r' && text[5] == 'n' && text[6] == '\0') result = 12; break;
        default: break;
        }
        break;
    case 'f':
        switch (text[1])
        {
        case 'l': /*float*/ if (text[2] == 'o' && text[3] == 'a' && text[4] == 't' && text[5] == '\0') result = 13; break;
        case 'o': /*for*/ if (text[2] == 'r' && text[3] == '\0') result = 14; break;
        default: break;
        }
        break;
    case 'g': /*goto*/ if (text[1] == 'o' && text[2] == 't' && text[3] == 'o' && text[4] == '\0') result = 15; break;
    case 'i':
        switch (text[1])
        {
        case 'f': /*if*/ if (text[2] == '\0') result = 16; break;
        case 'n':
            switch (text[2])
            {
            case 'l': /*inline*/ if (text[3] == 'i' && text[4] == 'n' && text[5] == 'e' && text[6] == '\0') result = 17; break;
            case 't': /*int*/ if (text[3] == '\0') result = 18; break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 'l': /*long*/ if (text[1] == 'o' && text[2] == 'n' && text[3] == 'g' && text[4] == '\0') result = 19; break;
    case 'r':
        switch (text[1])
        {
        case 'e':
            switch (text[2])
            {
            case 'g': /*register*/ if (text[3] == 'i' && text[4] == 's' && text[5] == 't' && text[6] == 'e' && text[7] == 'r' && text[8] == '\0') result = 20; break;
            case 's': /*restrict*/ if (text[3] == 't' && text[4] == 'r' && text[5] == 'i' && text[6] == 'c' && text[7] == 't' && text[8] == '\0') result = 21; break;
            case 't': /*return*/ if (text[3] == 'u' && text[4] == 'r' && text[5] == 'n' && text[6] == '\0') result = 22; break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 's':
        switch (text[1])
        {
        case 'h': /*short*/ if (text[2] == 'o' && text[3] == 'r' && text[4] == 't' && text[5] == '\0') result = 23; break;
        case 'i':
            switch (text[2])
            {
            case 'g': /*signed*/ if (text[3] == 'n' && text[4] == 'e' && text[5] == 'd' && text[6] == '\0') result = 24; break;
            case 'z': /*sizeof*/ if (text[3] == 'e' && text[4] == 'o' && text[5] == 'f' && text[6] == '\0') result = 25; break;
            default: break;
            }
            break;
        case 't':
            switch (text[2])
            {
            case 'a': /*static*/ if (text[3] == 't' && text[4] == 'i' && text[5] == 'c' && text[6] == '\0') result = 26; break;
            case 'r': /*struct*/ if (text[3] == 'u' && text[4] == 'c' && text[5] == 't' && text[6] == '\0') result = 27; break;
            default: break;
            }
            break;
        case 'w': /*switch*/ if (text[2] == 'i' && text[3] == 't' && text[4] == 'c' && text[5] == 'h' && text[6] == '\0') result = 28; break;
        default: break;
        }
        break;
    case 't': /*typedef*/ if (text[1] == 'y' && text[2] == 'p' && text[3] == 'e' && text[4] == 'd' && text[5] == 'e' && text[6] == 'f' && text[7] == '\0') result = 29; break;
    case 'u':
        switch (text[1])
        {
        case 'n':
            switch (text[2])
            {
            case 'i': /*union*/ if (text[3] == 'o' && text[4] == 'n' && text[5] == '\0') result = 30; break;
            case 's': /*unsigned*/ if (text[3] == 'i' && text[4] == 'g' && text[5] == 'n' && text[6] == 'e' && text[7] == 'd' && text[8] == '\0') result = 31; break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 'v':
        switch (text[1])
        {
        case 'o':
            switch (text[2])
            {
            case 'i': /*void*/ if (text[3] == 'd' && text[4] == '\0') result = 32; break;
            case 'l': /*volatile*/ if (text[3] == 'a' && text[4] == 't' && text[5] == 'i' && text[6] == 'l' && text[7] == 'e' && text[8] == '\0') result = 33; break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 'w': /*while*/ if (text[1] == 'h' && text[2] == 'i' && text[3] == 'l' && text[4] == 'e' && text[5] == '\0') result = 34; break;
    case '_':
        switch (text[1])
        {
        case 'A':
            switch (text[2])
            {
            case 'l': /*_Alignas*/ if (text[3] == 'i' && text[4] == 'g' && text[5] == 'n' && text[6] == 'a' && text[7] == 's' && text[8] == '\0') result = 35; break;
            case 't': /*_Atomic*/ if (text[3] == 'o' && text[4] == 'm' && text[5] == 'i' && text[6] == 'c' && text[7] == '\0') result = 36; break;
            default: break;
            }
            break;
        case 'B': /*_Bool*/ if (text[2] == 'o' && text[3] == 'o' && text[4] == 'l' && text[5] == '\0') result = 37; break;
        case 'C': /*_Complex*/ if (text[2] == 'o' && text[3] == 'm' && text[4] == 'p' && text[5] == 'l' && text[6] == 'e' && text[7] == 'x' && text[8] == '\0') result = 38; break;
        case 'G': /*_Generic*/ if (text[2] == 'e' && text[3] == 'n' && text[4] == 'e' && text[5] == 'r' && text[6] == 'i' && text[7] == 'c' && text[8] == '\0') result = 39; break;
        case 'I': /*_Imaginary*/ if (text[2] == 'm' && text[3] == 'a' && text[4] == 'g' && text[5] == 'i' && text[6] == 'n' && text[7] == 'a' && text[8] == 'r' && text[9] == 'y' && text[10] == '\0') result = 40; break;
        case 'N': /*_Noreturn*/ if (text[2] == 'o' && text[3] == 'r' && text[4] == 'e' && text[5] == 't' && text[6] == 'u' && text[7] == 'r' && text[8] == 'n' && text[9] == '\0') result = 41; break;
        case 'S': /*_Static_assert*/ if (text[2] == 't' && text[3] == 'a' && text[4] == 't' && text[5] == 'i' && text[6] == 'c' && text[7] == '_' && text[8] == 'a' && text[9] == 's' && text[10] == 's' && text[11] == 'e' && text[12] == 'r' && text[13] == 't' && text[14] == '\0') result = 42; break;
        case 'T': /*_Thread_local*/ if (text[2] == 'h' && text[3] == 'r' && text[4] == 'e' && text[5] == 'a' && text[6] == 'd' && text[7] == '_' && text[8] == 'l' && text[9] == 'o' && text[10] == 'c' && text[11] == 'a' && text[12] == 'l' && text[13] == '\0') result = 43; break;
        default: break;
        }
        break;
    default: break;
    }
    return result;
}


int find2(const char* text)
{

    int result = -1;
    switch (text[0])
    {
    case 'a':
        if (strcmp("alignof", text) == 0) result = 0;
        else if (strcmp("auto", text) == 0) result = 1;
        break;
    case 'b':
        if (strcmp("break", text) == 0) result = 2;
        break;
    case 'c':
        if (strcmp("case", text) == 0) result = 3;
        else if (strcmp("char", text) == 0) result = 4;
        else if (strcmp("const", text) == 0) result = 5;
        else if (strcmp("continue", text) == 0) result = 6;
        break;
    case 'd':
        if (strcmp("default", text) == 0) result = 7;
        else if (strcmp("do", text) == 0) result = 8;
        else if (strcmp("double", text) == 0) result = 9;
        break;
    case 'e':
        if (strcmp("else", text) == 0) result = 10;
        else if (strcmp("enum", text) == 0) result = 11;
        else if (strcmp("extern", text) == 0) result = 12;
        break;
    case 'f':
        if (strcmp("float", text) == 0) result = 13;
        else if (strcmp("for", text) == 0) result = 14;
        break;
    case 'g':
        if (strcmp("goto", text) == 0) result = 15;
        break;
    case 'i':
        if (strcmp("if", text) == 0) result = 16;
        else if (strcmp("inline", text) == 0) result = 17;
        else if (strcmp("int", text) == 0) result = 18;
        break;
    case 'l':
        if (strcmp("long", text) == 0) result = 19;
        break;
    case 'r':
        if (strcmp("register", text) == 0) result = 20;
        else if (strcmp("restrict", text) == 0) result = 21;
        else if (strcmp("return", text) == 0) result = 22;
        break;
    case 's':
        if (strcmp("short", text) == 0) result = 23;
        else if (strcmp("signed", text) == 0) result = 24;
        else if (strcmp("sizeof", text) == 0) result = 25;
        else if (strcmp("static", text) == 0) result = 26;
        else if (strcmp("struct", text) == 0) result = 27;
        else if (strcmp("switch", text) == 0) result = 28;
        break;
    case 't':
        if (strcmp("typedef", text) == 0) result = 29;
        break;
    case 'u':
        if (strcmp("union", text) == 0) result = 30;
        else if (strcmp("unsigned", text) == 0) result = 31;
        break;
    case 'v':
        if (strcmp("void", text) == 0) result = 32;
        else if (strcmp("volatile", text) == 0) result = 33;
        break;
    case 'w':
        if (strcmp("while", text) == 0) result = 34;
        break;
    case '_':
        if (strcmp("_Alignas", text) == 0) result = 35;
        else if (strcmp("_Atomic", text) == 0) result = 36;
        else if (strcmp("_Bool", text) == 0) result = 37;
        else if (strcmp("_Complex", text) == 0) result = 38;
        else if (strcmp("_Generic", text) == 0) result = 39;
        else if (strcmp("_Imaginary", text) == 0) result = 40;
        else if (strcmp("_Noreturn", text) == 0) result = 41;
        else if (strcmp("_Static_assert", text) == 0) result = 42;
        else if (strcmp("_Thread_local", text) == 0) result = 43;
        break;
    default: break;
    }
    return result;
}

//#define GENERATE 1

int linear_search_str(const char* sorted_array[],
    int n_elements,
    const char* searchItem)
{
    int result = -1;
    for (int i = 0; i < n_elements; i++)
    {
        if (strcmp(sorted_array[i], searchItem) == 0)
        {
            result = i;
            break;
        }
    }
    return result;
}

int binary_search_str(const char* sorted_array[],
    int n_elements,
    const char* searchItem)
{
    int mid;
    int c = 0;
    int l = 0;
    int u = n_elements - 1;

    while (l <= u)
    {
        mid = (l + u) / 2;

        int cmp = strcmp(searchItem, sorted_array[mid]);

        if (cmp == 0)
        {
            c = 1;
            break;
        }
        else if (cmp < 0)
        {
            u = mid - 1;
        }
        else
        {
            l = mid + 1;
        }
    }

    return c == 0 ? -1 : mid;
}


void Generate3(const char* keywords[], int size)
{
    printf("int find3(const char* text)\n");
    printf("{\n");

    printf("int result = -1;\n"
        "unsigned u = 0; \n"
        "for (int j = 0; j < 4 && text[j]; j++)\n"
        "{\n"
        "  u |= ((unsigned)text[j]) << (j * 8); \n"
        "}\n");


    printf("  switch (u)\n");
    printf("  {\n");


    for (int i = 0; i < size; i++)
    {
        unsigned u = 0;
        for (int j = 0; j < 4 && keywords[i][j]; j++)
        {
            u |= ((unsigned)keywords[i][j]) << (j * 8);
        }

        printf("case 0x%04x: /*%s*/result = %d; break;\n", u % size, keywords[i], i);
    }
    printf("  }\n");
    printf("  return result;\n");
    printf("}\n");
}



int find3(const char* text)
{
    int result = -1;
    unsigned u = 0;
    
    if (text[0])
     u |= ((unsigned)text[0]) << (0);
    
    if (text[1])
        u |= ((unsigned)text[1]) << 8;

    if (text[2])
        u |= ((unsigned)text[2]) << 16;

    if (text[3])
        u |= ((unsigned)text[3]) << 24;


    switch (u)
    {
    case 0x67696c61: /*alignof*/result = 0; break;
    case 0x6f747561: /*auto*/result = 1; break;
    case 0x61657262: /*break*/result = 2; break;
    case 0x65736163: /*case*/result = 3; break;
    case 0x72616863: /*char*/result = 4; break;
    case 0x736e6f63: /*const*/result = 5; break;
    case 0x746e6f63: /*continue*/result = 6; break;
    case 0x61666564: /*default*/result = 7; break;
    case 0x6f64: /*do*/result = 8; break;
    case 0x62756f64: /*double*/result = 9; break;
    case 0x65736c65: /*else*/result = 10; break;
    case 0x6d756e65: /*enum*/result = 11; break;
    case 0x65747865: /*extern*/result = 12; break;
    case 0x616f6c66: /*float*/result = 13; break;
    case 0x726f66: /*for*/result = 14; break;
    case 0x6f746f67: /*goto*/result = 15; break;
    case 0x6669: /*if*/result = 16; break;
    case 0x696c6e69: /*inline*/result = 17; break;
    case 0x746e69: /*int*/result = 18; break;
    case 0x676e6f6c: /*long*/result = 19; break;
    case 0x69676572: /*register*/result = 20; break;
    case 0x74736572: /*restrict*/result = 21; break;
    case 0x75746572: /*return*/result = 22; break;
    case 0x726f6873: /*short*/result = 23; break;
    case 0x6e676973: /*signed*/result = 24; break;
    case 0x657a6973: /*sizeof*/result = 25; break;
    case 0x74617473: /*static*/result = 26; break;
    case 0x75727473: /*struct*/result = 27; break;
    case 0x74697773: /*switch*/result = 28; break;
    case 0x65707974: /*typedef*/result = 29; break;
    case 0x6f696e75: /*union*/result = 30; break;
    case 0x69736e75: /*unsigned*/result = 31; break;
    case 0x64696f76: /*void*/result = 32; break;
    case 0x616c6f76: /*volatile*/result = 33; break;
    case 0x6c696877: /*while*/result = 34; break;
    case 0x696c415f: /*_Alignas*/result = 35; break;
    case 0x6f74415f: /*_Atomic*/result = 36; break;
    case 0x6f6f425f: /*_Bool*/result = 37; break;
    case 0x6d6f435f: /*_Complex*/result = 38; break;
    case 0x6e65475f: /*_Generic*/result = 39; break;
    case 0x616d495f: /*_Imaginary*/result = 40; break;
    case 0x726f4e5f: /*_Noreturn*/result = 41; break;
    case 0x6174535f: /*_Static_assert*/result = 42; break;
    case 0x7268545f: /*_Thread_local*/result = 43; break;
    }
    return result;
}

int find1(const char* text)
{
    int result = -1;
    switch (text[0])
    {
    case 'a':
        switch (text[1])
        {
        case 'l': /*alignof*/ if (strcmp(text, "alignof") == 0) result = 0; break;
        case 'u': /*auto*/ if (strcmp(text, "auto") == 0) result = 1; break;
        default: break;
        }
        break;
    case 'b': /*break*/ if (strcmp(text, "break") == 0) result = 2; break;
    case 'c':
        switch (text[1])
        {
        case 'a': /*case*/ if (strcmp(text, "case") == 0) result = 3; break;
        case 'h': /*char*/ if (strcmp(text, "char") == 0) result = 4; break;
        case 'o':
            switch (text[2])
            {
            case 'n':
                switch (text[3])
                {
                case 's': /*const*/ if (strcmp(text, "const") == 0) result = 5; break;
                case 't': /*continue*/ if (strcmp(text, "continue") == 0) result = 6; break;
                default: break;
                }
                break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 'd':
        switch (text[1])
        {
        case 'e': /*default*/ if (strcmp(text, "default") == 0) result = 7; break;
        case 'o':
            switch (text[2])
            {
            case ' ': /*do*/ if (strcmp(text, "do") == 0) result = 8; break;
            case 'u': /*double*/ if (strcmp(text, "double") == 0) result = 9; break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 'e':
        switch (text[1])
        {
        case 'l': /*else*/ if (strcmp(text, "else") == 0) result = 10; break;
        case 'n': /*enum*/ if (strcmp(text, "enum") == 0) result = 11; break;
        case 'x': /*extern*/ if (strcmp(text, "extern") == 0) result = 12; break;
        default: break;
        }
        break;
    case 'f':
        switch (text[1])
        {
        case 'l': /*float*/ if (strcmp(text, "float") == 0) result = 13; break;
        case 'o': /*for*/ if (strcmp(text, "for") == 0) result = 14; break;
        default: break;
        }
        break;
    case 'g': /*goto*/ if (strcmp(text, "goto") == 0) result = 15; break;
    case 'i':
        switch (text[1])
        {
        case 'f': /*if*/ if (strcmp(text, "if") == 0) result = 16; break;
        case 'n':
            switch (text[2])
            {
            case 'l': /*inline*/ if (strcmp(text, "inline") == 0) result = 17; break;
            case 't': /*int*/ if (strcmp(text, "int") == 0) result = 18; break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 'l': /*long*/ if (strcmp(text, "long") == 0) result = 19; break;
    case 'r':
        switch (text[1])
        {
        case 'e':
            switch (text[2])
            {
            case 'g': /*register*/ if (strcmp(text, "register") == 0) result = 20; break;
            case 's': /*restrict*/ if (strcmp(text, "restrict") == 0) result = 21; break;
            case 't': /*return*/ if (strcmp(text, "return") == 0) result = 22; break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 's':
        switch (text[1])
        {
        case 'h': /*short*/ if (strcmp(text, "short") == 0) result = 23; break;
        case 'i':
            switch (text[2])
            {
            case 'g': /*signed*/ if (strcmp(text, "signed") == 0) result = 24; break;
            case 'z': /*sizeof*/ if (strcmp(text, "sizeof") == 0) result = 25; break;
            default: break;
            }
            break;
        case 't':
            switch (text[2])
            {
            case 'a': /*static*/ if (strcmp(text, "static") == 0) result = 26; break;
            case 'r': /*struct*/ if (strcmp(text, "struct") == 0) result = 27; break;
            default: break;
            }
            break;
        case 'w': /*switch*/ if (strcmp(text, "switch") == 0) result = 28; break;
        default: break;
        }
        break;
    case 't': /*typedef*/ if (strcmp(text, "typedef") == 0) result = 29; break;
    case 'u':
        switch (text[1])
        {
        case 'n':
            switch (text[2])
            {
            case 'i': /*union*/ if (strcmp(text, "union") == 0) result = 30; break;
            case 's': /*unsigned*/ if (strcmp(text, "unsigned") == 0) result = 31; break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 'v':
        switch (text[1])
        {
        case 'o':
            switch (text[2])
            {
            case 'i': /*void*/ if (strcmp(text, "void") == 0) result = 32; break;
            case 'l': /*volatile*/ if (strcmp(text, "volatile") == 0) result = 33; break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 'w': /*while*/ if (strcmp(text, "while") == 0) result = 34; break;
    case '_':
        switch (text[1])
        {
        case 'A':
            switch (text[2])
            {
            case 'l': /*_Alignas*/ if (strcmp(text, "_Alignas") == 0) result = 35; break;
            case 't': /*_Atomic*/ if (strcmp(text, "_Atomic") == 0) result = 36; break;
            default: break;
            }
            break;
        case 'B': /*_Bool*/ if (strcmp(text, "_Bool") == 0) result = 37; break;
        case 'C': /*_Complex*/ if (strcmp(text, "_Complex") == 0) result = 38; break;
        case 'G': /*_Generic*/ if (strcmp(text, "_Generic") == 0) result = 39; break;
        case 'I': /*_Imaginary*/ if (strcmp(text, "_Imaginary") == 0) result = 40; break;
        case 'N': /*_Noreturn*/ if (strcmp(text, "_Noreturn") == 0) result = 41; break;
        case 'S': /*_Static_assert*/ if (strcmp(text, "_Static_assert") == 0) result = 42; break;
        case 'T': /*_Thread_local*/ if (strcmp(text, "_Thread_local") == 0) result = 43; break;
        default: break;
        }
        break;
    default: break;
    }
    return result;
}

int find10(const char* text)
{
    int result = -1;
    switch (text[0])
    {
    case 'a':
        switch (text[1])
        {
        case 'l': /*alignof*/ if (strcmp(&text[2], "ignof") == 0) result = 0; break;
        case 'u': /*auto*/ if (strcmp(&text[2], "to") == 0) result = 1; break;
        default: break;
        }
        break;
    case 'b': /*break*/ if (strcmp(&text[1], "reak") == 0) result = 2; break;
    case 'c':
        switch (text[1])
        {
        case 'a': /*case*/ if (strcmp(&text[2], "se") == 0) result = 3; break;
        case 'h': /*char*/ if (strcmp(&text[2], "ar") == 0) result = 4; break;
        case 'o':
            switch (text[2])
            {
            case 'n':
                switch (text[3])
                {
                case 's': /*const*/ if (strcmp(&text[4], "t") == 0) result = 5; break;
                case 't': /*continue*/ if (strcmp(&text[4], "inue") == 0) result = 6; break;
                default: break;
                }
                break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 'd':
        switch (text[1])
        {
        case 'e': /*default*/ if (strcmp(&text[2], "fault") == 0) result = 7; break;
        case 'o':
            switch (text[2])
            {
            case ' ': /*do*/ if (strcmp(&text[3], "") == 0) result = 8; break;
            case 'u': /*double*/ if (strcmp(&text[3], "ble") == 0) result = 9; break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 'e':
        switch (text[1])
        {
        case 'l': /*else*/ if (strcmp(&text[2], "se") == 0) result = 10; break;
        case 'n': /*enum*/ if (strcmp(&text[2], "um") == 0) result = 11; break;
        case 'x': /*extern*/ if (strcmp(&text[2], "tern") == 0) result = 12; break;
        default: break;
        }
        break;
    case 'f':
        switch (text[1])
        {
        case 'l': /*float*/ if (strcmp(&text[2], "oat") == 0) result = 13; break;
        case 'o': /*for*/ if (strcmp(&text[2], "r") == 0) result = 14; break;
        default: break;
        }
        break;
    case 'g': /*goto*/ if (strcmp(&text[1], "oto") == 0) result = 15; break;
    case 'i':
        switch (text[1])
        {
        case 'f': /*if*/ if (strcmp(&text[2], "") == 0) result = 16; break;
        case 'n':
            switch (text[2])
            {
            case 'l': /*inline*/ if (strcmp(&text[3], "ine") == 0) result = 17; break;
            case 't': /*int*/ if (strcmp(&text[3], "") == 0) result = 18; break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 'l': /*long*/ if (strcmp(&text[1], "ong") == 0) result = 19; break;
    case 'r':
        switch (text[1])
        {
        case 'e':
            switch (text[2])
            {
            case 'g': /*register*/ if (strcmp(&text[3], "ister") == 0) result = 20; break;
            case 's': /*restrict*/ if (strcmp(&text[3], "trict") == 0) result = 21; break;
            case 't': /*return*/ if (strcmp(&text[3], "urn") == 0) result = 22; break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 's':
        switch (text[1])
        {
        case 'h': /*short*/ if (strcmp(&text[2], "ort") == 0) result = 23; break;
        case 'i':
            switch (text[2])
            {
            case 'g': /*signed*/ if (strcmp(&text[3], "ned") == 0) result = 24; break;
            case 'z': /*sizeof*/ if (strcmp(&text[3], "eof") == 0) result = 25; break;
            default: break;
            }
            break;
        case 't':
            switch (text[2])
            {
            case 'a': /*static*/ if (strcmp(&text[3], "tic") == 0) result = 26; break;
            case 'r': /*struct*/ if (strcmp(&text[3], "uct") == 0) result = 27; break;
            default: break;
            }
            break;
        case 'w': /*switch*/ if (strcmp(&text[2], "itch") == 0) result = 28; break;
        default: break;
        }
        break;
    case 't': /*typedef*/ if (strcmp(&text[1], "ypedef") == 0) result = 29; break;
    case 'u':
        switch (text[1])
        {
        case 'n':
            switch (text[2])
            {
            case 'i': /*union*/ if (strcmp(&text[3], "on") == 0) result = 30; break;
            case 's': /*unsigned*/ if (strcmp(&text[3], "igned") == 0) result = 31; break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 'v':
        switch (text[1])
        {
        case 'o':
            switch (text[2])
            {
            case 'i': /*void*/ if (strcmp(&text[3], "d") == 0) result = 32; break;
            case 'l': /*volatile*/ if (strcmp(&text[3], "atile") == 0) result = 33; break;
            default: break;
            }
            break;
        default: break;
        }
        break;
    case 'w': /*while*/ if (strcmp(&text[1], "hile") == 0) result = 34; break;
    case '_':
        switch (text[1])
        {
        case 'A':
            switch (text[2])
            {
            case 'l': /*_Alignas*/ if (strcmp(&text[3], "ignas") == 0) result = 35; break;
            case 't': /*_Atomic*/ if (strcmp(&text[3], "omic") == 0) result = 36; break;
            default: break;
            }
            break;
        case 'B': /*_Bool*/ if (strcmp(&text[2], "ool") == 0) result = 37; break;
        case 'C': /*_Complex*/ if (strcmp(&text[2], "omplex") == 0) result = 38; break;
        case 'G': /*_Generic*/ if (strcmp(&text[2], "eneric") == 0) result = 39; break;
        case 'I': /*_Imaginary*/ if (strcmp(&text[2], "maginary") == 0) result = 40; break;
        case 'N': /*_Noreturn*/ if (strcmp(&text[2], "oreturn") == 0) result = 41; break;
        case 'S': /*_Static_assert*/ if (strcmp(&text[2], "tatic_assert") == 0) result = 42; break;
        case 'T': /*_Thread_local*/ if (strcmp(&text[2], "hread_local") == 0) result = 43; break;
        default: break;
        }
        break;
    default: break;
    }
    return result;
}

//#include <string.h>
//#include <stdio.h>

unsigned hash(unsigned d, const char* str, int str_length) {
    if (d == 0) { d = 0x811c9dc5; }
    for (unsigned i = 0; i < str_length; i++) {
        // http://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
        // http://isthe.com/chongo/src/fnv/hash_32.c
        // multiply by the 32 bit FNV magic prime mod 2^32
        d += (d << 1) + (d << 4) + (d << 7) + (d << 8) + (d << 24);
        // xor the bottom with the current octet
        d ^= str[i];
    }
    return d & 0x7fffffff;
}

unsigned lookup(int G[], int G_length, int V[], int V_length, const char* key)
{
    unsigned d = G[hash(0, key, strlen(key)) % G_length];
    if (d < 0) return V[0 - d - 1];
    return V[hash(d, key, strlen(key)) % V_length];
};

#define undefined 0xFFFFFFFF

int findhash(const char* keyword)
{
    int G[] =
    {
     undefined, undefined, -44, -42, 9, -39, -38, -34,
     undefined, 1, -27, undefined, -25, 1, -23, undefined,
     undefined, -13, undefined, 2, undefined, undefined,
     1, 1, 3, undefined, 1, -9, -6, -3, 11, 1, -10, 3, -16,
     -20, -26, undefined, -30, undefined, 1, undefined,
     undefined, 1
    };

    int G_length = sizeof(G) / sizeof(G[0]);

    int V[] = {
    19, 5, 24, 42, 27, 32, 16, 1, 33, 39, 11,
    37, 26, 25, 15, 10, 38, 29, 12, 36, 44,
    22, 6, 20, 35, 17, 3, 41, 31, 21, 30, 4,
    8, 13, 2, 43, 40, 9, 14, 34, 7, 23, 28, 18
    };
    int V_length = sizeof(V) / sizeof(V[0]);

    unsigned r = lookup(G, G_length, V, V_length, keyword);

    //printf("%d", r);
    return r;
}
int Day(const char* key)
{
    int result = -1;
    switch (key[0])
    {
    case /*Friday*/ 'F':
        if (key[1] == 'r' && key[2] == 'i' && key[3] == 'd' && key[4] == 'a' && key[5] == 'y' && key[6] == '\0') {
            result = 0;
        }
        break;
    case /*Monday*/ 'M':
        if (key[1] == 'o' && key[2] == 'n' && key[3] == 'd' && key[4] == 'a' && key[5] == 'y' && key[6] == '\0') {
            result = 1;
        }
        break;
    case 'S':
        switch (key[1])
        {
        case /*Saturday*/ 'a':
            if (key[2] == 't' && key[3] == 'u' && key[4] == 'r' && key[5] == 'd' && key[6] == 'a' && key[7] == 'y' && key[8] == '\0') {
                result = 2;
            }
            break;
        case /*Sunday*/ 'u':
            if (key[2] == 'n' && key[3] == 'd' && key[4] == 'a' && key[5] == 'y' && key[6] == '\0') {
                result = 3;
            }
            break;
        default: break;
        }
        break;
    case 'T':
        switch (key[1])
        {
        case /*Thursday*/ 'h':
            if (key[2] == 'u' && key[3] == 'r' && key[4] == 's' && key[5] == 'd' && key[6] == 'a' && key[7] == 'y' && key[8] == '\0') {
                result = 4;
            }
            break;
        case /*Tuesday*/ 'u':
            if (key[2] == 'e' && key[3] == 's' && key[4] == 'd' && key[5] == 'a' && key[6] == 'y' && key[7] == '\0') {
                result = 5;
            }
            break;
        default: break;
        }
        break;
    case /*Wednesday*/ 'W':
        if (key[1] == 'e' && key[2] == 'd' && key[3] == 'n' && key[4] == 'e' && key[5] == 's' && key[6] == 'd' && key[7] == 'a' && key[8] == 'y' && key[9] == '\0') {
            result = 6;
        }
        break;
    default: break;
    }
    return result;
}


//#define NITER 2147483647
#define NITER (2147483646)
int main()
{
    
    

    const char* keywords[] = {
    "alignof", "auto", "break", "case",	"char", "const",
        "continue",	"default",		"do", "double",	"else",
        "enum",	"extern", "float", "for",
        "goto", "if", "inline", "int", "long",
        "register", "restrict", "return", "short",
        "signed", "sizeof", "static", "struct",
        "switch", "typedef", "union", "unsigned",
        "void", "volatile", "while", "_Alignas",
        "_Atomic", "_Bool", "_Complex", "_Generic",
        "_Imaginary", "_Noreturn", "_Static_assert", "_Thread_local" };

    //Generate(keywords, sizeof(keywords) / sizeof(keywords[0]));
    //Generate1(keywords, sizeof(keywords) / sizeof(keywords[0]));
    //Generate2(keywords, sizeof(keywords) / sizeof(keywords[0]));
    //Generate3(keywords, sizeof(keywords) / sizeof(keywords[0]));
    //Generate4(keywords, sizeof(keywords) / sizeof(keywords[0]));
    

    char search[122];// = "goto";
    printf("Enter a C keyword:\n");
    scanf("%[^\n]", search);


    //find3(search);
    struct Stopwatch s = { 0 };


    Stopwatch_Start(&s);
    int r2 = 0;

    for (int i = 0; i < NITER; i++)
    {
        r2 = find2(search);
    }

    Stopwatch_Stop(&s);
    printf("strcmp %d %d\n", r2, Stopwatch_GetElapsedTicks(&s));

    Stopwatch_Reset(&s);

    
    //////////////////

    Stopwatch_Start(&s);
    int r22 = 0;

    for (int i = 0; i < NITER; i++)
    {
        r22 = find1(search);
    }

    Stopwatch_Stop(&s);
    printf("switch + strcmp %d %d\n", r22, Stopwatch_GetElapsedTicks(&s));
    Stopwatch_Reset(&s);

    
    //////////////////

    Stopwatch_Start(&s);
    int r1 = 0;
    for (int i = 0; i < NITER; i++)
    {
        r1 = find(search);
    }
    Stopwatch_Stop(&s);
    
    printf("switches %d %d\n", r1, Stopwatch_GetElapsedTicks(&s));

    Stopwatch_Reset(&s);
    ////////////
    Stopwatch_Start(&s);
    int r3 = 0;
    for (int i = 0; i < NITER; i++)
    {
        r3 = binary_search_str(keywords, sizeof(keywords) / sizeof(keywords[0]), search);
    }
    Stopwatch_Stop(&s);
    printf("Binary Search %d %d\n", r3, Stopwatch_GetElapsedTicks(&s));

    Stopwatch_Reset(&s);
    Stopwatch_Start(&s);
    int r5 = 0;
    for (int i = 0; i < NITER; i++)
    {
        r5 = find3(search);
    }
    Stopwatch_Stop(&s);
    printf("Hash %d %d\n", r5, Stopwatch_GetElapsedTicks(&s));

    
    ///////////
    Stopwatch_Reset(&s);
    Stopwatch_Start(&s);
    int r6 = 0;
    for (int i = 0; i < NITER; i++)
    {
        r6 = findhash(search);
    }
    Stopwatch_Stop(&s);
    
    printf("Haash %d %d\n", r6, Stopwatch_GetElapsedTicks(&s));
    Stopwatch_Reset(&s);
    ////////////

    Stopwatch_Start(&s);
    int r4 = 0;
    for (int i = 0; i < NITER; i++)
    {
        r4 = linear_search_str(keywords, sizeof(keywords) / sizeof(keywords[0]), search);
    }
    Stopwatch_Stop(&s);
    
    printf("Linear %d %d\n", r4, Stopwatch_GetElapsedTicks(&s));
    Stopwatch_Reset(&s);

}



```


