##Stopwatch class (QueryPerformanceCounter)

The Stopwacth class is a useful class to perform time checking using a high resolution timer. 
(This implementation is for MS Windows only) 

See also:
[Stopwatch clock_t](Stopwatch2.md)


```cpp

//
// Copyright (C) 2007, Thiago Adams
//
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.
//

#include <windows.h>
#include <cassert>
#include <ostream>

class Stopwatch
{
    LARGE_INTEGER m_StartCount;
    LARGE_INTEGER m_StopCount;

    static void Check(BOOL b)
    {
        if (!b) throw std::runtime_error("Stopwatch runtime error");
    }

public:

    Stopwatch()
    {
        Reset();
    }

    Stopwatch(bool start)
    {
        Reset();
        if (start)
           Start();
    }

    static LONGLONG GetFrequency()
    {
        static LARGE_INTEGER ticksPerSecond = {0, 0};
        if (ticksPerSecond.QuadPart == 0)
            Check(QueryPerformanceFrequency(&ticksPerSecond));
        return ticksPerSecond.QuadPart;
    }

    void Reset()
    {
        m_StopCount.QuadPart = 0;
        m_StartCount.QuadPart = 0;

        assert(!IsRunning());
        assert(GetElapsedTicks() == 0);
    }

    void Start()
    {
        if (IsRunning())
            return;

        const bool resume = (m_StartCount.QuadPart != 0);
        if (resume)
            m_StopCount.QuadPart = 0;
        else
            Check(QueryPerformanceCounter(&m_StartCount));

        assert(IsRunning());
    }

    void Stop()
    {
        if (!IsRunning())
            return;
        Check(QueryPerformanceCounter(&m_StopCount));

        assert(!IsRunning());
    }

    LONGLONG GetElapsedTicks() const
    {
        if (!IsRunning())
            return (m_StopCount.QuadPart - m_StartCount.QuadPart);

        LARGE_INTEGER performanceCount;
        Check(QueryPerformanceCounter(&performanceCount));
        return (performanceCount.QuadPart - m_StartCount.QuadPart);
    }

    LONGLONG GetElapsedMilliseconds() const
    {
        return GetElapsedTicks() / (GetFrequency() / 1000);
    }

    bool IsRunning() const
    {
        return m_StartCount.QuadPart != 0 && m_StopCount.QuadPart == 0;
    }
};
```

Bonus function
```cpp
template<class _Elem, class _Tr>
std::basic_ostream<_Elem, _Tr> &
operator << (std::basic_ostream<_Elem, _Tr> & stream,
             const Stopwatch & stopwatch)
{
    stream << stopwatch.GetElapsedMilliseconds();
    if (stopwatch.IsRunning())
        stream << " ms (running)";
    else
        stream << " ms (stoped)";
    return stream;
}
```

