
Function to save a string into a file.

```cpp

#include <string>
#include <fstream>
#include <codecvt>

void StringToFile(const wchar_t* psz,
                  const wchar_t* fileName)
{
  std::locale ulocale(std::locale(), new std::codecvt_utf8<wchar_t>) ;
  std::wofstream ofs(fileName);

  if (ofs.is_open())
  {
    ofs.imbue(ulocale);
    ofs << psz;
  }
}

```

Reads a file and returns a string
(not tested)
```cpp

#include <string>
#include <fstream>
#include <codecvt>

std::wstring FileToString(const wchar_t* fileName)
{
  std::wstring result;
  std::locale ulocale(std::locale(), new std::codecvt_utf8<wchar_t>) ;
  std::wifstream ifs(fileName);

  if (ifs.is_open())
  {
    std::wstring ws;
    bool newline = false;
    while (std::getline(ifs, ws))
    {
      if (newline)
      {
        result += L"\n";
        newline = false;
      }
      result += ws;
      newline = true;      
    }
  }

  return result;
}

```

