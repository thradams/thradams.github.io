## Stopwatch class

Stopwatch class using clock_t.

See also:
[Stopwatch QueryPerformanceCounter](Stopwatch.md)

```cpp
//
// Copyright (C) 2010, Thiago Adams
//
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.
//


#pragma once

#include <ctime>
#include <cassert>

class Stopwatch
{
  clock_t m_StartCount;
  clock_t m_StopCount;

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

    static size_t GetFrequency() //in milliseconds
    {
      //static_assert(CLOCKS_PER_SEC >= 1000);
      return CLOCKS_PER_SEC / 1000;
    }

    void Reset()
    {
        m_StopCount = 0;
        m_StartCount = 0;

        assert(!IsRunning());
        assert(GetElapsedTicks() == 0);
    }

    void Start()
    {
        if (IsRunning())
            return;

        const bool resume = (m_StartCount != 0);
        if (resume)
            m_StopCount = 0;
        else
        {
            m_StartCount = clock();
        }

        assert(IsRunning());
    }

    void Stop()
    {
        if (!IsRunning())
            return;
        
        m_StopCount = clock();

        assert(!IsRunning());
    }

    clock_t GetElapsedTicks() const
    {
        if (IsRunning())
           return (clock() - m_StartCount);
         
        return (m_StopCount - m_StartCount);
    }

    clock_t GetElapsedMilliseconds() const
    {
        return GetElapsedTicks() / GetFrequency();
    }

    bool IsRunning() const
    {
        return m_StartCount != 0 && m_StopCount == 0;
    }
};
```

