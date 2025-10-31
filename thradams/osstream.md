
```cpp
#include <errno.h>
#include <varargs.h>
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <stdarg.h>

typedef struct
{
  char*  c_str;
  int size;
  int capacity;
} osstream;


int ss_putc(int ch, osstream *sb)
{
  if (sb->size + 1 > sb->capacity)
  {
    int n = sb->capacity + sb->capacity / 2;
    if (n < sb->size + 1)
    {
      n = sb->size + 1;
    }

    char* pnew = sb->c_str;
    pnew = (char*)realloc(pnew, (n + 1) * sizeof(char));
    if (pnew)
    {
      sb->c_str = pnew;
      sb->capacity = n;
    }
    else
    {
      errno = ENOMEM;
      ch = EOF;
    }
  }

  if (ch != EOF)
  {
    sb->c_str[sb->size] = ch;
    sb->c_str[sb->size + 1] = 0;
    sb->size++;
  }

  return ch;
}

int ss_close(osstream* stream)
{
  free(stream->c_str);
  return 0;
}


int ss_vafprintf(osstream* stream, const char *fmt, va_list args)
{
  int size = 0;
  va_list tmpa;

  va_copy(tmpa, args);

  size = vsnprintf(stream->c_str + stream->size, stream->capacity - stream->size, fmt, tmpa);

  va_end(tmpa);

  if (size < 0) 
  {
    return -1; 
  }

  if (stream->size + size > stream->capacity)
  {
    char* pnew = stream->c_str;
    pnew = (char*)realloc(pnew, (stream->size + size + 1) * sizeof(char));
    if (pnew)
    {
      stream->c_str = pnew;
      stream->capacity = stream->size + size;
    }
    else
    {
      errno = ENOMEM;      
      size = -1;
    }
  }
  
  size = vsprintf(stream->c_str + stream->size, fmt, args);
  if (size > 0)
  {
    stream->size += size;
  }
  return size;
}

int ss_printf(osstream* stream, const char *fmt, ...)
{
  va_list args;
  va_start(args, fmt);
  int size = ss_vafprintf(stream, fmt, args);
  va_end(args);
  return size;  
}

int main(void)
{
  
  osstream ss = { 0 };
  ss_printf(&ss, "hello");
  
  printf("buf = `%s', size = %zu\n", ss.c_str, ss.size);

  ss_printf(&ss, ", world");
  ss_close(&ss);
  
  return 0;
}

```
