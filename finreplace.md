##Find-Replace for standard strings

I always need this function!
It is self-explanation.

```cpp
inline void find_replace(std::string& in_this_string,
                         const std::string& find,
                         const std::string& replace)
{
    std::string::size_type pos = 0;
    while( std::string::npos != (pos = in_this_string.find(find, pos)) )
    {
        in_this_string.replace(pos, find.length(), replace);
        pos += replace.length();
    }
}

inline void find_replace(std::wstring& in_this_string,
                         const std::wstring& find,
                         const std::wstring& replace)
{
    std::wstring::size_type pos = 0;
    while( std::wstring::npos != (pos = in_this_string.find(find, pos)) )
    {
        in_this_string.replace(pos, find.length(), replace);
        pos += replace.length();
    }
}
```

See also cmpnocase
