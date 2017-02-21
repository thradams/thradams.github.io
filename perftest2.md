
{{{cpp
#include "stdafx.h"

#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <string.h>


#include <vector>
#include <functional>
#include <string>

typedef void(*clsr_void_call_t)(void*);
typedef void(*clsr_void_destroy_t)(void*);

typedef struct clsr_void_t
{
    clsr_void_call_t call;
    void* finalCall;
    clsr_void_destroy_t destroy;
    void * data[3];
} clsr_void;

#define CLSR_VOID_INIT(f) { f , 0 }

inline void clsr_void_destroy(clsr_void* p)
{
    if (p->destroy)
        p->destroy(p);
}

inline void clsr_void_delete(clsr_void* p)
{
    if (p)
    {
        clsr_void_destroy(p);
        free(p);
    }
}

inline void clsr_void_init(clsr_void* closure,
    clsr_void_call_t call,
    clsr_void_destroy_t destroy)
{
    closure->call = call;
    closure->destroy = destroy;
    //closure->data[0] = data;
}

inline void clsr_void_call(clsr_void* p)
{
    p->call(p);
}


typedef clsr_void clsr_void_stack_item_type;
typedef struct clsr_void_stack_t
{
    size_t      size;
    size_t      capacity;
    clsr_void_stack_item_type* data;
} clsr_void_stack;

#define CLSR_VOID_STACK_INIT { 0, 0, 0 }

inline clsr_void* clsr_void_stack_top(clsr_void_stack* p)
{
    return &p->data[p->size - 1];
}

inline void clsr_void_stack_pop(clsr_void_stack* p)
{
    clsr_void_destroy(&p->data[p->size - 1]);
    p->size -= 1;
}

inline void clsr_void_stack_destroy(clsr_void_stack* p)
{
    for (size_t i = 0; i < p->size; i++)
    {
        clsr_void_destroy(&p->data[i]);
    }
    free(p->data);
    p->size = 0;
    p->data = 0;
    p->capacity = 0;
}

size_t clsr_void_stack_reserve(clsr_void_stack* p, size_t nelements)
{
    if (nelements > p->capacity)
    {
        size_t nelem = nelements;

        if (p->data == NULL)
        {
            p->data = (clsr_void_stack_item_type*)malloc(nelem * sizeof(clsr_void_stack_item_type));
        }
        else
        {
            p->data = (clsr_void_stack_item_type*)realloc((void*)p->data, nelem * sizeof(clsr_void_stack_item_type));
        }
        p->capacity = nelements;
    }

    return (p->data != 0) ? nelements : 0;
}

static size_t clsr_void_stack_grow(clsr_void_stack* p, size_t nelements)
{
    const size_t INITIAL_CAPACITY = 4;
    const size_t MAX_CAPACITY = (size_t)(UINT_MAX / sizeof(clsr_void_stack_item_type));
    if (nelements > p->capacity)
    {
        size_t newCap = p->capacity == 0 ? INITIAL_CAPACITY : p->capacity;
        while (newCap < nelements)
        {
            newCap *= 2;

            if (newCap < nelements ||
                newCap > MAX_CAPACITY)
            {
                /*overflow check*/
                newCap = MAX_CAPACITY;
            }
        }
        return clsr_void_stack_reserve(p, newCap);
    }
    return p->capacity;
}

inline clsr_void_stack_item_type* clsr_void_stack_virtual_top(clsr_void_stack* p)
{
    size_t result = clsr_void_stack_grow(p, p->size + 1);

    if (result == 0)
    {
        return 0;
    }

    return &p->data[p->size];
}

inline int clsr_void_stack_push_clsr_void_init(clsr_void_stack* p,
    clsr_void_call_t call)
{
    clsr_void_stack_item_type * pNew = clsr_void_stack_virtual_top(p);
    clsr_void_init(pNew, call, 0);
    p->size += 1;
    return 1;
}

static void freetext(void* pv)
{
    clsr_void * p = (clsr_void *)pv;
    free((void*)p->data[0]);
}

typedef void(*callstr)(char*);

static void textf(void* pv)
{
    clsr_void * p = (clsr_void *)pv;
    callstr  pf = (callstr)p->finalCall;
    char *ps = (char*)p->data[0];
    pf(ps);
}

clsr_void_stack_item_type clsr_void_str_create(void(*call)(char*),
                                 const char* text)
{
    clsr_void_stack_item_type pNew;
    clsr_void_init(&pNew, &textf, &freetext);
    pNew.finalCall = (void*)call;
    char * p2 = (char*)malloc(sizeof(char) * (strlen(text) + 1));
    strcpy(p2, text);
    pNew.data[0] = p2;
    return pNew;
}

int clsr_void_stack_push_clsr_void_str_init(clsr_void_stack* p,
    void(*call)(char*),
    const char* text)
{
    clsr_void_stack_item_type * pNew = clsr_void_stack_virtual_top(p);
    

    clsr_void_init(pNew, &textf, &freetext);
    pNew->finalCall = (void*)call;
    char * p2 = (char*)malloc(sizeof(char) * (strlen(text) + 1));
    strcpy(p2, text);
    pNew->data[0] = p2;

    
    p->size += 1;
    return 1;
}

inline int clsr_void_stack_push(clsr_void_stack* p,
    clsr_void_stack_item_type* pSource)
{
    clsr_void_stack_item_type * pNew = clsr_void_stack_virtual_top(p);
    *pNew = *pSource;
    
    p->size += 1;
    return 1;
}

inline void clsr_void_stack_call_pop(clsr_void_stack* stack)
{
    clsr_void_call(&stack->data[stack->size - 1]);
    clsr_void_stack_pop(stack);
}

void clsr_void_stack_clear(clsr_void_stack* p)
{
    for (size_t i = 0; i < p->size; i++)
    {
        clsr_void_destroy(&p->data[i]);
    }
    p->size = 0;
}

#define MAX_COUNT 10000000

static int counter = 0;

static void f(void*)
{
    counter++;
}

static void f2(char* text)
{
    counter +=  strlen(text);
}

void Test1()
{


    for (int i = 0; i < MAX_COUNT; i++)
    {
        clsr_void_stack stack = CLSR_VOID_STACK_INIT;

        clsr_void_stack_push_clsr_void_init(&stack, &f);
        clsr_void_stack_push(&stack, &clsr_void_str_create(&f2, "thiago"));

        while (stack.size)
        {
            clsr_void_stack_call_pop(&stack);
        }

        clsr_void_stack_destroy(&stack);
    }

}

#define HAS_MOVE_CAPTURE

void Test2()
{


    for (int i = 0; i < MAX_COUNT; i++)
    {
        std::vector<std::function<void(void)>> st;
        st.reserve(4);


        st.emplace_back([]()
        {
            counter++;
        });

        std::string s2 = "thiago";
#ifdef HAS_MOVE_CAPTURE
        st.emplace_back([s2 = std::move(s2)]()
#else
        st.emplace_back([s2]()
#endif		
        {
            counter += s2.size();
        });

        while (st.size())
        {
            st.back()();
            st.pop_back();
        }
    }
}

void RunTest(const char* message, void(*test)(void))
{
    counter = 0;
    time_t start = clock();
    test();
    printf("%s %d %d\n", message, int(clock() - start), counter);
}

int main(int argc, char* argv[])
{
    RunTest("C++", &Test2);
    RunTest("C  ", &Test1);
    return 0;
}
}}}

{{{
C++ 1901 70000000
C   1810 70000000
}}}

