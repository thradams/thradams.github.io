## Input function like in BASIC

Have you ever written a program in BASIC?

My first computer was one MSX and my first experience with computer languages was using MSX BASIC.

With 3 lines of code was possible to perform input and calculation.

(I run this code using the BlueMSX emulator)
```
10 CLS 
20 INPUT "Please enter a number"; i 
30 PRINT "Your number multiplied by 2 is "; I * 2
```

I was missing this input so I did a similar function in C++. :) 

```cpp

#include <iostream>
#include <string>
#include <sstream>
template<class T>
bool read(T &i)
{
    std::wstring s;
    if (!std::getline(std::wcin, s))
        return false;
    i = T();

    if (s.empty())
    {
        return true;
    }

    std::wstringstream ss(s);
    ss >> i >> std::ws;
    return (ss && ss.eof());
}

bool read(std::wstring &s)
{
    s.clear();
    if (!std::getline(std::wcin, s))
        return false;
    return true;
}

bool read(std::string &s)
{
    s.clear();
    if (!std::getline(std::cin, s))
        return false;
    return true;
}


template<class T>
void input(const char * msg, T& value)
{
    for (;;)
    {
        std::cout << msg << "? ";
        if (read(value))
            return;
        else
            std::cout << "?Redo from start" << std::endl;
    }
}
Sample of use

int main () 
{ 
  using namespace std;
  int i; 
  input("Please enter a number", i); 
  cout << "Your number multiplied by 2 is " << i*2 << std::endl; 
  cout << "Ok" << std::endl; //Getting feedback from computer :)
  cin.get(); 
} 

```

### History
* Updated 28 october 2009

