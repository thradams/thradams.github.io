cmp_nocase for std::string

```cpp
int cmp_nocase(const std::string& s, const std::string& s2)
{
  std::string::const_iterator p  = s.begin();
  std::string::const_iterator p2 = s2.begin();

  while (p != s.end() && p2 != s2.end())
  {
    if (toupper(*p) != toupper(*p2))
    {
      return (toupper(*p) < toupper(*p2)) ? -1 : 1;
    }
    ++p;
    ++p2;
  }
  return (s2.size()==s.size()) ? 0 : (s.size() < s2.size()) ? -1 : 1;
}

//From book: The C++ Programming Language
See also find_replace



int cmp_nocase(const std::wstring& s, const std::wstring& s2)
{
  std::wstring::const_iterator p  = s.begin();
  std::wstring::const_iterator p2 = s2.begin();

  while (p != s.end() && p2 != s2.end())
  {
    if (toupper(*p) != toupper(*p2))
    {
      return (toupper(*p) < toupper(*p2)) ? -1 : 1;
    }
    ++p;
    ++p2;
  }
  return (s2.size()==s.size()) ? 0 : (s.size() < s2.size()) ? -1 : 1;
}



template<class CharType>
int cmp_nocase(const std::basic_string<CharType>& s, const std::basic_string<CharType>& s2)
{
  std::basic_string<CharType>::const_iterator p  = s.begin();
  std::basic_string<CharType>::const_iterator p2 = s2.begin();

  while (p != s.end() && p2 != s2.end())
  {
    if (toupper(*p) != toupper(*p2))
    {
      return (toupper(*p) < toupper(*p2)) ? -1 : 1;
    }
    ++p;
    ++p2;
  }
  return (s2.size()==s.size()) ? 0 : (s.size() < s2.size()) ? -1 : 1;
}
```
