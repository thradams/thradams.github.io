
```cpp

#ifndef _STRING_H
#define _STRING_H

#include <string.h>
#include <stdlib.h>
#include <stdbool.h>

typedef char* string;

#define STRING_INIT {0}


void   string_reset(string* p);
void   string_destructor(string* p);
size_t string_allocate(string* p, size_t size);
void   string_erase_n(string* p, size_t index, size_t count);
size_t string_insert_n(string* p, size_t index, const char* pSource, size_t count);
void   string_set(string* p, size_t index, char val);
size_t string_size(string* p);
void   string_append(string* p, char v);
void   string_append_n(string* p, const char* psz, size_t nelements);
char   string_get(string* p, size_t index);
char   string_back(string* p);
char   string_front(string* p);
bool   string_empty(string* p);
void   string_clear(string* p);
void   string_copy(string* p, const char* psz);
void   string_copy_n(string* p, const char* psz, size_t nelements);
void   string_erase(string* p, size_t index);
size_t string_push_back(string* p, char val);
void   string_swap(string* a, string* b);
void   string_move_to(string* from, string* to);
const char*  string_data(string* p);

#ifdef _DEBUG
size_t get_string_instances();
#endif

#endif  //_STRING_H

```

```cpp


#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <memory.h>

#include "string.h"

#define INVALID_ADDRESS ((char*)1)

#define _IS_VALID_(p) assert((p) && ((*p) != INVALID_ADDRESS))

#ifdef _DEBUG
static size_t s_string_instance_counter = 0;
size_t get_string_instances()
{
    return s_string_instance_counter;
}
#endif

size_t string_allocate(string* p, size_t nelements)
{
    _IS_VALID_(p);

    size_t nelem = nelements + 1;
    if (*p == 0)
    {
        *p = (char*) malloc(nelem * sizeof(char));
#ifdef _DEBUG
        if (p)
        {
            s_string_instance_counter++;
        }
#endif
    }
    else
    {
        *p = (char*) realloc(*p, nelem * sizeof(char));
    }

    return (*p != 0) ? nelements : 0;
}

const char* string_data(string* p)
{
    _IS_VALID_(p);

    if (p == 0)
        return 0;

    return *p;
}

void string_reset(string* p)
{
    _IS_VALID_(p);
#ifdef _DEBUG
    if (*p)
    {
        assert(s_string_instance_counter > 0);
        s_string_instance_counter--;
    }
#endif
    string_clear(p);
    *p = 0;
}

void string_destructor(string* p)
{
    _IS_VALID_(p);
#ifdef _DEBUG
    if (*p)
    {
        assert(s_string_instance_counter > 0);
        s_string_instance_counter--;
    }
#endif
    string_clear(p);
    *p = (char*)INVALID_ADDRESS;
}

size_t string_insert_n(string* p,
    size_t index,
    const char* pSource,
    size_t nelements)
{
    _IS_VALID_(p);
    size_t oldsize = string_size(p);
    size_t size = oldsize + nelements;
    size_t result = string_allocate(p, size);

    if (result == 0)
    {
        return 0;
    }

    if (index < oldsize)
    {
        memmove(&((*p)[index + nelements]),
            &((*p)[index]),
            (sizeof(char)) * (oldsize - index));
    }

    memmove(&((*p)[index]), pSource, nelements);

    /*ensure zero ended*/
    (*p)[size] = 0;

    return nelements;
}

void string_erase_n(string* p,
    size_t position,
    size_t nelements)
{
    _IS_VALID_(p);
    size_t size = string_size(p);
    assert(size >= nelements);
    assert(size > position);
    assert(nelements <= size - position);

    memmove(*p + position,
            *p + position + nelements,
            sizeof(char) * (size - nelements + 1));    
}

void string_set(string* p, size_t position, char value)
{
    _IS_VALID_(p);
    (*p)[position] = value;
}

size_t string_size(string* p)
{
    _IS_VALID_(p);

    if (*p == 0)
        return 0;

    return strlen(*p);
}

void string_append(string* p, char v)
{
    _IS_VALID_(p);
    string_insert_n(p, string_size(p), &v, 1);
}

void string_append_n(string* p, const char* psz, size_t nelements)
{
    _IS_VALID_(p);
    string_insert_n(p, string_size(p), psz, nelements);
}

char string_get(string* p, size_t index)
{
    _IS_VALID_(p);
    return (*p)[index];
}

char string_back(string* p)
{
    _IS_VALID_(p);
    return (*p)[string_size(p) - 1];
}

char string_front(string* p)
{
    _IS_VALID_(p);
    return (*p)[0];
}

bool string_empty(string* p)
{
    _IS_VALID_(p);
    return *p == 0;
}

void string_clear(string* p)
{
    _IS_VALID_(p);
    if (*p)
    {
        free(*p);
        *p = 0;
    }
}

void string_copy(string* p, const char* psz)
{
    _IS_VALID_(p);
    size_t sz = psz ? strlen(psz) : 0;
    string_copy_n(p, psz, sz);
}

void string_copy_n(string* p, const char* psz, size_t nelements)
{
    _IS_VALID_(p);
    string_clear(p);
    string_insert_n(p, 0, psz, nelements);
}

void string_erase(string* p, size_t index)
{
    _IS_VALID_(p);
    string_erase_n(p, index, 1);
}

size_t string_push_back(string* p, char val)
{
    _IS_VALID_(p);
    return string_insert_n(p, strlen(*p), &val, 1);
}

void string_swap(string* a, string* b)
{
    _IS_VALID_(a);
    _IS_VALID_(b);

    
    string temp = *a;
    *a = *b;
    *b = temp;
}

void string_move_to(string* from, string* to)
{
    _IS_VALID_(from);
    _IS_VALID_(to);
    
    
    string_swap(to, from);
    string_destructor(from);
}

```

