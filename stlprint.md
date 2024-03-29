

Functions to print the equivalent uniform initialization expression of a value.

Implemented so far for these types:

* vector
* set
* map
* basic_string
* integral types
* bool


```cpp
#include <vector>
#include <iostream>
#include <string>
#include <set>
#include <map>
#include <type_traits>


template<class CharType, class CharTraits, class YourType>
void PrintUniformInitialization(std::basic_ostream<CharType, CharTraits> & os, const YourType& v)
{
    static_assert(false, "especialize this function for your type!");
}

template<class CharType, class CharTraits, class T>
typename std::enable_if<std::is_integral<T>::value, void>::type
PrintUniformInitialization(std::basic_ostream<CharType, CharTraits> & os, const T& v)
{
    os << v;
}

char PrintL(char){  return '\0';}
char PrintL(wchar_t) { return 'L'; }

template<class CharType, class CharTraits>
void PrintUniformInitialization(std::basic_ostream<char, CharTraits> & os, const std::basic_string<CharType>& v)
{
    os << PrintL((CharType) 0) << '"';

    for (size_t i = 0; i < v.size(); i++)
    {
        os << (char) v[i]; //TODO ranges
    }

    os << '"';
}

template<class CharType, class CharTraits>
void PrintUniformInitialization(std::basic_ostream<wchar_t, CharTraits> & os, const std::basic_string<CharType>& v)
{
    os << PrintL((CharType) 0) << '"';

    for (size_t i = 0; i < v.size(); i++)
    {
        os << (wchar_t) v[i]; //TODO ranges
    }

    os << L'"';
}

template<class CharTraits>
void PrintUniformInitialization(std::basic_ostream<char, CharTraits> & os, bool v)
{
    os << (v ? "true" : "false");
}

template<class CharTraits>
void PrintUniformInitialization(std::basic_ostream<wchar_t, CharTraits> & os, bool v)
{
    os << (v ? L"true" : L"false");
}

template<class CharType, class CharTraits, class Iterator>
void PrintSequence(std::basic_ostream<CharType, CharTraits> & os,
                   Iterator beginIt,
                   Iterator endIt)
{
    typedef typename Iterator::value_type T;
    os << (CharType)'{';
    auto it = beginIt;

    if (it != endIt)
    {
        PrintUniformInitialization(os, *it);
        ++it;
    }

    for (; it != endIt; it++)
    {
        os << (CharType) ',' << (CharType) ' ';
        PrintUniformInitialization(os, *it);
    }

    os << (CharType)'}';
}

template<class CharType, class CharTraits, class T, class TAllocator>
void PrintUniformInitialization(std::basic_ostream<CharType, CharTraits> & os,
                                const std::vector<T, TAllocator>& v)
{
    PrintSequence(os, v.cbegin(), v.cend());
}


template<class CharType, class CharTraits, class T, class TComp, class TAllocator>
void PrintUniformInitialization(std::basic_ostream<CharType, CharTraits> & os,
                                const std::set<T, TComp, TAllocator>& v)
{
    PrintSequence(os, v.cbegin(), v.cend());
}

template < class CharType,
         class CharTraits,
         class _Kty,
         class _Ty,
         class _Pr,
         class _Alloc >
void PrintUniformInitialization(std::basic_ostream<CharType, CharTraits> & os,
                                const std::map<_Kty, _Ty, _Pr, _Alloc>& m)
{
    os << (CharType)'{';
    auto it = m.cbegin();

    if (it != m.cend())
    {
        os << (CharType)'{';
        PrintUniformInitialization(os, it->first);
        os << (CharType)',' << (CharType)' ';
        PrintUniformInitialization(os, it->second);
        os << (CharType)'}';
        ++it;
    }

    for (; it != m.cend(); it++)
    {
        os << (CharType)',' << (CharType)' ';
        os << (CharType)'{';
        PrintUniformInitialization(os, it->first);
        os << (CharType)',' << (CharType)' ';
        PrintUniformInitialization(os, it->second);
        os << (CharType)'}';
    }

    os << (CharType)'}';
}

//Printing the type name

template<class T>
void PrintTypeName(std::ostream& , T*)
{
  static_assert(false, "overload for your type"); 
}

void PrintTypeName(std::ostream& os, std::wstring*) {  os << "std::wstring";}
void PrintTypeName(std::ostream& os, std::string*) {  os << "std::string";}
void PrintTypeName(std::ostream& os, int*) { os << "int"; }
void PrintTypeName(std::ostream& os, double*) {  os << "double"; }
void PrintTypeName(std::ostream& os, bool*) {  os << "bool"; }
void PrintTypeName(std::ostream& os, char*) {  os << "char"; }

template<class T>
void PrintTypeName(std::ostream& os, std::vector<T>*) 
{
  os << "std::vector<";
  PrintTypeName(os, (T*)nullptr);
  os << ">"; 
}

template<class T>
void PrintTypeName(std::ostream& os, std::set<T>*) 
{
  os << "std::set<";
  PrintTypeName(os, (T*)nullptr);
  os << ">"; 
}

template<class K, class T>
void PrintTypeName(std::ostream& os, std::map<T, K>*) 
{
  os << "std::map<";
  PrintTypeName(os, (K*)nullptr);
  os << ", ";
  PrintTypeName(os, (T*)nullptr);
  os << ">"; 
}


```

Sample:

```cpp

struct MyType
{
    std::wstring x;
    bool v;
};

template<class CharType, class CharTraits>
void PrintUniformInitialization(std::basic_ostream<CharType, CharTraits> & os, const MyType& v)
{
    os << (CharType)'{';
    PrintUniformInitialization(os, v.x);
    os << (CharType)',' << (CharType)' ';
    PrintUniformInitialization(os, v.v);
    os << (CharType)'}';
}

void PrintTypeName(std::ostream& os, MyType*) 
{
  os << "MyType"; 
}

template<class CharType, class CharTraits, class T>
void PrintUniformInitializationLn(std::basic_ostream<CharType, CharTraits> & os, const T& v)
{
    PrintTypeName(os, (T*)nullptr);     
    os << std::endl;
    PrintUniformInitialization(os, v);
    os << std::endl;
    os << std::endl;
}

  
int main()
{
    using namespace std;
    vector<MyType> vx;
    MyType x;
    x.v = false;
    vx.push_back(x);
    PrintUniformInitializationLn(cout, vx);
    map<std::wstring, bool> m;
    m[L"a"] = true;
    m[L"b"] = false;
    PrintUniformInitializationLn(cout, m);
    std::vector<std::vector<int>> v;
    v.push_back(std::vector<int>(2));
    v.push_back(std::vector<int>(3));
    PrintUniformInitializationLn(cout, m);
    std::set<std::wstring> st;
    st.insert(L"aa");
    st.insert(L"bb");
    PrintUniformInitializationLn(cout, st);
    std::vector<bool> vb;
    vb.push_back(false);
    vb.push_back(true);
    PrintUniformInitializationLn(cout, vb);
}

```

Output:
```

std::vector<MyType>
{{L"", false}}

std::map<bool, std::wstring>
{{L"a", true}, {L"b", false}}

std::map<bool, std::wstring>
{{L"a", true}, {L"b", false}}

std::set<std::wstring>
{L"aa", L"bb"}

std::vector<bool>
{false, true}

```

