
Comparing runtime cost of exceptions x return codes.
 
Uses:

[Stopwatch class](stopwatch.htm)

###Code

```cpp
#include <iostream>
#include "stopwatch.h"
typedef int ECode;
#define Error1 1
#define Error2 2
#define succeeded(e) ((e) == 0)
#define failed(e) ((e) != 0)

struct Error1Exception : public std::exception
{
};
struct Error2Exception : public std::exception
{
};
const int maxsteps = 100000000;
int a = 0;
int b = 0;
int c = 0;
int d = 0;

ECode f1(int i, int& r)
{
    if (i >= a && i <= b)
    {
        return Error1;
    }

    r = 1;
    return 0;
}

ECode f2(int i, int& r)
{
    if (i >= c && i <= d)
    {
        return Error2;
    }

    r = 2;
    return 0;
}

ECode g(int i, int& r)
{
    int r1 = 0;
    ECode e = f1(i, r1);

    if (succeeded(e))
    {
        int r2 = 0;
        e = f2(i, r2);

        if (succeeded(e))
        {
            r = r1 + r2;
        }
    }

    return e;
}

int ff1(int i)
{
    if (i >= a && i <= b)
    {
        throw Error1Exception();
    }

    return 1;
}

int ff2(int i)
{
    if (i >= c && i <= d)
    {
        throw Error2Exception();
    }

    return 2;
}

int gg(int i)
{
    return ff1(i) + ff2(2);
}

using namespace std;

void ErrorCode()
{
    int total = 0;
    Stopwatch sw(true);

    for (int i = 0; i < maxsteps; i++)
    {
        int r = 0;
        ECode e = g(i, r);

        if (succeeded(e))
        {
            total += r;
        }
    }

    sw.Stop();
    cout << "ErrorCode total = " << total << " in "
         << sw.GetElapsedMilliseconds() << " ms" << endl;
}


void Exceptions()
{
    int total = 0;
    Stopwatch sw(true);

    for (int i = 0; i < maxsteps; i++)
    {
        try
        {
          total += gg(i);
        }
        catch(std::exception&)
        {
        }        
    }

    sw.Stop();
    cout << "Exceptions total = " << total << " in "
         << sw.GetElapsedMilliseconds() << " ms" << endl;
}



int main()
{
    bool errors = false;

    if (errors)
    {
        a = 0;
        b = maxsteps / 2;
        c = maxsteps / 2;
        d = maxsteps;
    }
    else
    {
        a = maxsteps;
        b = maxsteps + 10;
        c = b;
        d = c + 10;
    }

    //ErrorCode();
    Exceptions();
    return 0;
}
```


###Results
```

x86 - VC++ 2010 - errors = false


Return code

305 ms
344 ms
285 ms
332 ms
331 ms
317 ms
332 ms
380 ms
353 ms
350 ms
344 ms
328 ms
293 ms
315 ms
322 ms

Average 328,73

Exceptions

290 ms
331 ms
292 ms
386 ms
393 ms
284 ms
331 ms
291 ms
368 ms
329 ms
347 ms
308 ms
332 ms
392 ms
393 ms

Average 337,8  (+2,68%)



x64 - VC++ 2010 - errors = false

341 ms
254 ms
316 ms
339 ms
260 ms
250 ms
263 ms
249 ms
255 ms
271 ms
282 ms
265 ms
360 ms
327 ms
239 ms

Average 284,73

------
471 ms
467 ms
442 ms
444 ms
407 ms
407 ms
395 ms
383 ms
407 ms
427 ms
446 ms
446 ms
454 ms
441 ms
390 ms

Average 428,46 (+33%)


```



