

See also: [enum.htm](enum.html)

```cpp
enum Font
{
  Bold   = 1 << 0,
  Italic = 1 << 1,
  Underline = 1 << 2,
};

inline Font operator | (Font a, Font b)
{
  typedef std::underlying_type<Font>::type Type;
  return Font(Type(a) | Type(b));
}

inline Font operator~(Font a)
{
  typedef std::underlying_type<Font>::type Type;
  return Font(~Type(a));
}

inline Font operator& (Font a, Font b)
{
  typedef std::underlying_type<Font>::type Type;
  return Font(Type(a) & Type(b));
}

inline Font& operator&=(Font& a, Font b)
{
  a = a & b;
  return a;
}

inline Font& operator|=(Font& a, Font b)
{
  a = a | b;
  return a;
}

inline void Add(Font& e, Font items)
{
  e = e | items;
}

inline void Remove(Font& e, Font items)
{
  e = e & ~items;
}

//Determines whether all bits
//are set in the "e".
inline bool HasAllFlags(Font e, Font items)
{
  typedef std::underlying_type<Font>::type Type;
  return (Type(e) & Type(items)) == Type(items);
}

//Determines whether one or more bit fields
//are set in the "e".
inline bool HasFlag(Font e, Font items)
{
  typedef std::underlying_type<Font>::type Type;
  return (Type(e) & Type(items)) != Type(0);
}
```


Test program:
```cpp

std::string to_string(Font f)
{
  std::string ws;

  if (HasFlag(f, Font::Bold))
    ws += "Bold";


  if (HasFlag(f, Font::Italic))
  {
    if (!ws.empty())
      ws += " | ";

    ws += "Italic";
  }

  if (HasFlag(f, Font::Underline))
  {
    if (!ws.empty())
      ws += " | ";

    ws += "Underline";
  }

  return ws;
}

int main()
{
  Font f = Font::Bold;
  f = f | Font::Italic;
  std::cout << "HasFlag(underline) = " << HasFlag(f, Font::Underline) << std::endl;
  std::cout << "HasFlag(italic) = " << HasFlag(f, Font::Italic) << std::endl;
  std::cout << "HasFlag(italic | bold) = " << HasFlag(f, Font::Italic | Font::Bold) << std::endl;
  std::cout << "HasAllFlags(bold | underline) = " << HasAllFlags(f, Font::Bold | Font::Underline) << std::endl;
  
  std::cout << "Add(underline)" << std::endl;
  Add(f, Font::Underline);
  std::cout << "HasFlag(underline) = " << HasFlag(f, Font::Underline) << std::endl;
  std::cout << "HasAllFlags(bold | underline) = " << HasAllFlags(f, Font::Bold | Font::Underline) << std::endl;

  std::cout << "Remove(underline)" << std::endl;

  Remove(f, Font::Underline);
  std::cout << "HasFlag(underline) = " << HasFlag(f, Font::Underline) << std::endl;

  return 0;
}
```


