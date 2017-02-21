

Given a unsigned number, the template return the minimum unsigned type that can be used to store the value informed.

```cpp
#include <climits>
#include <iostream>

template<bool cond, typename T1, typename T2>
struct static_if {
    typedef T1 type;
};

template<typename T1, typename T2>
struct static_if<false, T1, T2> {
    typedef T2 type;
}; 

template<unsigned long long umax>
struct make_unsigned_min
{
    typedef typename static_if<umax <= UCHAR_MAX, unsigned char, 
        typename static_if<umax <= USHRT_MAX, unsigned short,
        typename static_if<umax <= UINT_MAX, unsigned int, 
        unsigned long long>::type >::type>::type type;

};

int _tmain(int argc, _TCHAR* argv[])
{

    std::cout << typeid(make_unsigned_min<10>::type).name() << std::endl;
    std::cout << typeid(make_unsigned_min<255>::type).name()<< std::endl;
    std::cout << typeid(make_unsigned_min<256>::type).name()<< std::endl;
    std::cout << typeid(make_unsigned_min<4294967295>::type).name()<< std::endl;
    std::cout << typeid(make_unsigned_min<4294967296>::type).name()<< std::endl;

    return 0;
}

```


Output:

```
unsigned char
unsigned char
unsigned short
unsigned int
unsigned __int64
```


