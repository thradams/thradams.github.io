
Given a list of periods (begin-end) this algorithm will join and merge periods that have intersection.


```cpp


#include <vector>
#include <algorithm>
#include <cassert>

using namespace std;


typedef int DateTime;

struct Period
{
  DateTime begin = 0;
  DateTime end = 0;
  bool operator == (const Period& other) const
  {
    return begin == other.begin && end == other.end;
  }
  bool operator < (const Period& other) const
  {
    //only begin is used on purpouse
    return begin < other.begin;
  }
};

// This algorithm build a new version of v 
// adding a new period
// v is always in a final state (no orverlapping)
void AddPeriod(vector<Period>& v, Period period)
{
  if (v.empty())
  {
    v.push_back(period);
  }
  else
  {
    //it points to the period that has begin >= period.begin
    auto it = lower_bound(v.begin(), v.end(), period);
    const int index = it == v.end() ? -1 : it - v.begin();

    if (it == v.end())
    {
      //The added period  is represented as { } 
      // 1 - ... [ { ] }
      // 2 - ... [ { } ] 
      // 3 - ... [  ] { }

      if (period.begin < v.back().end)
      {
        // 1 - ... [ { ] }
        // 2 - ... [ { } ] 

        if (period.end > v.back().end)
        {
          // 1 - ... [ { ] }
          v.back().end = period.end; //ok
        }
        else
        {
          // 2 - ... [ { } ]  or exactly the same
        }
      }
      else
      {
        // 3 - ... [  ] { }
        v.push_back(period); //ok
      }
    }
    else
    {
      if (index > 0 && v[index - 1].end > period.begin)
      {
        //  ..[ { ] [ ] [ ] ...
        //          ^            

        it = v.begin() + (index - 1);

        // it now points to the previous period

        //  ..[ { ] [ ] [ ] ...
        //    ^            
      }
      else
      {
        //  ... [ ] { [ ] [ ] ...
        //            ^          

        //fixing the current period begin
        it->begin = period.begin;
      }

      //finding the last period and remove
      //periods in between

      DateTime last = period.end > it->end ? period.end : it->end;

      auto it2 = it + 1;
      for (; it2 != v.end() && it2->begin <= period.end; it2++)
      {
        last = period.end > it2->end ? period.end : it2->end;
      }

      //fix end
      it->end = last;

      //remove periods in between
      v.erase(it + 1, it2);
    }
  }
}

//This function is used in tests. It builds
//the period given the string representation
//For instance " [ ] " the period is 1 - 3
//             " |   " the period is 1 - 1
static void BuildVectorForTest(vector<Period>& v, const char* s)
{
  DateTime begin = 0;
  int i = 0;
  while (s[i] != 0)
  {
    if (s[i] == '[')
    {
      //start
      begin = i;
    }
    else if (s[i] == ']')
    {
      //end
      AddPeriod(v, { begin, (DateTime)i });
    }
    else if (s[i] == '|')
    {
      //start==end
      AddPeriod(v, { (DateTime)i, (DateTime)i });
    }
    i++;
  }
}

void Test1()
{
  //[ ]
  vector<Period> v;
  AddPeriod(v, { 1, 3 });
  AddPeriod(v, { 2, 6 });
  AddPeriod(v, { 7, 10 });
  AddPeriod(v, { 8, 16 });
  vector<Period> v2 = { { 1, 6 },{ 7, 16 } };
  assert(equal(v.begin(), v.end(), v2.begin()));
}


void Test(const char* periods[], int size)
{
  vector<Period> v;
  for (int i = 0; i < size - 1; i++)
  {
    vector<Period> v2;
    BuildVectorForTest(v2, periods[i]);
    AddPeriod(v, v2.back());
  }

  vector<Period> v2;
  BuildVectorForTest(v2, periods[size - 1]);
  if (v2.size() == v.size())
  {
    assert(equal(v.begin(), v.end(), v2.begin()));
  }
  else
  {
    assert(false);
  }
}


void Test2()
{
  const char* periods[] =
  {
    " | ",
    "   | ",
    " | | " //aswer
  };
  Test(periods, sizeof(periods) / sizeof(periods[0]));
}


void Test3()
{
  const char* periods[] =
  {
    " [ ]",
    "     [ ]",
    " [       ]",
    " [       ]" //aswer
  };
  Test(periods, sizeof(periods) / sizeof(periods[0]));
}

void Test4()
{
  const char* periods[] =
  {
    " [ ]",
    "      |",
    " [ ]  |" //aswer
  };
  Test(periods, sizeof(periods) / sizeof(periods[0]));
}

void Test5()
{
  const char* periods[] =
  {
    " |    ",
    "     |",
    " [   ] ",
    " [   ] " //asnwer
  };
  Test(periods, sizeof(periods) / sizeof(periods[0]));
}
void Test6()
{
  const char* periods[] =
  {
    " [   ]             ",
    "       [   ]       ",
    "             [   ] ",
    "   [           ]   ",
    " [               ]   " //asnwer
  };
  Test(periods, sizeof(periods) / sizeof(periods[0]));
}


int main()
{
  Test6();
  Test5();
  Test4();

  Test1();
  Test2();
  Test3();

  return 0;
}
```

