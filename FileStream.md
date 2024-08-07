
[TKLGEN](tklgen.md)


Header:
**"FileStream.h"**

```cpp
#pragma once

#include <cstdio>
#include <cassert>

struct FileStream
{
  typedef const wchar_t* BufferIterator;

  wchar_t*     m_pCharacteres;
  const size_t m_MaxBufferSize;
  wchar_t*     m_pCurrentChar;
  FILE*        m_hFile;
  size_t       m_CurrentLine;
  size_t       m_CurrentCol;

  bool         m_HasPutBack;
  wchar_t      m_PutBackCharacter;

  bool         m_EofSent;

  BufferIterator FirstBufferEnd() const
  {
    return m_pCharacteres + m_MaxBufferSize - 1;
  }

  BufferIterator SecondBufferEnd() const
  {
    return m_pCharacteres + m_MaxBufferSize * 2 - 1;
  }

  bool NextCharCore(wchar_t& ch)
  {
    if (m_HasPutBack)
    {
      ch = m_PutBackCharacter;
      m_HasPutBack = false;
      m_PutBackCharacter = 0;
      return true;
    }

    if (m_EofSent)
      return false;

    ch = *m_pCurrentChar++;

    if (ch == L'\0')
    {
      ch = '\0';
      m_EofSent = true;
    }
    else
    {
      if (*m_pCurrentChar == L'\0')
      {
        if (m_pCurrentChar == FirstBufferEnd())
        {
          wchar_t* pSecondBuffer =
            m_pCharacteres + m_MaxBufferSize;

          size_t r = fread(pSecondBuffer,
                           sizeof(wchar_t),
                           m_MaxBufferSize - 1,
                           m_hFile);
          pSecondBuffer[r] = 0;
          m_pCurrentChar = pSecondBuffer;
        }
        else if (m_pCurrentChar == SecondBufferEnd())
        {
          wchar_t* pFirstBuffer = m_pCharacteres;

          size_t r = fread(pFirstBuffer,
                           sizeof(wchar_t),
                           m_MaxBufferSize - 1,
                           m_hFile);

          pFirstBuffer[r] = 0;
          m_pCurrentChar = pFirstBuffer;
        }
      }
    }

    assert(m_pCharacteres[m_MaxBufferSize - 1] == 0);
    assert(m_pCharacteres[m_MaxBufferSize * 2 - 1] == 0);
    return true;
  }

public:

  FileStream(const wchar_t* fileName, size_t bufferSize = 4096)
    : m_MaxBufferSize(bufferSize)
    , m_CurrentLine(1)
    , m_CurrentCol(1)
    , m_HasPutBack(false)
    , m_PutBackCharacter(L'\0')
    , m_EofSent(false)
  {
    assert(bufferSize >= 2);

    //allocate 2 buffers
    m_pCharacteres = new wchar_t[m_MaxBufferSize * 2];
    m_pCharacteres[m_MaxBufferSize * 2 - 1] = 0;
    m_pCharacteres[m_MaxBufferSize - 1] = 0;
    m_pCurrentChar = m_pCharacteres;

    errno_t err = _wfopen_s(&m_hFile, fileName, L"r,ccs=UTF-8");

    if (err == 0)
    {
      size_t r = fread(m_pCharacteres,
                       sizeof(wchar_t),
                       m_MaxBufferSize - 1,
                       m_hFile);

      m_pCharacteres[r] = L'\0';
    }
  }

  ~FileStream()
  {
    fclose(m_hFile);
    delete [] m_pCharacteres;
  }

  void PutBack(wchar_t ch)
  {
    assert(m_HasPutBack == false);

    if (ch == L'\n')
    {
      if (m_CurrentLine > 1)
      {
        m_CurrentLine--;
      }
    }
    else
    {
      if (m_CurrentCol > 1)
      {
        m_CurrentCol--;
      }
    }

    m_PutBackCharacter = ch;
    m_HasPutBack = true;
  }

  bool NextChar(wchar_t& ch)
  {
    bool b = NextCharCore(ch);

    if (b && ch == L'\n')
    {
      m_CurrentLine++;
      m_CurrentCol = 1;
    }
    else
    {
      m_CurrentCol++;
    }

    return b;
  }

  size_t GetLine() const
  {
    return m_CurrentLine;
  }

  size_t GetCol() const
  {
    return m_CurrentCol;
  }
};


```

Test program

```cpp

#include <iostream>
#include "FileStream.h"

const wchar_t*  IntToLiteral(wchar_t i)
{
  switch (i)
  {
    case L'\0': return L"\\0";
    case L'\r':return L"\\r";
    case L'\n': return L"\\n";
    case L'\t': return L"\\t";
    case L'\'':return L"\\'";
    case L'\"':return L"\\\"";
    case L'\?':return L"\\?";
    case L'\\':return L"\\\\";
    case L'\a':return L"\\a";
    case L'\b':return L"\\b";
    case L'\f':return L"\\f";
    case L'\v':return L"\\v";
  }

  static wchar_t ch[2] = {0, 0};
  ch[0] = wchar_t(i);
  return ch;
}

void PrintAll(FileStream& filestream)
{
  wchar_t ch;

  while (filestream.NextChar(ch))
  {
    std::wcout << IntToLiteral(ch) << std::endl;
  }
}

int _tmain(int argc, _TCHAR* argv[])
{
  if (argc == 1)
  {
    std::wcout << "missing filename";
    return 1;
  }

  FileStream filestream(argv[1], 5);
  PrintAll(filestream);
  filestream.PutBack('\0');
  PrintAll(filestream);

  return 0;
}


```
