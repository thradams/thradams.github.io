
Reading all lines from an utf8 file and return a vector of wstring.


Fast version

```cpp

void ReadAllLines(const wchar_t* filename,
               wchar_t* buffer,
               size_t bufferSize,
               std::vector<std::wstring>& v)
{
  FILE* hfile;
  errno_t err = _wfopen_s(&hfile, filename, L"r,ccs=UTF-8");

  if (err != 0)
    return;

  std::wstring lastString;

  size_t r = 1;

  while (r != 0)
  {
    r = fread(buffer, sizeof(wchar_t), bufferSize - 1, hfile);

    if (r >= 0)
    {
      buffer[r] = 0;
    }

    wchar_t* p = buffer;
    wchar_t* pFirst = p;

    while (*p)
    {
      if (*p == '\n')
      {
        if (!lastString.empty())
        {
          lastString.append(pFirst, p - pFirst);
          v.emplace_back(std::move(lastString));
        }
        else
        {
          v.emplace_back(std::wstring(pFirst, p - pFirst));
        }

        pFirst = p + 1;
      }

      p++;
    }

    lastString.append(pFirst, p - pFirst);
  }

  if (!lastString.empty())
  {
    v.emplace_back(std::move(lastString));
  }
}

std::vector<std::wstring> ReadAllLines(const wchar_t* filename)
{
  std::vector<std::wstring> v;
  wchar_t buffer[10000];
  ReadAllLines(filename, buffer, sizeof(buffer) / sizeof(buffer[0]), v);
  return v;
}
```


Easy version
```cpp
std::vector<std::wstring> ReadAllLines2(const wchar_t* filename)
{
  std::vector<std::wstring> result;
  std::locale ulocale(std::locale(), new std::codecvt_utf8<wchar_t>);
  std::wifstream ifs(filename);
  ifs.imbue(ulocale);

  if (ifs.is_open())
  {
    std::wstring ws;
    bool newline = false;

    while (std::getline(ifs, ws))
    {
      result.emplace_back(ws);
    }
  }

  return result;
}
```

Sample
```cpp
int _tmain(int argc, _TCHAR* argv[])
{
  auto v1 = ReadAllLines(argv[1]);
}
```

