
With C++ 11 constexpr is possible create parsers in compile time.


The first sample is :

```
Color color("#FF00FF");

static_assert(Color("#FF00FF").r = 255, "");
```
In this sample the color will be initiazed using the values parsed from the string in compile time.


```cpp

constexpr int HEXVAL(char c)
{
    return ((c >= '0' && c < '9') ? c - '0' : 10 + c - 'A');
}

constexpr int getRFromHexColor(const char* psz)
{
    return HEXVAL(psz[1]) * 16 + HEXVAL(psz[2]);
}

constexpr int getGFromHexColor(const char* psz)
{
    return HEXVAL(psz[3]) * 16 + HEXVAL(psz[4]);
}

constexpr int getBFromHexColor(const char* psz)
{
    return HEXVAL(psz[5]) * 16 + HEXVAL(psz[6]);
}

struct Color
{
    int r;
    int g;
    int b;

    constexpr Color(int rr, int gg, int bb) : r(rr), g(gg), b(bb)
    {
    }

    constexpr Color(const char* psz) :
        r(getRFromHexColor(psz)),
        g(getGFromHexColor(psz)),
        b(getBFromHexColor(psz))
    {
    }
};

int main(void)
{
    static_assert(Color("#FFC0C0").r == 255, "");
    
}
```

But I also want to initialize colors using the folowing syntax;

```cpp

Color color("#FF00FF");
or
Color color("rgb(255,0,0)");
```

For this task I created a function to extract each value. GetR, GetG, GetB

The regular expression to parse the first GetR is this:
                                            
```
token TK_HEX1 = '#' ('0'..'9' | 'A'..'F') ('0'..'9' | 'A'..'F');   
token TK_RGB1 = "rgb(" " "* ('0'..'9') ('0'..'9')? ('0'..'9')?;
```

GetG
```
token TK_HEX2 = '#' ('0'..'9' | 'A'..'F') ('0'..'9' | 'A'..'F') ('0'..'9' | 'A'..'F') ('0'..'9' | 'A'..'F');
token TK_RGB2 = "rgb(" " "* ('0'..'9') ('0'..'9')? ('0'..'9')? " "* "," " "* ('0'..'9') ('0'..'9')? ('0'..'9')?;
```

GetB
```
token TK_HEX3 = '#' ('0'..'9' | 'A'..'F') ('0'..'9' | 'A'..'F') ('0'..'9' | 'A'..'F') ('0'..'9' | 'A'..'F') ('0'..'9' | 'A'..'F') ('0'..'9' | 'A'..'F');
token TK_RGB3 = "rgb(" " "* ('0'..'9') ('0'..'9')? ('0'..'9')? " "* "," " "* ('0'..'9') ('0'..'9')? ('0'..'9')? " "* "," " "* ('0'..'9') ('0'..'9')? ('0'..'9')?;

```
```
Where:
 * Means one or more 
 | Means or
 ? Means optional
 '0'..'9' Means '0' or '1' ..  or '9'
```

