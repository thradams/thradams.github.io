TrendCache is a circular buffer to store values from the last N seconds or some maximum number of points depending which came first.
The frequency which data is inserted is not known in advance so the buffer will grow automatically as the data is inserted.
For instance, if we want to store the last 60 seconds and we add 1 value
per second then 60 points is enough. But if we add two points per second 
then we need 120 points.
If you have a low frequency the TrendCache will not shrink.
We also have the minimum number of points. So, in case we have a very low frequency
we don't need to discard points that are using a very low number of bytes.




```c

#include <stdlib.h>
#include < stdio.h>
#include < stdbool.h>
#include <assert.h>

#include <windows.h>

static HANDLE stdoutHandle, stdinHandle;
static DWORD outModeInit, inModeInit;

void setupConsole(void) {
    DWORD outMode = 0, inMode = 0;
    stdoutHandle = GetStdHandle(STD_OUTPUT_HANDLE);
    stdinHandle = GetStdHandle(STD_INPUT_HANDLE);

    if (stdoutHandle == INVALID_HANDLE_VALUE || stdinHandle == INVALID_HANDLE_VALUE) {
        exit(GetLastError());
    }

    if (!GetConsoleMode(stdoutHandle, &outMode) || !GetConsoleMode(stdinHandle, &inMode)) {
        exit(GetLastError());
    }

    outModeInit = outMode;
    inModeInit = inMode;

    // Enable ANSI escape codes
    outMode |= ENABLE_VIRTUAL_TERMINAL_PROCESSING;

    // Set stdin as no echo and unbuffered
    inMode &= ~(ENABLE_ECHO_INPUT | ENABLE_LINE_INPUT);

    if (!SetConsoleMode(stdoutHandle, outMode) || !SetConsoleMode(stdinHandle, inMode)) {
        exit(GetLastError());
    }
}

void restoreConsole(void) {
    // Reset colors
    printf("\x1b[0m");

    // Reset console mode
    if (!SetConsoleMode(stdoutHandle, outModeInit) || !SetConsoleMode(stdinHandle, inModeInit)) {
        exit(GetLastError());
    }
}

#define GREEN  "\x1b[32m"
#define YELLOW "\x1b[93m"
#define RESET "\x1b[0m"


struct Cache
{
    int* points;
    int size; //quantos existem dentro do container
    int capacity; //numero de items alocados


    int zero;// indice do zero (mais antigo)

    int min_points;
    int max_points;
    int max_timeSec;
};
#define CACHE_INIT { NULL, 0, 0, 0, 60, 86400, 60 }

void destroy_cache(struct Cache* cache)
{

}

void cache_remove_add(struct Cache* cache, int point)
{
    cache->points[cache->zero] = point;
    cache->zero++;
    if (cache->zero == cache->size)
    {
        cache->zero = 0;
    }
}

void cache_add_new(struct Cache* cache, int point)
{
    if (cache->size + 1 > cache->capacity)
    {
        int n = cache->capacity + cache->capacity / 4;
        if (n == 0)
        {
            n = cache->min_points;
        }
        int* pnew = cache->points;
        pnew = (int*)realloc(pnew, n * sizeof(int));
        if (pnew)
        {
            cache->points = pnew;
            cache->capacity = n;
        }
    }
    
    if (cache->zero != 0)
    {
        //o novo valor tem que entrar atras do zero, entao ele empurra
        //todo incluindo zero para frente 1 posicao.

        memmove(&cache->points[cache->zero + 1],
                &cache->points[cache->zero],
                (cache->size - cache->zero) * sizeof(int));

        cache->points[cache->zero] = point;
        cache->size++;
        cache->zero++;
        assert(cache->zero < cache->size);
    }
    else
    {
        cache->points[cache->size] = point;
        cache->size++;
    }
    
}

void cache_add(struct Cache* cache, int point)
{
    if (cache->size == cache->max_points)
    {
        cache_remove_add(cache, point);
    }
    else if (cache->size < cache->min_points)
    {
        cache_add_new(cache, point);
    }
    else
    {
        if (point - cache->points[cache->zero] > cache->max_timeSec)
        {
            cache_remove_add(cache, point);
        }
        else
        {
            cache_add_new(cache, point);
        }
    }
}


int cache_get(struct Cache* cache, int index)
{
    if (cache->zero + index < cache->size)
    {
        index = cache->zero + index;
    }
    else
    {
        index = (cache->zero + index) - cache->size;        
    }
    return  cache->points[index];
}

void check(struct Cache* cache)
{
    for (int i = 0; i < cache->size; i++)
    {
        if (i > 0)
            assert(cache_get(cache, i) > cache_get(cache, i - 1));
    }
}

void cache_print(struct Cache* cache)
{
    check(cache);

    printf("[");
    for (int i = 0; i < cache->size; i++)
    {
        if (i > 0)
            printf(",");

        if (i == cache->zero)
            printf(YELLOW);
     
        if (i < cache->size)
            printf("%2d", cache->points[i]);
        else
            printf("");

        printf(RESET);

    }
    printf("] size=%d, capacity=%d", cache->size, cache->capacity);
    if (cache->size > 0)
    {
        printf("  dist=%d", cache_get(cache, cache->size - 1)- cache_get(cache, 0));
    }
    printf("\n");
}


void Test2()
{
    struct Cache cache = CACHE_INIT;
    cache.min_points = 60;
    cache.max_points = 120;
    cache.max_timeSec = 60; /*1 segundo*/

    int i = 0;
    for (; i < 60; i += 2)
    {
        cache_add(&cache, i);
        cache_print(&cache);
    }

    for (; i < 120; i += 1)
    {
        cache_add(&cache, i);
        cache_print(&cache);
    }

    destroy_cache(&cache);
}

void Test1()
{
    struct Cache cache = CACHE_INIT;
    cache.min_points = 5;
    cache.max_points = 1000;
    cache.max_timeSec = 60000;

    int i = 0;
    for (; i < 60'000; i += 1000)
    {
        cache_add(&cache, i);
        cache_print(&cache);
    }

    for (; i < 120'000; i += 500)
    {
        cache_add(&cache, i);
        cache_print(&cache);
    }

    for (; i < 180'000; i += 1000)
    {
        cache_add(&cache, i);
        cache_print(&cache);
    }

    destroy_cache(&cache);
}

int main()
{
    setupConsole();
    Test2();
    Test1();
    restoreConsole();
}


```

