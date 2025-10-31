
How to check operations in integers?



Some [[intmath.htm| graphics]] green works, red don't.


###Signed int functions
```cpp
bool SignedSignedSum(int x, int y)
{
    if (x <= 0)
    {
        if (y <= 0)
        {
            return x >= INT_MIN - y;
        }
        else
        {
            return y >= INT_MIN - x;
        }
    }

    return y <= INT_MAX - x;
}

bool SignedSignedSub(int x, int y)
{
    if (x <= -1)
    {
        return y <= (x + INT_MAX) + 1;
    }

    return x - INT_MAX <= y;
}

bool SignedSignedDiv(int x, int y)
{
    if (y == 0)
    {
        return false;
    }

    if (x == INT_MIN && y == -1)
    {
        static_assert(INT_MAX == -(INT_MIN + 1), "consideration failed");
        return false;
    }

    return true;
}

bool SignedSignedMulti(int x, int y)
{
    if (x == 1 || x == 0)
    {
        return true;
    }
    else if (x == -1)
    {
        static_assert(INT_MAX == -(INT_MIN + 1), "consideration failed");
        return y >= -INT_MAX;
    }
    else if (x >= 2)
    {
        return y >= INT_MIN / x && y <= INT_MAX / x;
    }
    else if (x <= -2)
    {
        return y >= INT_MAX / x && y <= INT_MIN / x;
    }

    return false;
}

bool UnsignedUnsignedSum(unsigned int x, unsigned int y)
{
    return y <= UINT_MAX  - x;
}

bool UnsignedUnsignedSub(unsigned int x, unsigned int y)
{
    return y <= x;
}

bool UnsignedUnsignedMulti(unsigned int x, unsigned int y)
{
    if (x == 0 || x == 1)
    {
        return true;
    }

    return y <= UINT_MAX / x;
}

bool UnsignedUnsignedDiv(unsigned int x, unsigned int y)
{
    if (y == 0)
    {
        return false;
    }

    return  y >= x / UINT_MAX;
}

//or just
bool UnsignedUnsignedDiv(unsigned int x, unsigned int y)
{
    return y != 0;    
}

```

See [Stopwatch.htm](Stopwatch.md)

```cpp

#include "stdafx.h"
#include <safeint.h>
#include <iostream>
#include "Stopwatch.h"


bool Check0(char i, char j)
{
    msl::utilities::SafeInt<char> si(i);
    msl::utilities::SafeInt<char> sj(j);

    try
    {
        si* si + sj* sj;
    }
    catch (...)
    {
        return false;
    }

    return true;
}

bool Check(char i, char j)
{
    char r;
    return
        msl::utilities::SafeMultiply<char, char>(i, i, r) &&
        msl::utilities::SafeMultiply<char, char>(j, j, r) &&
        msl::utilities::SafeAdd<char, char>(i * i, j * j, r);
}

bool MyCheck(char i, char j)
{
    return (i >= -11 && i <= 11 &&
            j >= -11 && j <= 11 &&
            j* j <= CHAR_MAX - i * i);
}

bool Check3(char i, char j)
{    
    return
      SignedSignedMulti(i, i) &&
      SignedSignedMulti(j, j) &&
      SignedSignedSum(i * i, j * j);
}

int _tmain(int argc, _TCHAR* argv[])
{
    Stopwatch s(true);
    int count = 0;

    for (char i = CHAR_MIN;; i++)
    {
        for (char j = CHAR_MIN; ; j++)
        {
            if (!MyCheck(i, j))
            {
                count++;
            }

            if (j == CHAR_MAX)
            {
                break;
            }
        }

        if (i == CHAR_MAX)
        {
            break;
        }
    }

    s.Stop();
    std::cout << "ticks " << s.GetElapsedTicks() << ", " << s.GetElapsedMilliseconds() << " ms " << count;
    return 0;
}


```


Common results:

```

MyCheck : 
ticks 543, 0 ms 65135

Check:
ticks 798, 0 ms 65135

Check0:
ticks 1403857, 551 ms 65135

Check3 (char version)
ticks 7697, 3 ms 65135
```

##See also

SafeInt, 
http://msdn.microsoft.com/en-us/library/dd575188.aspx



