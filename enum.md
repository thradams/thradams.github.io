#Enumeration used as a set of bits

One of the most compact ways to represent styles is using bits. Generally programmes use to use integer constants or typedefs for this task. I will show a way that I consider better to express a set of bits. The idea is to add bit operations to an enum type. The main advantage is that using enums and operators we have a clear concept and it avoids type mixture. Using int / longs /defines you can mix everything.

Use:

```cpp

enum FontStyle
{
   FontStyleNormal    = 1 << 0,
   FontStyleBold      = 1 << 1,
   FontStyleItalic    = 1 << 2,
   FontStyleUnderline = 1 << 3
};

DECLARE_BITSET_ENUM(FontStyle);

int main()
{
  FontStyle style = FontStyleBold | FontStyleItalic;
  // style = (1 << 1); error C2440: '=' : cannot convert from 'int' to 'FontStyle
}
DECLARE_BITSET_ENUM code


 #define DECLARE_BITSET_ENUM(EnumName) \
   inline EnumName operator | (EnumName a, EnumName b) {\
   return static_cast<EnumName>(  static_cast<long>(a) |\
     static_cast<long>(b));\
 }\
 inline EnumName& operator|=(EnumName& a, EnumName b) {\
   a = static_cast<EnumName>(a | b); \
   return a; \
 }\
 inline EnumName operator~ (EnumName a) { \
  return static_cast<EnumName>(~static_cast<long>(a)); \
 }\
 inline EnumName operator& (EnumName a, EnumName b) {\
   return static_cast<EnumName>(static_cast<long>(a) & \
     static_cast<long>(b)); \
 }\
 inline EnumName& operator&=(EnumName& a, EnumName b) {\
   a = static_cast<EnumName>(a & b); \
   return a; \
 }
 ```
 
 More functions hand-made for each enum to be used as model
 
```cpp

 #define FONTSTYLE_SIZE (4)

// #include <string
std::wstring ToStringW(FontStyle e)
{ 
    const wchar_t* strs[FONTSTYLE_SIZE] = {L"FontStyleNormal",
                                           L"FontStyleBold",
                                           L"FontStyleItalic",
                                           L"FontStyleUnderline"};
    std::wstring str;
    int count = 0;
    for (int i = 0 ; i < FONTSTYLE_SIZE; i++)
    {
        if (e & (1 << i))
        {
            if (count > 0)
            str += L" | ";
            str += strs[i];
            count++;
        }
    }
    return str;
}

// #include <string
std::string ToString(FontStyle e)
{ 
    const char* strs[FONTSTYLE_SIZE] = {"FontStyleNormal",
                                        "FontStyleBold",
                                        "FontStyleItalic",
                                        "FontStyleUnderline"};
    std::string str;
    int count = 0;
    for (int i = 0 ; i < FONTSTYLE_SIZE; i++)
    {
        if (e & (1 << i))
        {
            if (count > 0)
            str += " | ";
            str += strs[i];
            count++;
        }
    }
    return str;
}
// #include <ostream
std::wostream& operator << (std::wostream& os, FontStyle e)
{ 
    const wchar_t* strs[FONTSTYLE_SIZE] = {L"FontStyleNormal",
                                           L"FontStyleBold",
                                           L"FontStyleItalic",
                                           L"FontStyle"};
    int count = 0;
    for (int i = 0 ; i < FONTSTYLE_SIZE; i++)
    {
        if (e & (1 << i))
        {
            if (count > 0)
            os << L" | ";
            os << strs[i];
            count++;
        }
    }
    return os;
}

// #include <ostream
std::ostream& operator << (std::ostream& os, FontStyle e)
{ 
    const char* strs[FONTSTYLE_SIZE] = {"FontStyleNormal",
                                        "FontStyleBold",
                                        "FontStyleItalic",
                                        "FontStyle"};
    int count = 0;
    for (int i = 0 ; i < FONTSTYLE_SIZE; i++)
    {
        if (e & (1 << i))
        {
            if (count > 0)
            os << " | ";
            os << strs[i];
            count++;
        }
    }
    return os;
}


inline bool IsValidFontStyle(long v)
{
    return (v & (FontStyleNormal | 
                 FontStyleBold | 
                 FontStyleItalic | 
                 FontStyleUnderline)) == v;
}

inline bool HasOneFontStyle(FontStyle e)
{
    return e == FontStyleNormal || 
           e == FontStyleBold   || 
           e == FontStyleItalic || 
           e == FontStyleUnderline;
}

inline void Add(FontStyle& e, FontStyle items)
{
    e |= items;
}

inline void Remove(FontStyle& e, FontStyle items)
{
    e &= ~items;
}

inline bool HasAll(FontStyle e, FontStyle items)
{
    return (e & items) == items;
}

inline bool HasAny(FontStyle e, FontStyle items)
{
    return e & items;
}
```

The river puzzle code was made using this type of construction.

Extra functions included


```

#define DECLARE_BITSET_ENUM(EnumName) \
   inline EnumName operator | (EnumName a, EnumName b) {\
   return static_cast<EnumName>(  static_cast<long>(a) |\
     static_cast<long>(b));\
 }\
 inline EnumName& operator|=(EnumName& a, EnumName b) {\
   a = static_cast<EnumName>(a | b); \
   return a; \
 }\
 inline EnumName operator~ (EnumName a) { \
  return static_cast<EnumName>(~static_cast<long>(a)); \
 }\
 inline EnumName operator& (EnumName a, EnumName b) {\
   return static_cast<EnumName>(static_cast<long>(a) & \
     static_cast<long>(b)); \
 }\
 inline EnumName& operator&=(EnumName& a, EnumName b) {\
   a = static_cast<EnumName>(a & b); \
   return a; \
 }\
inline void Add(EnumName& e, EnumName items)\
{\
    e |= items;\
}\
inline void Remove(EnumName& e, EnumName items)\
{\
    e &= ~items;\
}\
inline bool HasAll(EnumName e, EnumName items)\
{\
    return (e & items) == items;\
}\
inline bool HasAny(EnumName e, EnumName items)\
{\
    return (e & items) != 0;\
}
```

From string sample

```cpp
enum LineStyle
{
  Solid,
  Dash,
  Dot
};

LineStyle FromString(const char* psz, LineStyle def)
{
  LineStyle result;
  if (_stricmp(psz, "Solid") == 0)
    result = Solid;
  else if (_stricmp(psz, "Dash") == 0)
    result = Dash;
  else if (_stricmp(psz, "Dot") == 0)
    result = Dot;
  else
    result = def;

  return result;
}

LineStyle FromString(const wchar_t* psz, LineStyle def)
{
  LineStyle result;
  if (_wcsicmp(psz, L"Solid") == 0)
    result = Solid;
  else if (_wcsicmp(psz, L"Dash") == 0)
    result = Dash;
  else if (_wcsicmp(psz, L"Dot") == 0)
    result = Dot;
  else
    result = def;

  return result;
}

```

###History

FromString added 4/11/2010

