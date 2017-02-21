##DateTime class for windows(FILETIME/SYSTEMTIME)

Sometimes conversion between FILETIME and SYSTEMTIME is quite repetitive in a source code. 

This class helps to work with this kind of situation being compatible with existing APIs that are using SYSTEMTIME and/or FILETIME data. 

```cpp

// Copyright (C) 2009, Thiago Adams (thiago.adams@gmail.com)
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.

class DateTimeException : public std::exception
{
public:
    DateTimeException(const char* s = "invalid date") : std::exception(s) {}
};

//TODO
//class DateTimeSpan{};

//The FILETIME structure is a 64-bit value representing the
//number of 100-nanosecond intervals since January 1, 1601.

class DateTime
{
    FILETIME m_ft;
    SYSTEMTIME m_st;

    static const ULONGLONG MillisecondUnit = 10000;
    static const ULONGLONG SecondUnit = MillisecondUnit * static_cast<ULONGLONG>(1000);
    static const ULONGLONG MinuteUnit = SecondUnit * static_cast<ULONGLONG>(60);
    static const ULONGLONG HourUnit = MinuteUnit * static_cast<ULONGLONG>(60);
    static const ULONGLONG DayUnit = HourUnit * static_cast<ULONGLONG>(24);
    static const ULONGLONG WeekUnit = DayUnit * static_cast<ULONGLONG>(7);

    bool UpdateSystemTime(const FILETIME& ft, SYSTEMTIME& st)
    {
        SYSTEMTIME st2;
        if (!FileTimeToSystemTime(&ft, &st2))
            return false;
        st = st2;
        return true;
    }

    bool UpdateFileTime(FILETIME& ft, const SYSTEMTIME& st)
    {
        FILETIME ft2;
        if (!SystemTimeToFileTime(&st, &ft2))
            return false;
        ft = ft2;
        return true;
    }

public:

    DateTime()
    {
        m_ft.dwHighDateTime = 0;
        m_ft.dwLowDateTime = 0;
        if (!UpdateSystemTime(m_ft, m_st))
            throw std::exception("");
    }

    DateTime(const DateTime& other) : m_ft(other.m_ft), m_st(other.m_st)
    {
    }

    DateTime(const FILETIME& ft) : m_ft(ft)
    {
        if (!UpdateSystemTime(m_ft, m_st))
            throw DateTimeException();
    }

    DateTime(unsigned long long ticks)
    {
        m_ft.dwLowDateTime = DWORD(ticks);
        m_ft.dwHighDateTime = DWORD(ticks >> 32);
        if (!UpdateSystemTime(m_ft, m_st))
            throw DateTimeException();
    }

    DateTime(const SYSTEMTIME& st) : m_st(st)
    {
        if (!UpdateFileTime(m_ft, m_st))
            throw DateTimeException();
    }

    DateTime(int year,
             int month,
             int day,
             int hour = 0,
             int minute = 0,
             int second = 0,
             int milliseconds = 0)
    {
        m_st.wYear = year;
        m_st.wMonth = month;
        m_st.wDay = day;
        m_st.wHour = hour;
        m_st.wMinute = minute;
        m_st.wSecond = second;
        m_st.wMilliseconds = milliseconds;
        if (!UpdateFileTime(m_ft, m_st))
            throw DateTimeException();
    }

    void AddDays(int days)
    {
        operator = (DateTime(GetTicks() + days * DayUnit));
    }

    void AddHour(int hours)
    {
        operator = (DateTime(GetTicks() + hours * HourUnit));
    }

    void AddMinutes(int minutes)
    {
        operator = (DateTime(GetTicks() + minutes * MinuteUnit));
    }

    void AddSeconds(int seconds)
    {
        operator = (DateTime(GetTicks() + seconds * SecondUnit));
    }

    void AddMilliseconds(int milliseconds)
    {
        operator = (DateTime(GetTicks() + milliseconds * MillisecondUnit));
    }

    void AddTicks(int ticks)
    {
        operator = (DateTime(GetTicks() + ticks));
    }

    DateTime& operator = (const DateTime& other)
    {
        m_ft = other.m_ft;
        m_st = other.m_st;
        return *this;
    }

    unsigned long long GetTicks() const
    {
        return ((ULONGLONG(m_ft.dwHighDateTime) << 32) | m_ft.dwLowDateTime);
    }

    bool operator == (const DateTime& other) const
    {
        return GetTicks() == other.GetTicks();
    }

    bool operator != (const DateTime& other) const
    {
        return !operator == (other);
    }

    bool operator > (const DateTime& other) const
    {
        return GetTicks() > other.GetTicks();
    }

    bool operator < (const DateTime& other) const
    {
        return GetTicks() < other.GetTicks();
    }

    int GetYear() const
    {
        return m_st.wYear;
    }
    int GetMonth() const
    {
        return m_st.wMonth;
    }
    int GetDay() const
    {
        return m_st.wDay;
    }
    int GetHour() const
    {
        return m_st.wHour;
    }
    int GetMinute() const
    {
        return m_st.wMinute;
    }
    int GetSecond() const
    {
        return m_st.wSecond;
    }
    int GetMillisecond() const
    {
        return m_st.wMilliseconds;
    }

    const FILETIME& GetFileTime() const
    {
        return m_ft;
    }

    const SYSTEMTIME& GetSystemTime() const
    {
        return m_st;
    }
};

DateTime GetCurrentDateTime()
{
    FILETIME ft;
    GetSystemTimeAsFileTime(&ft);
    return DateTime(ft);
}

```

