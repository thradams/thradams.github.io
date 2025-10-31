

With the C++0x move semantics is possible to create "move only" objects.

Using this idea, I implemented a simple string class that holds a pointer and do not make copies. It can be used in stl containers like map.

This implementation was tested in the Visual Studio Express 2010.


```cpp

#include <map>
#include <iostream>
#include <string>

///////////////////////////////////////////////////////////////////////////////

#include <cstring>
#include <cstdlib>

class String
{
    const char* m_psz;
    String(const String& ); //= delete;
    String & operator = (const String& );

public:

    String()
    {
        m_psz = nullptr;
    }

    explicit String(const char* psz)
    {
        m_psz = _strdup(psz);
    }

    String(String&& s)
    {
        m_psz = s.m_psz;
        s.m_psz = nullptr;
    }

    ~String()
    {
        Clear();
    }

    const char* c_str() const
    {
        return m_psz;
    }

    void Clear()
    {
        free((void*)m_psz);
        m_psz = nullptr;
    }
    
    void Swap(String& s)
    {
        const char* psz = m_psz;
        m_psz = s.m_psz;
        s.m_psz = psz;
    }

    int Compare(const String& s) const
    {
        return strcmp(m_psz, s.m_psz) ;
    }
    
    bool operator < (const String& s) const
    {
        return Compare(s) < 0;
    }

    bool operator > (const String& s) const
    {
        return Compare(s) > 0;
    }

    bool operator == (const String& s) const
    {
        return Compare(s) == 0;
    }
};


int _tmain(int argc, _TCHAR* argv[])
{
    String s("testando");
    String s2(s.c_str());

    std::map<String, int> map;
    map[String("teste")] = 1;
    map[String("teste2")] = 2;

    std::cout << map[String("teste2")] << std::endl;

    std::cout << "sizeof(std::string) = " << sizeof(std::string) << std::endl;
    std::cout << "sizeof(String) = " << sizeof(String) << std::endl;

    int i;
    std::cin >> i;
    return 0;
}
```


###Output:
This is the ouput of VC++ 2010 express
```
2
sizeof(std::string) = 28
sizeof(String) = 4
``` 

