

## Make Tests

This program scans the  source files that are inside a Visual Studio project searching for tests 
functions inside #ifdef TEST.

Then an output file is generated with forward declarations and calling each
test.

Usage: Inside Visual Studio External Tools

```
Command: your exe path
Arguments: $(ProjectFileName) unit_test.c
Initial Directory: $(ProjectDir)
[x] Use output window
```


Source:

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


struct stream {

    /*cursor*/
    const char* p;

    /*
     name of the current node
    */
    const char* node;

    struct TestList* list;

    const char* out;
};

#define current(stream) (stream)->p[0]
#define next(stream) (stream)->p[1]
#define match(stream) stream->p++
#define is_space(stream) (current(stream) == ' ' || current(stream) == '\r' || current(stream) == '\n')
#define skip_spaces(p)  while (is_space(p)) { match(p); }


const char* parse_id(struct stream* p)
{
    const char* start = p->p;
    while (current(p) >= 'a' && current(p) <= 'z' ||
           current(p) >= 'A' && current(p) <= 'Z' ||
           current(p) >= '0' && current(p) <= '9' ||
           current(p) >= '_')
    {
        match(p);
    }
    return start;
}

void parse_attribute(struct stream* p)
{
    /*
     attribute ::= <id> '=' '"' <string> '"'
    */
    if (current(p) >= 'a' && current(p) <= 'z' ||
        current(p) >= 'A' && current(p) <= 'Z' ||
        current(p) >= '_') /*first of <id>*/
    {
        const char* start = parse_id(p);
        //printf("attribute '%.*s'", (int)(p->p - start), start);

        skip_spaces(p);
        match(p); // '='
        skip_spaces(p);
        match(p); // '"'

        start = p->p;
        while (current(p) != '\"') match(p);
        //printf(" = value '%.*s'\n", (int)(p->p - start), start);

        if (strcmp(p->node, "ClCompile") == 0)
        {
            char fileName[200] = { 0 };
            strncpy(fileName, start, (int)(p->p - start));

            //we dont collect tests from the ouput itself
            if (strcmp(fileName, p->out) != 0)
            {
                CollectTestsFile(fileName, p->list);
            }
            //printf("%.*s\n", (int)(p->p - start), start);
        }
        match(p); // '"'
    }
}

void parse_attribute_list(struct stream* p)
{
    /*
     attribute_list ::= <attribute> <attribute_list> | (empty)
    */
    skip_spaces(p);
    while (current(p) >= 'a' && current(p) <= 'z' ||
           current(p) >= 'A' && current(p) <= 'Z' ||
           current(p) >= '_')
    {
        parse_attribute(p);
        skip_spaces(p);
    }
}

void parse_node(struct stream* p);

void parse_node_list(struct stream* p)
{
    /*
      node_list ::= <node> <node_list> | (empty)
    */

    while (current(p) == '<' && next(p) != '/')
    {
        parse_node(p);
        skip_spaces(p);
    }
}

const char* parse_string(struct stream* p)
{
    const char* start = p->p;
    if (start != 0)
    {
        while (current(p) != '<' && current(p) != '>') match(p);
        //printf("string = '%.*s'\n", (int)(p->p - start), start);
    }
    return start;
}

void parse_element(struct stream* p)
{
    /*
    element ::= <node_list> | <string>
    */
    skip_spaces(p);
    if (current(p) == '<' && next(p) != '/') /*first of node*/
        parse_node_list(p);
    else
        parse_string(p);
}

void parse_node_end(struct stream* p, const char* nodeid, int nodeid_size)
{
    /*
    * node_end ::= '/>' | '>' <element> '</' <id> '>'
    */
    skip_spaces(p);
    if (current(p) == '/' && next(p) == '>')
    {
        match(p); // '/'
        match(p); // ''>'
    }
    else if (current(p) == '>')
    {
        match(p); // '>'
        parse_element(p);
        match(p); // '<'
        match(p); // '/'
        const char* start = parse_id(p);
        match(p); // '>'
        //printf("end_node </'%.*s'>\n", nodeid_size, nodeid);
    }
}


void parse_node(struct stream* p)
{
    /*
      node ::= '<' <id> <attribute_list> <node_end> | (empty)
    */

    skip_spaces(p);
    if (current(p) == '<')
    {
        match(p);
        skip_spaces(p);


        const char* start = parse_id(p);
        const char* nodeid = start;
        int nodeid_size = (int)(p->p - start);

        char node[100] = { 0 };
        strncpy(node, nodeid, nodeid_size);
        const char* oldnode = p->node;
        p->node = node;

        //printf("    node <'%.*s'>\n", nodeid_size, nodeid);

        skip_spaces(p);
        parse_attribute_list(p);
        parse_node_end(p, nodeid, nodeid_size);

        p->node = oldnode;
    }
}

bool fread2(void* buffer, size_t size, size_t count, FILE* stream, size_t* sz)
{
    *sz = 0;//out

    bool result = false;
    size_t n = fread(buffer, size, count, stream);
    if (n == count) {
        *sz = n;
        result = true;
    }
    else if (n < count) {
        if (feof(stream))
        {
            *sz = n;
            result = true;
        }
    }
    return result;
}

char* readfile(const char* path)
{
    char* result = NULL;

    struct stat info;
    if (stat(path, &info) == 0)
    {
        char* data = (char*)malloc(sizeof(char) * info.st_size + 1);
        if (data != NULL)
        {
            FILE* file = fopen(path, "r");
            if (file != NULL)
            {
                if (info.st_size >= 3)
                {
                    size_t n = 0;
                    if (fread2(data, 1, 3, file, &n))
                    {
                        if (n == 3)
                        {
                            if (data[0] == (char)0xEF &&
                                data[1] == (char)0xBB &&
                                data[2] == (char)0xBF)
                            {
                                if (fread2(data, 1, info.st_size - 3, file, &n))
                                {
                                    //ok
                                    data[n] = 0;
                                    result = data; data = 0;
                                }
                            }
                            else if (fread2(data + 3, 1, info.st_size - 3, file, &n))
                            {
                                data[3 + n] = 0;
                                result = data; data = 0;
                            }
                        }
                        else
                        {
                            data[n] = 0;
                            result = data; data = 0;
                        }
                    }
                }
                else
                {
                    size_t n = 0;
                    if (fread2(data, 1, info.st_size, file, &n))
                    {
                        data[n] = 0;
                        result = data; data = 0;
                    }
                }
                fclose(file);
            }
            free(data);
        }
    }
    return result;
}


int main(int argc, char** argv) {

    if (argc < 3)
    {
        printf("usage: projec.vcxproj output.c\n");
        return EXIT_FAILURE;
    }


    printf("Searching for tests in '%s'\n", argv[1]);
    const char* p = readfile(argv[1]);

    while (*p != '\n')
    {
        p++;
    }

    struct TestList list = { 0 };

    struct stream s = { .p = p , .list = &list, .out = argv[2] };
    parse_node(&s);

    Generate(argv[2], &list);
 
}
```




