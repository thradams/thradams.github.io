

## Make Tests

This program scans the  source files that are inside a Visual Studio project searching for tests 
starting with UNIT_TEST_ .

Then an output file is generated with forward declarations and calling each
test.

Usage: Inside Visual Studio External Tools

```
Command: your exe path
Arguments: $(ProjectFileName) unit_test.c
Initial Directory: $(ProjectDir)
[x] Use output window
```


Sample

```cpp

#ifdef TEST
#include "unit_test.h"

void UNIT_TEST_JsonTest1(void)
{
    char buffer[3];
    int n = json_snprintf(buffer, sizeof buffer, "ABC");
    ASSERT(n == 3);
    ASSERT(strcmp(buffer, "AB") == 0);

    char buffer10[10];
    n = json_snprintf(buffer10, sizeof buffer10, "'%s'", "string");
    ASSERT(n == 8);
    ASSERT(strcmp(buffer10, "\"string\"") == 0);

}
#endif

```

```cpp
//unit_test.h
#pragma once

#include <stdio.h>
#include "terminal.h"

#define RESET ESC "[0m"

#define ASSERT(B) printf("%d : '%s' ", __LINE__ , #B); if (!(B)) { printf(" : " RED " ERROR!\n" RESET); exit(1); } else printf(" : " GREEN " OK\n" RESET);

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
};

struct TestList
{
    struct Test* pHead;
    struct Test* pTail;
};

void CollectTests(FILE* f, struct TestList* list)
{
    char ch = fgetc(f);
    while (!feof(f))
    {
        int count = 0;

        char buffer[100] = { 0 };

        if (ch >= 'a' && ch <= 'z' ||
            ch >= 'A' && ch <= 'Z')
        {
            while (ch >= 'a' && ch <= 'z' ||
                   ch >= 'A' && ch <= 'Z' ||
                   ch >= '0' && ch <= '9' ||
                   ch == '_')
            {
                buffer[count] = ch;
                ch = fgetc(f);
                count++;
            }
            if (buffer[0] == 'U' &&
                buffer[1] == 'N' &&
                buffer[2] == 'I' &&
                buffer[3] == 'T' &&
                buffer[4] == '_' &&
                buffer[5] == 'T' &&
                buffer[6] == 'E' &&
                buffer[7] == 'S' &&
                buffer[8] == 'T'
                )
            {
                struct Test* p = calloc(1, sizeof * p);
                if (p)
                {
                    strncpy(p->name, buffer, sizeof(buffer));
                    printf("  %s\n", p->name);

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
            }
        }

        ch = fgetc(f);
    }
}

void CollectTestsFile(const char* file, struct TestList* list)
{
    FILE* f = fopen(file, "r");
    if (f)
    {
        printf("%s\n", file);
        CollectTests(f, list);
        fclose(f);
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
            char fileName[200] = {0};
            strncpy(fileName, start, (int)(p->p - start));

            //we dont collect tests from the ouput itself
            if (strcmp(fileName, p->out) == 0)
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

        char node[100] = {0};        
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
        printf("usage: visual_project output.c\n");
        return EXIT_FAILURE;
    }


    printf("%s\n", argv[1]);
    const char* p = readfile(argv[1]);// "<node at1=\"teste\">aa</node>";

    
    while (*p != '\n')
    {
        p++;
    }

    struct TestList list = { 0 };

    struct stream s = { .p = p , .list = &list, .out=argv[2]};
    parse_node(&s);


    FILE* fout = fopen(argv[2], "w");
    if (fout)
    {
        fprintf(fout, "#ifdef TEST\n\n");
        fprintf(fout, "//forward declarations\n\n");

        struct Test* pCurrent = list.pHead;
        while (pCurrent)
        {
            fprintf(fout, "void %s(void);\n", pCurrent->name);
            pCurrent = pCurrent->pNext;
        }

        fprintf(fout, "\n");
        fprintf(fout, "void DoUnitTests(void)\n{\n");
        pCurrent = list.pHead;
        while (pCurrent)
        {
            fprintf(fout, "  %s();\n", pCurrent->name);
            pCurrent = pCurrent->pNext;
        }
        fprintf(fout, "}\n");
        fprintf(fout, "#endif\n");
        fclose(fout);
    }

}

```

Output sample:

```cpp
#ifdef TEST

//forward declarations

void UNIT_TEST_NewUUID(void);
void UNIT_TEST_UrlTest(void);

void DoUnitTests(void)
{
  UNIT_TEST_NewUUID();
  UNIT_TEST_UrlTest();
}
#endif

```
