Converts a string literal like C to a string representation.

For instance:

```
  input  :  "\""
  output :  "

  input  :  "\\"
  output :  \

  input  :  "a"
  output :  a
```

```cpp


int HexToInt(const wchar_t* value)
{
  struct CHexMap
  {
    TCHAR chr;
    int value;
  };
  const int HexMapL = 16;
  CHexMap HexMap[HexMapL] =
  {
    {'0', 0}, {'1', 1},
    {'2', 2}, {'3', 3},
    {'4', 4}, {'5', 5},
    {'6', 6}, {'7', 7},
    {'8', 8}, {'9', 9},
    {'A', 10}, {'B', 11},
    {'C', 12}, {'D', 13},
    {'E', 14}, {'F', 15}
  };

  const wchar_t* s = value;
  int result = 0;

  if (*s == '0' && *(s + 1) == 'X') s += 2;

  bool firsttime = true;

  while (*s != '\0')
  {
    bool found = false;

    for (int i = 0; i < HexMapL; i++)
    {
      if (*s == HexMap[i].chr)
      {
        if (!firsttime) result <<= 4;

        result |= HexMap[i].value;
        found = true;
        break;
      }
    }

    if (!found) break;

    s++;
    firsttime = false;
  }

  return result;
}

std::wstring LiteralToString(const std::wstring& ws)
{
  std::wstring result;
  result.reserve(ws.size());

  for (int i = 1; i < ws.size() - 1; i++)
  {
    wchar_t ch = ws[i];

    if (ch == '\\')
    {
      i++;
      ch = ws[i];

      switch (ch)
      {
        case L'0':
          ch = L'\0';
          break;

        case L'a':
          ch = L'\a';
          break;

        case L'b':
          ch = L'\b';
          break;

        case L'f':
          ch = L'\f';
          break;

        case L'n':
          ch = L'\n';
          break;

        case L'r':
          ch = L'\r';
          break;

        case L't':
          ch = L'\t';
          break;

        case L'\\':
          ch = L'\\';
          break;

        case L'\'':
          ch = L'\'';
          break;

        case L'"':
          ch = L'"';
          break;

          //\uFFFE
        case L'u':
        {
          i++; //skip u
          wchar_t s[5];
          s[0] = toupper(ws[i++]);
          s[1] = toupper(ws[i++]);
          s[2] = toupper(ws[i++]);
          s[3] = toupper(ws[i]);
          s[4] = 0;
          ch = HexToInt(s);
        }
        break;
      }
    }//

    result += ch;
  }

  return result;
}


int main()
{
  for (;;)
  {
    std::wstring str;
    std::wcout << L"Enter a string literal like C" << std::endl;
    std::wcin >> str;

    if (str.empty())
      break;

    str = LiteralToString(str);
    std::wcout  << str << std::endl;
  }
}



```

### Escape Sequences
```
\a
Bell (alert)

\b
Backspace

\f
Formfeed

\n
New line

\r
Carriage return

\t
Horizontal tab

\v
Vertical tab

\'
Single quotation mark

\ "
Double quotation mark

\\
Backslash

\?
Literal question mark

\x ooo 
ASCII character in octal notation

\x hh
ASCII character in hexadecimal notation

\x hhhh
Unicode character in hexadecimal notation if this
escape sequence is used in a wide-character constant
or a Unicode string literal.

For example, WCHAR f = L'\x4e00' or
WCHAR b[] = L"The Chinese character for one is \x4e00".


```
### References

http://en.cppreference.com/w/cpp/language/escape

http://msdn.microsoft.com/en-us/library/h21280bw(v=vs.80).aspx

http://msdn.microsoft.com/en-US/library/edsza5ck(v=vs.80).aspx

