

```cpp


#include "stdafx.h"

#ifdef __cplusplus
#include <string>
#include <vector>
#include <iostream>
#endif

#include <string.h>
#include <stdlib.h>

#include <time.h>
#include <assert.h>

#define LOOP_COUNT 1000

#define STRING_ITEM "small"
//#define STRING_ITEM "large large large large large"

#define LOCAL_BUFFER_SIZE sizeof(size_t) * 4

struct str
{
    char * text;
    size_t size;
    char localbuffer[LOCAL_BUFFER_SIZE];
    int ismall;
};

inline void str_destroy(struct str* p)
{
    if (!p->ismall)
    {
        free(p->text);
    }
}

inline int str_init(struct str* p, const char * text)
{
    int r = 1;
    size_t text_size = strlen(text);

    int ismall = (text_size + 1) < LOCAL_BUFFER_SIZE;

    char * pcopy = ismall ?
        p->localbuffer : (char*)malloc(sizeof(char) * (text_size + 1));

    if (pcopy)
    {
        strncpy(pcopy, text, text_size + 1);
        p->ismall = ismall;
        p->text = pcopy;
        p->size = text_size;
        r = 0;
    }

    return r;
}

struct strs
{
    struct str * strings;
    size_t size;
    size_t capacity;
};

#define STRS_INIT { 0, 0, 0 }

inline int strs_reserve(struct strs* p, size_t nelements)
{
    int r = 0;
    if (nelements > p->capacity)
    {
        struct str* pnew = p->strings;
        pnew = (struct str*)realloc(pnew, nelements * sizeof(struct str));
        
        if (pnew && p->strings != pnew)
        {            
            for (size_t i = 0; i < p->size; i++)
            {
                if (pnew[i].ismall)
                {
                    /*correção do ponteiro interno*/
                    pnew[i].text = pnew[i].localbuffer;
                }
            }
        }
        
        if (pnew)
        {
            p->strings = pnew;
            p->capacity = nelements;
            assert(r == 0);
        }
        else
        {
            /*sem memoria*/
            r = 1;
        }
    }
    return r;
}

inline int strs_grow(struct strs* p, size_t nelements)
{
    int r = 0;
    if (nelements > p->capacity)
    {
        size_t new_nelements = p->capacity + p->capacity / 2;
        if (new_nelements < nelements)
        {
            new_nelements = nelements;
        }
        r = strs_reserve(p, new_nelements);
    }
    return r;
}

inline int strs_emplace_back(struct strs* p, const char* text)
{
    int r = strs_grow(p, p->size + 1);
    if (r == 0)
    {
        r = str_init(&p->strings[p->size], text);
        if (r == 0)
        {            
            p->size++;
        }        
    }
    return r;
}

void strs_destroy(struct strs* p)
{
    for (size_t i = 0; i < p->size; i++)
    {
        str_destroy(&p->strings[i]);        
    }
    free(p->strings);
}

int fc(void)
{
    int r = 0;
    char buffer[] = STRING_ITEM;
    for (int k = 0; k < LOOP_COUNT; k++)
    {
        struct strs v = STRS_INIT;
        for (int i = 0; i < LOOP_COUNT; i++)
        {
            if (strs_emplace_back(&v, buffer) != 0)
            {
                r = 0;
                break;
            }
        }

        strs_destroy(&v);
    }
    return r;
}

#ifdef __cplusplus
int f()
{
    char buffer[] = STRING_ITEM;
    for (int k = 0; k < LOOP_COUNT; k++)
    {
        std::vector<std::string> v;

        for (int i = 0; i < LOOP_COUNT; i++)
        {
            v.emplace_back(buffer);
        }
    }
    return 0;
}
#endif

int run_test(const char* message, int(*test)(void))
{
    time_t start = clock();
    int r = test();
    printf("%s %d\n", message, (int) clock() - start);
    return r;
}

int main(int argc, char* argv[])
{
    run_test("C   :", &fc);
#ifdef __cplusplus
    run_test("C++ :", &f);
#endif
    return 0;
}


```
