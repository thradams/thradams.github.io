
This sample converts in compile time a string into a constant.

I have the strings "right", "center", "end" and "start".
Each string correspond to a const value in enum.


C++ 11

```cpp
enum TextAlign 
{ 
    TextAlignStart, 
    TextAlignEnd, 
    TextAlignLeft, 
    TextAlignRight, 
    TextAlignCenter
}; 

constexpr TextAlign CaseCenter(const char* p) 
{ 
    return (p[0] == L'e' && p[1] == L'n' &&  p[2] == L't' && p[3] == L'e' && p[4] == L'r') ? TextAlignCenter : throw "error"; 
} 

constexpr TextAlign CaseEnd(const char* p) 
{ 
    return (p[0] == L'n' && p[1] == L'd') ? TextAlignEnd : throw "error"; 
} 

constexpr TextAlign CaseLeft(const char* p) 
{ 
    return (p[0] == L'e' && p[1] == L'f' &&  p[2] == L't') ? TextAlignLeft : throw "error"; 
} 


constexpr TextAlign CaseRight(const char* p) 
{ 
    return (p[0] == L'i' && p[1] == L'g' &&  p[2] == L'h' && p[3] == L't') ? TextAlignRight : throw "error"; 
} 

constexpr TextAlign CaseStart(const char* p) 
{ 
    return (p[0] == L't' && p[1] == L'a' &&  p[2] == L'r' && p[3] == L't') 
                    ? TextAlignStart : throw "error"; 
} 

constexpr TextAlign TextAlign(const char* p) 
{ 
    return (*p == L'c') ? CaseCenter(p + 1) : (*p == L'e') ? CaseEnd(p + 1) : (*p == L'l') 
                        ? CaseLeft(p + 1) : (*p == L'r') ? CaseRight(p + 1) : (*p == L's') 
                        ? CaseStart(p + 1) : throw "error"; 
}

int main() 
{ 
    static_assert(TextAlign("right") == TextAlignRight, "right ops"); 
    static_assert(TextAlign("center") == TextAlignCenter, "center ops"); 
    static_assert(TextAlign("end") == TextAlignEnd, "end ops"); 
    static_assert(TextAlign("start") == TextAlignStart, "start ops"); 
    const char* p = "center"; 
    std::cout << "Test = " << Test(p); 
} 

```


C++ 03

```cpp

#include <cstring>
#include <iostream>

enum TextAlign
{
    TextAlignStart,
    TextAlignEnd,
    TextAlignLeft,
    TextAlignRight,
    TextAlignCenter
};


#define CaseCenter(p0, p1, p2, p3, p4) ((p0 == L'e' && p1 == L'n' &&  p2 == L't' && p3 == L'e' && p4 == L'r') ? TextAlignCenter : -1)
#define CaseEnd(p0, p1, p2, p3, p4) ((p0 == L'n' && p1 == L'd') ? TextAlignEnd : -1)
#define CaseLeft(p0, p1, p2, p3, p4) ((p0 == L'e' && p1 == L'f' &&  p2 == L't') ? TextAlignLeft : -1)
#define CaseRight(p0, p1, p2, p3, p4) ((p0 == L'i' && p1 == L'g' &&  p2 == L'h' && p3 == L't') ? TextAlignRight : -1)
#define CaseStart(p0, p1, p2, p3, p4) ((p0 == L't' && p1 == L'a' &&  p2 == L'r' && p3 == L't') ? TextAlignStart : -1)
#define TextAlign(p0, p1, p2, p3, p4, p5)  ((p0 == L'c') ? CaseCenter(p1, p2, p3, p4, p5) : (p0 == L'e') ? CaseEnd(p1, p2, p3, p4, p5) : (p0 == L'l') ? CaseLeft(p1, p2, p3, p4, p5) : (p0 == L'r') ? CaseRight(p1, p2, p3, p4, p5) : (p0 == L's') ? CaseStart(p1, p2, p3, p4, p5) : -1)


int Test(const char* p) 
{ 
    switch (TextAlign(p[0], p[1], p[2], p[3], p[4], p[5])) 
    { 
    case TextAlign('r', 'i', 'g', 'h', 't', '\0'):  return 1; 
    case TextAlign('c', 'e', 'n', 't', 'e', 'r'): return 2; 
    case TextAlign('e', 'n', 'd', '\0', '\0', '\0'):    return 3; 
    case TextAlign('s', 't', 'a', 'r', 't', '\0'):  return 4; 
    } 
    return 0; 
} 

int main()
{
    static_assert(TextAlign('s', 't', 'a', 'r', 't', '\0') == TextAlignStart, "");
    static_assert(TextAlign('c', 'e', 'n', 't', 'e', 'r') == TextAlignCenter, "");
    static_assert(TextAlign('l', 'e', 'f', 't', '\0', '\0') == TextAlignLeft, "");
    static_assert(TextAlign('e', 'n', 'd', '\0', '\0', '\0') == TextAlignEnd, "");
    static_assert(TextAlign('r', 'i', 'g', 'h', 't', '\0') == TextAlignRight, "");

    std::cout << Test("center");
}
```

