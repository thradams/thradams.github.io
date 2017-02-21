
```cpp
#include "stdafx.h"

#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <string.h>


#include <stack>
#include <functional>
#include <string>

typedef void(*clsr_void_call_t)(void*);
typedef void(*clsr_void_destroy_t)(void*);

typedef struct clsr_void_t
{
	clsr_void_call_t call;
	clsr_void_destroy_t destroy;
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
}

inline clsr_void* clsr_void_create(clsr_void_call_t call,
	clsr_void_destroy_t destroy)
{
	clsr_void* closure = (clsr_void*)malloc(sizeof(clsr_void));
	if (closure)
	{
		clsr_void_init(closure, call, destroy);
	}
	return closure;
}

inline void clsr_void_call(clsr_void* p)
{
	p->call(p);
}

struct clsr_void_str_t;
typedef void(*clsr_void_str_call_t)(clsr_void_str_t*);
typedef void(*clsr_void_str_call_t2)(const char*);

typedef struct clsr_void_str_t
{
	clsr_void_t base;
	const char* text;
} clsr_void_str;

#define CLST_VOID_STR_INIT {0,0,0}

int clsr_void_str_init(clsr_void_str * closure,
	clsr_void_str_call_t call,
	const char* text);

static void clsr_void_str_destroy(void* pv)
{
	clsr_void_str * p = (clsr_void_str *)(pv);
	free((void*)p->text);
}

int clsr_void_str_init(clsr_void_str * closure,
	clsr_void_str_call_t call,
	const char* text)
{
	clsr_void_init((clsr_void*)closure,
		(clsr_void_call_t)call,
		&clsr_void_str_destroy);

	closure->text = (const char*)malloc(sizeof(char) * (strlen(text) + 1));
	if (closure->text)
	{
		strcpy((char*)closure->text, text);
		return 0;
	}
	return 1;
}

clsr_void* clsr_void_str_create(clsr_void_str_call_t call, const char* text)
{
	clsr_void_str * closure = (clsr_void_str*)malloc(sizeof(clsr_void_str));
	if (closure)
	{
		if (clsr_void_str_init(closure, call, text) != 0)
		{
			free(closure);
			closure = 0;
		}
	}
	return (clsr_void*)closure;
}


typedef struct clsr_void_stack_t
{
	size_t      size;
	size_t      capacity;
	clsr_void** data;
} clsr_void_stack;

#define CLSR_VOID_STACK_INIT { 0, 0, 0 }

inline clsr_void* clsr_void_stack_top(clsr_void_stack* p)
{
	return p->data[p->size - 1];
}

inline void clsr_void_stack_pop(clsr_void_stack* p, clsr_void** ppItem)
{
	*ppItem = p->data[p->size - 1];
	p->size -= 1;
}

inline void clsr_void_stack_destroy(clsr_void_stack* p)
{
	for (size_t i = 0; i < p->size; i++)
	{
		clsr_void_delete(p->data[i]);
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
			p->data = (clsr_void**)malloc(nelem * sizeof(clsr_void*));
		}
		else
		{
			p->data = (clsr_void**)realloc((void*)p->data, nelem * sizeof(clsr_void*));
		}
		p->capacity = nelements;
	}

	return (p->data != 0) ? nelements : 0;
}

static size_t clsr_void_stack_grow(clsr_void_stack* p, size_t nelements)
{
	const size_t INITIAL_CAPACITY = 4;
	const size_t MAX_CAPACITY = (size_t)(UINT_MAX / sizeof(clsr_void*));
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

inline size_t clsr_void_stack_push(clsr_void_stack* p, clsr_void* pItem)
{
	size_t result = clsr_void_stack_grow(p, p->size + 1);

	if (result == 0)
	{
		clsr_void_delete(pItem);
		return 0;
	}

	p->data[p->size] = pItem;
	p->size += 1;
	return 1;
}

inline void clsr_void_stack_pop_call(clsr_void_stack* stack)
{
	clsr_void* p;
	clsr_void_stack_pop(stack, &p);

	clsr_void_call(p);
	clsr_void_destroy(p);
}

void clsr_void_stack_clear(clsr_void_stack* p)
{
	for (size_t i = 0; i < p->size; i++)
	{
		clsr_void_delete(p->data[i]);
	}
	p->size = 0;
}

#define MAX_COUNT 10000000

static int counter = 0;

static void f(void*)
{
	counter++;
}

static void f2(clsr_void_str* p)
{
	counter += strlen(p->text);
}

void Test1()
{


	for (int i = 0; i < MAX_COUNT; i++)
	{
		clsr_void_stack stack = CLSR_VOID_STACK_INIT;

		clsr_void_stack_push(&stack, clsr_void_create(&f, 0));
		clsr_void_stack_push(&stack, clsr_void_str_create(&f2, "thiago"));

		while (stack.size)
		{
			clsr_void_stack_pop_call(&stack);
		}

		clsr_void_stack_destroy(&stack);
	}

}

//#define HAS_MOVE_CAPTURE

void Test2()
{


	for (int i = 0; i < MAX_COUNT; i++)
	{
		std::stack<std::function<void(void)>> st;

		st.emplace([]()
		{
			counter++;
		});

		std::string s2 = "thiago";
#ifdef HAS_MOVE_CAPTURE
		st.emplace([s2 = std::move(s2)]()
#else
		st.emplace([s2]()
#endif		
		{
			counter += s2.size();
		});

		while (st.size())
		{
			st.top()();
			st.pop();
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


```


Output 2013
```
C++ 6453 70000000
C   4116 70000000
```

HAS_MOVE_CAPTURE
Output 2015. 
{{{
C++ 5333 70000000
C   4048 70000000
```

Output 2015. 
```
C++ 5452 70000000
C   4083 70000000
```


C 23% faster


Just construction/destruction of stack

```cpp

        //C
	for (int i = 0; i < MAX_COUNT; i++)
	{
		clsr_void_stack stack = CLSR_VOID_STACK_INIT;
		clsr_void_stack_destroy(&stack);
	}

        //C++
        for (int i = 0; i < MAX_COUNT; i++)
	{
		std::stack<std::function<void(void)>> st;
	}

```

```
C++ 1063 0
C   58 0
```

statck out of the loop - first call

```cpp

void Test1()
{
	clsr_void_stack stack = CLSR_VOID_STACK_INIT;
	clsr_void_stack_push(&stack, clsr_void_create(&f, 0));
	
	for (int i = 0; i < MAX_COUNT; i++)
	{
		clsr_void_call(clsr_void_stack_top(&stack));
	}
	clsr_void_stack_destroy(&stack);
}

void Test2()
{
	std::stack<std::function<void(void)>> st;

	st.emplace([]()
	{
		counter++;
	});

	for (int i = 0; i < MAX_COUNT; i++)
	{
		st.top()();
	}
}
```

VC++ 2015
```
C++ 152 10000000
C   25 10000000
```


statck out of the loop - second call

```cpp

void Test1()
{
	clsr_void_stack stack = CLSR_VOID_STACK_INIT;
	clsr_void_stack_push(&stack, clsr_void_str_create(&f2, "thiago"));
	
	for (int i = 0; i < MAX_COUNT; i++)
	{
		clsr_void_call(clsr_void_stack_top(&stack));
	}
	clsr_void_stack_destroy(&stack);
}

void Test2()
{
	std::stack<std::function<void(void)>> st;

	std::string s2 = "thiago";
	st.emplace([s2]()
	{
		counter += s2.size();
	});

	for (int i = 0; i < MAX_COUNT; i++)
	{
		st.top()();
	}
}

```

```
C++ 161 60000000
C   72 60000000
```

