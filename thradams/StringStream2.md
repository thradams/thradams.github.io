
StringStream.h

{{{cpp

#pragma once
#include <cassert>

struct StringStream
{
  const wchar_t* m_pCharacteres;
  const wchar_t* m_pCurrentChar;
  size_t         m_CurrentLine;
  size_t         m_CurrentCol;
  bool           m_HasPutBack;
  wchar_t        m_PutBackCharacter;
  bool           m_EofSent;

  bool GetCharCore(wchar_t& ch)
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

    return true;
  }

public:

  StringStream(const wchar_t* psz)
    : m_pCharacteres(psz)
    , m_CurrentLine(1)
    , m_CurrentCol(1)
    , m_HasPutBack(false)
    , m_PutBackCharacter(L'\0')
    , m_EofSent(false)
  {
    m_pCurrentChar = m_pCharacteres;
  }

  friend void PutBack(StringStream& stream,  wchar_t ch)
  {
    assert(stream.m_HasPutBack == false);

    if (ch == L'\n')
    {
      if (stream.m_CurrentLine > 1)
      {
        stream.m_CurrentLine--;
      }
    }
    else
    {
      if (stream.m_CurrentCol > 1)
      {
        stream.m_CurrentCol--;
      }
    }

    stream.m_PutBackCharacter = ch;
    stream.m_HasPutBack = true;
  }

  friend bool GetChar(StringStream& stream, wchar_t& ch)
  {
    bool b = stream.GetCharCore(ch);

    if (b && ch == L'\n')
    {
      stream.m_CurrentLine++;
      stream.m_CurrentCol = 1;
    }
    else
    {
      stream.m_CurrentCol++;
    }

    return b;
  }

  size_t GetLine(const StringStream& stream)
  {
    return stream.m_CurrentLine;
  }

  size_t GetCol(const StringStream& stream) 
  {
    return stream.m_CurrentCol;
  }
};

}}}


Sample:

{{{cpp
#include "stdafx.h"

#include <iostream>
#include "StringStream.h"

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

template<class T>
void PrintAll(T& filestream)
{
  wchar_t ch;

  while (GetChar(filestream, ch))
  {
    std::wcout << IntToLiteral(ch) << std::endl;
  }
}

int _tmain(int argc, _TCHAR* argv[])
{
  StringStream filestream(L"test\n");
  PrintAll(filestream);
  PutBack(filestream, '\0');
  PrintAll(filestream);
  return 0;
}
}}}

