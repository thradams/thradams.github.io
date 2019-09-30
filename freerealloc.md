Performance test realloc X free+malloc

```cpp


#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h>


#define USE_REALLOC 0

#define STRING_COUNT 100000
#define CHANGES_COUNT 60
#define STRSIZE 5000

#define FREE_MALLOC_EXTRA_COPY 0

int main()
{
  srand(123456);

  printf("initializing %d strings size between 1 and %d ...\n", STRING_COUNT, STRSIZE + 1);
  char** strarray = malloc(sizeof(char*) * STRING_COUNT);
  int* strsize = malloc(sizeof(int) * STRING_COUNT);


  int newalloc = 0;
  int samealloc = 0;
  for (int i = 0; i < STRING_COUNT; i++)
  {
    size_t len = 1 + rand() % STRSIZE;
    strsize[i] = len;
    strarray[i] = malloc(sizeof(char) * len + 1);
    memset(strarray[i], 'X', len);
    strarray[i][len] = 0;

    //printf("%s\n", strarray[i]);
  }

  

  time_t start = clock();
  printf("changing %d strings %d times each ... \n", STRING_COUNT, CHANGES_COUNT);

  for (int k = 0; k < CHANGES_COUNT; k++)
  {
    for (int i = STRING_COUNT - 1; i >= 0; i--)
    {
      //printf("before %s\n", strarray[i]);

      size_t len = k + rand() % 50;
      char* p = 0;
#if USE_REALLOC
      p = realloc(strarray[i], sizeof(char) * len + 1);
#else
      p = malloc(sizeof(char) * len + 1);
#if FREE_MALLOC_EXTRA_COPY
      strncpy(p, strarray[i], len < strsize[i] ? len : strsize[i]);
      free(strarray[i]);
#endif
#endif

      if (p != strarray[i])
        newalloc++;
      else
        samealloc++;

      strsize[i] = len;
      strarray[i] = p;
      strarray[i][len] = 0;
      memset(strarray[i], 'Y', len);

      //printf("after %s\n", strarray[i]);
    }
  }

  const char* method = USE_REALLOC ? "realloc" : FREE_MALLOC_EXTRA_COPY ? "free+malloc+copy" : "free+malloc";

  printf("using %s took %d\n",   method, (int)(clock() - start));
  printf("new %d; same %d\n", newalloc, samealloc);

}
```

