Little test: Exceptions runtime overhead


```cpp
const int LoopSteps = 1000000;
inline bool CheckError(int i)
{
  return i % 2 == 0;// 123456789;
}

void PartTwo(int& count)
{  
  if (CheckError(count))
    throw 1;
  count++;
}

void PartOne(int& count)
{
  PartTwo(count);
}

void Start(int& count)
{
  PartOne(count);
}

int PartTwo_(int& count)
{
  if (CheckError(count))
    return 1;
  count++;
  return 0;
}

int PartOne_(int& count)
{
  return PartTwo_(count);
}

int Start_(int& count)
{
  return PartOne_(count);
}


void ExceptionTest()
{
  Stopwatch st(true);
  int count = 0;
  int countError = 0;
  for (int i = 0 ; i < LoopSteps; i++)
  {
    try
    {
      Start(count);
    }
    catch(int) 
    { 
      countError++;
      count++;
    } 
  }
  
  std::cout << "ExceptionTest" << std::endl;
  std::cout << st << std::endl;
  std::cout << "Error count " << countError << std::endl;
  std::cout << std::endl;
}

void ReturnCodeTest()
{
  Stopwatch st(true);
  int count = 0;
  int countError = 0;
  for (int i = 0 ; i < LoopSteps; i++)
  {
    if (Start_(count) > 0)
    {  
      countError++;
      count++;
    }
  }
  
  std::cout << "ReturnCodeTest" << std::endl;
  std::cout << st << std::endl;
  std::cout << "Error count " << countError << std::endl;
  std::cout << std::endl;
}


int main()
{
  ExceptionTest();
  ReturnCodeTest();
}
```

```
Results: (VC++ 2008)
ExceptionTest
22 ms (running)
Error count 0

ReturnCodeTest
23 ms (running)
Error count 0

Changing CheckError to "return i % 2 == 0":

ExceptionTest
5220 ms (running)
Error count 500000

ReturnCodeTest
11 ms (running)
Error count 500000

```
