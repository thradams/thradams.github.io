
Testing strings utils.

```cpp


#include <stdlib.h>
#include <assert.h>
#include  <errno.h>
#include  <string.h>

static inline errno_t  wstr_reserve(wchar_t** pptext,
                                    size_t* capacity,
                                    size_t new_capacity)
{
    assert(pptext && capacity);
    assert(new_capacity > 0);

    if (new_capacity < *capacity)
    {
        return 0;
    }

    errno_t r = ENOMEM;
    wchar_t* ptemp = 0;

    if (*pptext == NULL)
    {
        ptemp = (wchar_t*)malloc(sizeof(wchar_t) * (new_capacity));
        if (ptemp)
        {
            ptemp[0] = '\0';
        }
    }
    else
    {
        ptemp = (wchar_t*)realloc(*pptext, sizeof(wchar_t) * (new_capacity));
    }

    if (ptemp)
    {
        *pptext = ptemp;
        *capacity = new_capacity;
        r = 0;
    }

    return r;
}

errno_t wstr_append(wchar_t **pptext,
                    size_t* capacity,
                    size_t* size,
                    const wchar_t* psource)
{
    errno_t r = 0;
    size_t s = wcslen(psource);
    r = wstr_reserve(pptext, capacity, *size + s + 1);
    if (r == 0)
    {
        r = wcscpy_s(*pptext + *size, *capacity - *size, psource);
        if (r == 0)
        {
            *size += s;
        }
    }
    return r;
}

errno_t wstr_set(wchar_t **pptext,
                 size_t* capacity,
                 size_t* size,
                 const wchar_t* psource)
{
    errno_t r = 0;
    size_t s = wcslen(psource);
    r = wstr_reserve(pptext, capacity, s + 1);
    if (r == 0)
    {
        r = wcscpy_s(*pptext, *capacity, psource);
        if (r == 0)
        {
            *size = s;
        }
    }
    return r;
}

void wstr_clear(wchar_t **pptext,
                size_t* size)
{
    (*pptext)[0] = 0;
    *size = 0;
}

void wstr_destroy(wchar_t **pptext,
                  size_t* capacity,
                  size_t* size)
{
    free(*pptext);
    *capacity = 0;
    *size = 0;
}

int main(int argc, char* argv[])
{
    wchar_t *ptext = 0;
    size_t capacity = 0;
    size_t size = 0;

    wstr_append(&ptext, &capacity, &size, L"teste");
    wstr_append(&ptext, &capacity, &size, L"2");
    wstr_set(&ptext, &capacity, &size, L"b");
    wstr_clear(&ptext, &size);
    wstr_destroy(&ptext, &capacity, &size);


    return 0;
}




```


