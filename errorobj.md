# Error object

```c

#include <stdio.h>  
#include <stdarg.h> 

typedef struct 
{
  char Msg[300];
} Error;

inline bool Error_IsEmpty(Error* error)
{
  return error->Msg[0] == '0';
}

void Error_SetVa(Error * p, const char* fmt, va_list va)
{
  vsnprintf(p->Msg, sizeof(p->Msg), fmt, va); 
}

void Error_Set(Error * p, const char* fmt, ...)
{
  va_list args;
  va_start(args, fmt);
  vsnprintf(p->Msg, sizeof(p->Msg), fmt, args);
  va_end(args);
}


```

Usage:

```c

bool F2(Error* error)
{
  Error_Set(error, "error at f2 %d", 1);
  return false;
}


int main()
{
    ErrorExtended error = { 0 };
    F2(&error);
    
    return 0;
}


```