Running a program called tkgen [[http://www.thradams.com/codeblog/tkgen.htm]] i generated the DFA for this regular expression.

Then I changed the DFA table to recursive functions calls to allow it to be used in const expressions.

```cpp
constexpr int DECVAL(char c)
{
    return c - '0';
}
constexpr int HEXVAL(char c)
{
    return ((c >= '0' && c < '9') ? c - '0' : 10 + c - 'A');
}

constexpr int State10(const char* p, int val)
{
    return (*p >= '0' && *p <= '9') ? val * 10 + DECVAL(*p) : val;
}

constexpr int State9(const char* p, int val)
{
    return (*p >= '0' && *p <= '9') ? State10(p + 1, val * 10 + DECVAL(*p)) : val;
}

constexpr int State8(const char* p)
{
    return (*p == ' ') ? State8(p + 1) : (*p >= '0' && *p <= '9') ? State9(p + 1, DECVAL(*p)) : throw "error";
}

constexpr int State6(const char* p)
{
    return (*p == '(') ? State8(p + 1) : throw "error";
}

constexpr int State4(const char* p)
{
    return (*p == 'b') ? State6(p + 1) : throw "error";
}

constexpr int State3(const char* p, int val)
{
    return ((*p >= '0' && *p <= '9') || (*p >= 'A' && *p <= 'F')) ? val * 16 + HEXVAL(*p) : throw "error";
}

constexpr int State2(const char* p)
{
    return (*p == 'g') ? State4(p + 1) : throw "error";
}

constexpr int State1(const char* p)
{
    return ((*p >= '0' && *p <= '9') || (*p >= 'A' && *p <= 'F')) ? State3(p + 1, HEXVAL(*p)) : throw "error";
}

constexpr int GetR(const char* p)
{
    return (*p == '#') ? State1(p + 1) : (*p == 'r') ? State2(p + 1) : throw "error";
}

struct Color
{
    int r;
    int g;
    int b;

    constexpr Color(int rr, int gg, int bb) : r(rr), g(gg), b(bb)
    {
    }

    constexpr Color(const char* psz) :
        r(GetR(psz)),
        g(0),
        b(0)
    {
    }
};



int main(void)
{
    static_assert(Color("#FFC0C0").r == 255, "");
    static_assert(Color("rgb(255, 1, 2)").r == 255, "");
    static_assert(Color("rgb(1, 1, 2)").r == 1, "");
    static_assert(Color("rgb(12, 1, 2)").r == 12, "");
    static_assert(Color("rgb(123, 1, 2)").r == 123, "");
    
}

```

### References:

http://akrzemi1.wordpress.com/2011/05/20/parsing-strings-at-compile-time-part-ii/

Note:

To compile this sample, I got mingw 4.7 from this project.

http://code.google.com/p/mingw-builds/

----

##Complete code

Some states can be shared (I didn't make it yet)

```cpp

constexpr int DECVAL(char c)
{
    return c - '0';
}
constexpr int HEXVAL(char c)
{
    return ((c >= '0' && c < '9') ? c - '0' : 10 + c - 'A');
}

constexpr int RState10(const char* p, int val)
{
    return (*p >= '0' && *p <= '9') ? val * 10 + DECVAL(*p) : val;
}

constexpr int RState9(const char* p, int val)
{
    return (*p >= '0' && *p <= '9') ? RState10(p + 1, val * 10 + DECVAL(*p)) : val;
}

constexpr int RState8(const char* p)
{
    return (*p == ' ') ? RState8(p + 1) : (*p >= '0' && *p <= '9') ? RState9(p + 1, DECVAL(*p)) : throw "error";
}

constexpr int RState6(const char* p)
{
    return (*p == '(') ? RState8(p + 1) : throw "error";
}

constexpr int RState4(const char* p)
{
    return (*p == 'b') ? RState6(p + 1) : throw "error";
}

constexpr int RState3(const char* p, int val)
{
    return ((*p >= '0' && *p <= '9') || (*p >= 'A' && *p <= 'F')) ? val * 16 + HEXVAL(*p) : throw "error";
}

constexpr int RState2(const char* p)
{
    return (*p == 'g') ? RState4(p + 1) : throw "error";
}

constexpr int RState1(const char* p)
{
    return ((*p >= '0' && *p <= '9') || (*p >= 'A' && *p <= 'F')) ? RState3(p + 1, HEXVAL(*p)) : throw "error";
}

constexpr int GetR(const char* p)
{
    return (*p == '#') ? RState1(p + 1) : (*p == 'r') ? RState2(p + 1) : throw "error";
}

constexpr int GState12(const char* p);
constexpr int GState13(const char* p);

constexpr int GState16(const char* p, int val)
{
    //TK_RGB2
    return (*p >= '0' && *p <= '9') ? val * 10 + DECVAL(*p) : val;
}

constexpr int GState15(const char* p, int val)
{
    return (*p >= '0' && *p <= '9') ? GState16(p + 1, val * 10 + DECVAL(*p)) : val;
}

constexpr int GState14(const char* p)
{
    return (*p == ' ') ? GState12(p + 1) : (*p == ',')  ? GState13(p + 1) : (*p >= '0' && *p <= '9') ? GState12(p + 1) : throw "error";
}

constexpr int GState13(const char* p)
{
    return (*p == ' ') ? GState13(p + 1) : (*p >= '0' && *p <= '9') ? GState15(p + 1, DECVAL(*p)) : throw "error";
}

constexpr int GState12(const char* p)
{
    return (*p == ' ') ? GState12(p + 1) : (*p == ',') ? GState13(p + 1) : throw "error";
}

constexpr int GState10(const char* p)
{
    return (*p == ' ') ? GState12(p + 1) : (*p == ',') ? GState13(p + 1) : (*p >= '0' && *p <= '9') ? GState14(p + 1) : throw "error";
}

constexpr int GState8(const char* p)
{
    return (*p == ' ') ? GState8(p + 1) : (*p >= '0' && *p <= '9') ? GState10(p + 1) : throw "error";
}

constexpr int GState7(const char* p, int val)
{
    return ((*p >= '0' && *p <= '9') || (*p >= 'A' && *p <= 'F')) ? val * 16 + HEXVAL(*p) : throw "error";
}

constexpr int GState6(const char* p)
{
    return (*p == '(') ? GState8(p + 1) : throw "error";
}

constexpr int GState5(const char* p)
{
    return ((*p >= '0' && *p <= '9') || (*p >= 'A' && *p <= 'F')) ? GState7(p + 1, HEXVAL(*p)) : throw "error";
}

constexpr int GState4(const char* p)
{
    return (*p == 'b') ? GState6(p + 1) : throw "error";
}

constexpr int GState3(const char* p)
{
    return ((*p >= '0' && *p <= '9') || (*p >= 'A' && *p <= 'F')) ? GState5(p + 1) : throw "error";
}

constexpr int GState2(const char* p)
{
    return (*p == 'g') ? GState4(p + 1) : throw "error";
}

constexpr int GState1(const char* p)
{
    return ((*p >= '0' && *p <= '9') || (*p >= 'A' && *p <= 'F')) ? GState3(p + 1) : throw "error";
}

constexpr int GetG(const char* p)
{
    return (*p == '#') ? GState1(p + 1) : (*p == 'r') ? GState2(p + 1) :  throw "error";
}

constexpr int BState22(const char* p, int val)
{
    //TK_RGB3
    return (*p >= '0' && *p <= '9') ? val * 10 + DECVAL(*p) : val;
}

constexpr int BState21(const char* p, int val)
{
    //TK_RGB3
    return (*p >= '0' && *p <= '9') ? BState22(p + 1, val * 10 + DECVAL(*p)) : val;
}

constexpr int BState18(const char* p);
constexpr int BState19(const char* p);

constexpr int BState20(const char* p)
{
    return (*p == ' ') ? BState18(p + 1) : (*p == ',') ? BState19(p + 1) : (*p >= '0' && *p <= '9') ? BState18(p + 1) : throw "error";
}

constexpr int BState19(const char* p)
{
    return (*p == ' ') ? BState19(p + 1) : (*p >= '0' && *p <= '9') ? BState21(p + 1, DECVAL(*p)) : throw "error";
}

constexpr int BState18(const char* p)
{
    return (*p == ' ') ? BState18(p + 1) : (*p == ',') ? BState19(p + 1) : throw "error";
}

constexpr int BState16(const char* p)
{
    return (*p == ' ') ? BState18(p + 1) : (*p == ',') ? BState19(p + 1) : (*p >= '0' && *p <= '9') ? BState20(p + 1) : throw "error";
}

constexpr int BState12(const char* p);
constexpr int BState13(const char* p);

constexpr int BState14(const char* p)
{
    return (*p == ' ') ? BState12(p + 1) : (*p == ',') ? BState13(p + 1) : (*p >= '0' && *p <= '9') ? BState12(p + 1) : throw "error";
}

constexpr int BState13(const char* p)
{
    return (*p == ' ') ? BState13(p + 1) : (*p >= '0' && *p <= '9') ? BState16(p + 1) : throw "error";
}

constexpr int BState12(const char* p)
{
    return (*p == ' ') ? BState12(p + 1) : (*p == ',') ? BState13(p + 1) : throw "error";
}

constexpr int BState11(const char* p, int val)
{
    return ((*p >= '0' && *p <= '9') || (*p >= 'A' && *p <= 'F')) ? val * 16 + HEXVAL(*p) : throw "error";
}

constexpr int BState10(const char* p)
{
    return (*p == ' ') ? BState12(p + 1) : (*p == ',') ? BState13(p + 1) : (*p >= '0' && *p <= '9') ? BState14(p + 1) : throw "error";
}

constexpr int BState9(const char* p)
{
    return ((*p >= '0' && *p <= '9') || (*p >= 'A' && *p <= 'F')) ? BState11(p + 1, HEXVAL(*p)) : throw "error";
}

constexpr int BState8(const char* p)
{
    return (*p == ' ') ? BState8(p + 1) : (*p >= '0' && *p <= '9') ? BState10(p + 1) : throw "error";
}

constexpr int BState7(const char* p)
{
    return ((*p >= '0' && *p <= '9') || (*p >= 'A' && *p <= 'F')) ? BState9(p + 1) : throw "error";
}

constexpr int BState6(const char* p)
{
    return (*p == '(') ? BState8(p + 1) : throw "error";
}

constexpr int BState5(const char* p)
{
    return ((*p >= '0' && *p <= '9') || (*p >= 'A' && *p <= 'F')) ?  BState7(p + 1) : throw "error";
}

constexpr int BState4(const char* p)
{
    return (*p == 'b') ? BState6(p + 1) : throw "error";
}

constexpr int BState3(const char* p)
{
    return ((*p >= '0' && *p <= '9') || (*p >= 'A' && *p <= 'F')) ? BState5(p + 1) : throw "error";
}


constexpr int BState2(const char* p)
{
    return (*p == 'g') ? BState4(p + 1) : throw "error";
}


constexpr int BState1(const char* p)
{
    return ((*p >= '0' && *p <= '9') || (*p >= 'A' && *p <= 'F')) ? BState3(p + 1) : throw "error";
}

constexpr int GetB(const char* p)
{
    return (*p == '#') ? BState1(p + 1) : (*p == 'r') ? BState2(p + 1) : throw "error";
}


struct Color
{
    int r;
    int g;
    int b;

    constexpr Color(int rr, int gg, int bb) : r(rr), g(gg), b(bb)
    {
    }

    constexpr Color(const char* psz) :
        r(GetR(psz)),
        g(GetG(psz)),
        b(GetB(psz))
    {
    }
};


int main(void)
{
    static_assert(Color("#FFC0C0").r == 255, "");
    static_assert(Color("rgb(255, 1, 2)").r == 255, "");
    static_assert(Color("rgb(1, 1, 2)").r == 1, "");
    static_assert(Color("rgb(12, 1, 2)").r == 12, "");
    static_assert(Color("rgb(123, 1, 2)").r == 123, "");
    static_assert(Color("#FFFFC0").g == 255, "");
    static_assert(Color("rgb(255, 1, 2)").g == 1, "");
    static_assert(Color("rgb(1, 12, 2)").g == 12, "");
    static_assert(Color("rgb(12, 123, 2)").g == 123, "");
    static_assert(Color("#FFFFFF").b == 255, "");
    static_assert(Color("rgb(255, 1, 2)").b == 2, "");
    static_assert(Color("rgb(1, 12, 12)").b == 12, "");
    static_assert(Color("rgb(12, 123, 123)").b == 123, "");
}

```

