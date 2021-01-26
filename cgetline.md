

```cpp
#include <stdlib.h>
#include <stdio.h>
#include <ERRNO.H>
#include <assert.H>

#define MIN_LINE_ALLOCATION 64

int getstr(char **lineptr, 
  size_t *n,
  FILE *stream,
  char terminator, 
  int offset)
{    
  int ret;

  if (!lineptr || !n || !stream)
  {
    errno = EINVAL;
    return -1;
  }

  if (!*lineptr)
  {
    *n = MIN_LINE_ALLOCATION;
    *lineptr = (char*) malloc(sizeof(char) * (*n));
    if (!*lineptr)
    {
      errno = ENOMEM;
      return -1;
    }
  }

  int nchars_avail = *n - offset;
  char *read_pos = *lineptr + offset;

  for (;;)
  {
    int save_errno;
    int c = getc(stream);

    save_errno = errno;

    assert((*lineptr + *n) == (read_pos + nchars_avail));
    if (nchars_avail < 2)
    {
      if (*n > MIN_LINE_ALLOCATION)
      {
        *n *= 2;
      }
      else
      {
        *n += MIN_LINE_ALLOCATION;
      }

      nchars_avail = *n + *lineptr - read_pos;
      *lineptr = (char*)realloc(*lineptr, sizeof(char) * (*n));
      if (!*lineptr)
      {
        errno = ENOMEM;
        return -1;
      }
      read_pos = *n - nchars_avail + *lineptr;
      assert((*lineptr + *n) == (read_pos + nchars_avail));
    }

    if (ferror(stream))
    {
      errno = save_errno;
      return -1;
    }

    if (c == EOF)
    {
      if (read_pos == *lineptr)
      {
        return -1;
      }
      else
      {
        break;
      }
    }

    *read_pos++ = c;
    nchars_avail--;

    if (c == terminator)
    {
      break;
    }
  }

  *read_pos = '\0';
  ret = read_pos - (*lineptr + offset);
  return ret;
}

int getline(char **lineptr, size_t *n, FILE *stream)
{
  return getstr(lineptr, n, stream, '\n', 0);
}

int wgetstr(wchar_t **lineptr,
  size_t *n,
  FILE *stream,
  wchar_t terminator,
  int offset)
{    
  int ret;

  if (!lineptr || !n || !stream)
  {
    errno = EINVAL;
    return -1;
  }

  if (!*lineptr)
  {
    *n = MIN_LINE_ALLOCATION;
    *lineptr = (wchar_t*)malloc(sizeof(wchar_t) * (*n));
    if (!*lineptr)
    {
      errno = ENOMEM;
      return -1;
    }
  }

  int nchars_avail = *n - offset;
  wchar_t* read_pos = *lineptr + offset;

  for (;;)
  {
    int save_errno;
    register wint_t c = fgetwc(stream);

    save_errno = errno;

    assert((*lineptr + *n) == (read_pos + nchars_avail));
    if (nchars_avail < 2)
    {
      if (*n > MIN_LINE_ALLOCATION)
      {
        *n *= 2;
      }
      else
      {
        *n += MIN_LINE_ALLOCATION;
      }

      nchars_avail = *n + *lineptr - read_pos;
      *lineptr = (wchar_t*) realloc(*lineptr, sizeof(wchar_t) * (*n));
      if (!*lineptr)
      {
        errno = ENOMEM;
        return -1;
      }
      read_pos = *n - nchars_avail + *lineptr;
      assert((*lineptr + *n) == (read_pos + nchars_avail));
    }

    if (ferror(stream))
    {
      errno = save_errno;
      return -1;
    }

    if (c == WEOF)
    {
      if (read_pos == *lineptr)
      {
        return -1;
      }
      else
      {
        break;
      }
    }

    *read_pos++ = c;
    nchars_avail--;

    if (c == terminator)
    {
      break;
    }
  }

  *read_pos = L'\0';
  ret = read_pos - (*lineptr + offset);
  return ret;
}

int wgetline(wchar_t **lineptr, size_t *n, FILE *stream)
{
  return wgetstr(lineptr, n, stream, L'\n', 0);
}

```

sample
```cpp
  FILE *hFile = fopen("input.txt", "r, ccs=UTF-8");
  if (hFile)
  {
    wchar_t *lineptr = 0;
    size_t n = 0;
    while  (wgetline(&lineptr, &n, hFile) != -1)
    {
      wprintf(L"%s", lineptr);
    }   
    free(lineptr);
    fclose(hFile);
  }
```

Reading a line from console to a fixed buffer.

```cpp

int getstrstr(char **lineptr,
             size_t *n,
             const char** stream,
             char terminator,
             int  offset)
{
  int ret;

  if (!lineptr || !n || !(*stream))
  {
    return -1;
  }

  if (!*lineptr)
  {
    *n = MIN_LINE_ALLOCATION;
    *lineptr = (char*)malloc(sizeof(char) * (*n));
    if (!*lineptr)
    {
      return -1;
    }
  }

  int nchars_avail = *n - offset;
  char *read_pos = *lineptr + offset;

  for (;;)
  {
    int save_errno;
    int c = *(*stream);
    (*stream)++;

    assert((*lineptr + *n) == (read_pos + nchars_avail));
    if (nchars_avail < 2)
    {
      if (*n > MIN_LINE_ALLOCATION)
      {
        *n *= 2;
      }
      else
      {
        *n += MIN_LINE_ALLOCATION;
      }

      nchars_avail = *n + *lineptr - read_pos;
      *lineptr = (char*)realloc(*lineptr, sizeof(char) * (*n));
      if (!*lineptr)
      {
        return -1;
      }
      read_pos = *n - nchars_avail + *lineptr;
      assert((*lineptr + *n) == (read_pos + nchars_avail));
    }

    if (c == 0)
    {
      if (read_pos == *lineptr)
      {
        return -1;
      }
      else
      {
        break;
      }
    }

    *read_pos++ = c;
    nchars_avail--;

    if (c == terminator)
    {
      break;
    }
  }

  *read_pos = '\0';
  ret = read_pos - (*lineptr + offset);
  return ret;
}
```

```cpp
 char *slineptr = 0;
  size_t n = 0;
  
  const char *p = "a , b, c";

  while (getstrstr(&slineptr,
    &n,
    &p,
    ',',
    0) != -1)
  {
    printf("'%s'", slineptr);
  }
  free(slineptr);
```


```cpp


int getstr(char* lineptr,
           size_t n,
           FILE* stream,
           char terminator,
           int offset)
{
    int ret;


    int nchars_avail = n - offset;
    char* read_pos = lineptr + offset;

    for (;;)
    {
        int save_errno;
        int c = getc(stream);

        save_errno = errno;

        assert((lineptr + n) == (read_pos + nchars_avail));
        if (nchars_avail < 2)
        {
            return EACCES;
        }

        if (ferror(stream))
        {
            errno = save_errno;
            return -1;
        }

        if (c == EOF)
        {
            if (read_pos == lineptr)
            {
                return -1;
            }
            else
            {
                break;
            }
        }
        
        if (c == terminator)
        {
            break;
        }

        *read_pos++ = c;
        nchars_avail--;


    }

    *read_pos = '\0';
    ret = read_pos - (*lineptr + offset);
    return ret;
}

int main()
{
    char str[100];
    getstr(str, 100, stdin, '\n', 0);
    printf("%s", str);
}
```

