# Vector of string

[Make container](makecontainer.md)

```cpp

#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>

#define strdup _strdup


struct str_array
{
    const char** data;
    int size;
    int capacity;
};


int str_array_push(struct str_array* p, const char* textSource)
{
    char* text = strdup(textSource);
    if (text)
    {
        if (p->size + 1 > p->capacity)
        {
            int n = p->capacity * 2;
            if (n == 0)
            {
                n = 1;
            }
            const char** pnew = p->data;
            pnew = (const char**)realloc((void*)pnew, n * sizeof(const char*));
            if (pnew)
            {
                p->data = pnew;
                p->capacity = n;
            }
            else
            {
                free(text);
                text = 0;
            }
        }
        if (text)
        {
            p->data[p->size] = text;
            p->size++;
        }
    }
    return text != 0;
}

void str_array_destroy(struct str_array* p)
{
    for (int i = 0; i < p->size; i++)
    {
        free((void*)p->data[i]);
    }
    free((void*)p->data);
}


#include <stdio.h>

int main()
{
    struct str_array a = { 0 };
    str_array_push(&a, "text1");
    str_array_push(&a, "text2");
    for (int i = 0; i < a.size; i++)
    {
        printf("%s\n", a.data[i]);
    }
    str_array_destroy(&a);
}


```
