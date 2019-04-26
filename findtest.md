
```c

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

    assert(IsRunning());
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
    return Stopwatch_GetElapsedTicks(stopwatch) / GetFrequency();
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
    GenerateCore2(keywords, 0, size - 1, 0, &count);
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
#define NITER 90000000
    struct Stopwatch s = { 0 };


    Stopwatch_Start(&s);
    Stopwatch_Stop(&s);


    Stopwatch_Start(&s);
    int r2;
    for (int i = 0; i < NITER; i++)
    {
        r2 = find2("goto");
    }
    Stopwatch_Stop(&s);
    printf("strcmp %d %d\n", r2, Stopwatch_GetElapsedTicks(&s));
    //////////////////
    Stopwatch_Start(&s);
    int r1;
    for (int i = 0; i < NITER; i++)
    {
        r1 = find("goto");
    }
    Stopwatch_Stop(&s);
    printf("switches %d %d\n", r1, Stopwatch_GetElapsedTicks(&s));
    ////////////
    Stopwatch_Start(&s);
    int r3;
    for (int i = 0; i < NITER; i++)
    {
        r3 = binary_search_str(keywords, sizeof(keywords) / sizeof(keywords[0]), "goto");
    }
    Stopwatch_Stop(&s);
    printf("Binary Search %d %d\n", r3, Stopwatch_GetElapsedTicks(&s));

    Stopwatch_Start(&s);
    int r4;
    for (int i = 0; i < NITER; i++)
    {
        r4 = linear_search_str(keywords, sizeof(keywords) / sizeof(keywords[0]), "goto");
    }
    Stopwatch_Stop(&s);
    printf("Linear %d %d\n", r4, Stopwatch_GetElapsedTicks(&s));

}

```
Output:
```
strcmp 15 0
switches 15 151
Binary Search 15 1305
Linear 15 4268
```


