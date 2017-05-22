# Creating va_list on the heap

(Visual Studio)


```cpp


#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>


void F2(const char* fmt, va_list vl)
{
  int i = va_arg(vl, int);
  double d = va_arg(vl, double);
  printf("i = %d, d = %lf\n", i, d);
}

void F(const char* fmt, ...)
{
  va_list vl;
  va_start(vl, fmt);
  F2(fmt, vl);
  va_end(vl);
}

void va_list_free(va_list args)
{
  free(args);
}


va_list va_list_create(void* pmem, int i, double d)
{
  va_list p = (va_list)pmem;
  va_arg(p, int) = i;
  va_arg(p, double) = d;
  return (va_list)pmem;
}

va_list va_list_malloc(int i, double d)
{
  void* pv = malloc(sizeof(int) + sizeof(double));
  return va_list_create(pv, i, d);  
}

int main()
{
  F("", 1, 2.0);
  va_list args = va_list_malloc(1, 2.0);
  F2("", args);
  va_list_free(args);
  return 0;
}


```
```c

#include "stdafx.h"
#include <stdlib.h>
#include <stdio.h>


typedef struct X {
	char a1;
	char a2;
	double a3;
	void* a4;
	char a5;
} X;
#define X_INIT {'a', 'b', 1.2, (void*)3 , 'c'}

#define _SLOTSIZEOF2(t)  ((sizeof(t) + sizeof(t) - 1) & ~(sizeof(t) - 1))
#define _APALIGN2(t,ap)  (((va_list)0 - (ap)) & (sizeof(t) - 1))
#define arg(ap, t) (*(t*)((ap += _SLOTSIZEOF2(t) + _APALIGN2(t,ap)) - _SLOTSIZEOF2(t)))

void Use(void* pv)
{
	char* args = pv;
	char a1 = arg(args, char);
	char a2 = arg(args, char);
	double a3 = arg(args, double);
	void* a4 = arg(args, void*);
	char a5  = arg(args, char);
}

int main()
{
	printf("%d %d %d %d %d\n",
		  (int)offsetof(X, a1),
		  (int)offsetof(X, a2),
	      (int)offsetof(X, a3),
	      (int)offsetof(X, a4),
		  (int)offsetof(X, a5));

	X x = X_INIT;
	Use(&x);

    return 0;
}


```
