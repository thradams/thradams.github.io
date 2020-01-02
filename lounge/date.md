```c

#include "pch.h"
#include <time.h>
#include <stdio.h>
#include <assert.h>
#include <stdbool.h>
#include <assert.h>
#include <limits.h>

//Ported from C++ version:
//http://howardhinnant.github.io/date_algorithms.html


bool is_leap(int y)
{
  return  y % 4 == 0 && (y % 100 != 0 || y % 400 == 0);
}

//number of days since civil 1970-01-01.  Negative values indicate
//days prior to 1970-01-01.
typedef int date_t;

// Returns number of days since civil 1970-01-01.  Negative values indicate
//    days prior to 1970-01-01.
// Preconditions:  y-m-d represents a date in the civil (Gregorian) calendar
//                 m is in [1, 12]
//                 d is in [1, last_day_of_month(y, m)]
//                 y is "approximately" in
//                   [numeric_limits<Int>::min()/366, numeric_limits<Int>::max()/366]
//                 Exact range of validity is:
//                 [civil_from_days(numeric_limits<Int>::min()),
//                  civil_from_days(numeric_limits<Int>::max()-719468)]


int days_from_civil(int y, unsigned m, unsigned d)
{
  y -= m <= 2;
  const int era = (y >= 0 ? y : y - 399) / 400;
  const unsigned yoe = (unsigned)(y - era * 400);      // [0, 399]
  const unsigned doy = (153 * (m + (m > 2 ? -3 : 9)) + 2) / 5 + d - 1;  // [0, 365]
  const unsigned doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;         // [0, 146096]
  return era * 146097 + (int)(doe) - 719468;
}

// Returns year/month/day triple in civil calendar
// Preconditions:  z is number of days since 1970-01-01 and is in the range:
//                   [numeric_limits<Int>::min(), numeric_limits<Int>::max()-719468].


void civil_from_days(int z, int *year, int *month, int *day) 
{
  z += 719468;
  const int era = (z >= 0 ? z : z - 146096) / 146097;
  const unsigned doe = (unsigned)(z - era * 146097);          // [0, 146096]
  const unsigned yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;  // [0, 399]
  const int y = (int)(yoe) + era * 400;
  const unsigned doy = doe - (365 * yoe + yoe / 4 - yoe / 100);                // [0, 365]
  const unsigned mp = (5 * doy + 2) / 153;                                   // [0, 11]
  const unsigned d = doy - (153 * mp + 2) / 5 + 1;                             // [1, 31]
  const unsigned m = mp + (mp < 10 ? 3 : -9);                            // [1, 12]
  
  *year = y + (m <= 2);
  *month = m;
  *day = d;
}

// Preconditions: m is in [1, 12]
// Returns: The number of days in the month m of leap year
// The result is always in the range [29, 31].

unsigned last_day_of_month_leap_year(unsigned m) 
{
  unsigned char a[] = {31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
  return a[m - 1];
}

unsigned last_day_of_month_common_year(unsigned m)
{
  unsigned char a[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
  return a[m - 1];
}

unsigned last_day_of_month(int y, unsigned m)
{
  return m != 2 || !is_leap(y) ? last_day_of_month_common_year(m) : 29u;
}


unsigned weekday_from_days(int z) 
{
  return (unsigned)(z >= -4 ? (z + 4) % 7 : (z + 5) % 7 + 6);
}

time_t date_to_time(date_t d)
{
  return d * (60 * 60 * 24);
}

date_t time_to_date(time_t t)
{
  return t / (60 * 60 * 24);
}

int main()
{
  time_t t = time(NULL);
  int year0, month0, day0;
  civil_from_days(time_to_date(t), &year0, &month0, &day0);


  //1970 - 01 - 01
  int d = 1;
  int m = 1;
  int y = 1970;
  int w = 4;//[0, 6] -> [Sun, Sat]
  for (int z = 0; z < (INT_MAX - 719468); z++)
  {
    if (days_from_civil(y, m, d) != z)
    {
      printf("days_from_civil(%d, %d, %d) != %d\n", y, m, d, z);
    }

    int year, month, day;
    civil_from_days(z, &year, &month, &day);
    if (year != y || month != m || day != d)
    {
      printf("%d  %d != %d || %d != %d || %d == %d\n", z, year, y, month, m, day, d);
    }


    if (weekday_from_days(z) != w)
    {
      printf("weekday_from_days(z) != w\n");
    }

    if (last_day_of_month(y, m) == d)
    {
      d = 1;
      if (m == 12)
      {
        m = 1;
        y++;
      }
      else
      {
        m++;
      }      
    }
    else
    {
      d++;
    }

    if (w == 6)
      w = 0;
    else
      w++;
  }
  printf("ok");
}



```
