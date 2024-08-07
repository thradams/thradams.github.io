Tokenizer.h

{{{cpp
//////////////////////////////////////////////////////////////////////////////
// Generated by TKLGEN - Version Sep 27 2013
// Copyright (C) 2013, Thiago Adams (thiago.adams@gmail.com)
// www.thradams.com
//
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.
//
//////////////////////////////////////////////////////////////////////////////

#pragma once

inline void Clear(std::wstring& ws)
{
    ws.clear();
}

inline void Append(std::wstring& ws, wchar_t ch)
{
    ws.append(1, ch);
}


inline void Clear(std::string& ws)
{
    ws.clear();
}

inline void Append(std::string& ws, char ch)
{
    ws.append(1, ch);
}

template < class TDFA,
         class T,
         class TInputStream >
bool NextTokenNoInterleave(TInputStream& stream,
                           T& lexeme,
                           typename TDFA::TokenType& tk)
{
    Clear(lexeme);
    int lastGoodState = -1;
    int currentState = 0;
    wchar_t ch;

    while (GetChar(stream, ch))
    {
        currentState = TDFA::GetNext(currentState, ch);

        if (currentState == -1)
        {
            PutBack(stream, ch);
            break;
        }

        typename TDFA::TokenType tk2;

        if (TDFA::GetTokenFromState(currentState, tk2))
        {
            tk = tk2;
            lastGoodState = currentState;
        }

        Append(lexeme, ch);
    }

    return (lastGoodState != -1);
}

template < class TDFA,
         class T,
         class TInputStream >
bool NextToken(TInputStream& stream,
               T& lexeme,
               typename TDFA::TokenType& tk)
{
    for (;;)
    {
        if (!NextTokenNoInterleave<TDFA>(stream, lexeme, tk))
        {
            return false;
        }

        if (!TDFA::IsInterleave(tk))
        {
            return true;
        }
    }
}


}}}

Sample

{{{cpp

#include "stdafx.h"
#include "ExpressionsParser.h"
#include <iostream>

const wchar_t* IntToLiteral(int i)
{
  switch (i)
  {
    case '\0': return L"\\0";
    case '\r': return L"\\r";
    case '\n':return L"\\n";
    case '\t':return L"\\t";
    case '\'':return L"\\'";
    case '\"':return L"\\\"";
    case '\?':return L"\\?";
    case '\\':return L"\\\\";
    case '\a':return L"\\a";
    case '\b':return L"\\b";
    case '\f':return L"\\f";
    case '\v':return L"\\v";
  }

  static wchar_t ch[2] = {0, 0};
  ch[0] = wchar_t(i);
  return ch;
}

void PrintLiteral(const std::wstring& ws)
{
  if (ws.empty())
  {
    std::wcout << "'\\0'";    
  }
  else
  {
    std::wcout << "\"";
    for (size_t i = 0 ; i < ws.size() ; i++)
    {
      std::wcout << IntToLiteral(ws[i]);
    }
    std::wcout  << "\"";
  }
}

template<class Language, class Stream>
void PrintTokens(Stream& stream)
{  
    std::wstring lexeme;
    typename Language::TokenType token;

    while (NextToken<Language>(stream, lexeme, token))    
    { 
      std::wcout.width(15);
      std::wcout <<  TokensToString(token);
      std::wcout << L" : ";
      PrintLiteral(lexeme.c_str());
      std::wcout << std::endl;
    }
}


int _tmain(int argc, _TCHAR* argv[])
{
  if (argc == 1)
  {
    std::cout << "missing input file ";
    return 1;
  }

  try
  {
    FileStream ss(argv[1]);
    PrintTokens<Expressions::DFA>(ss);    
  }
  catch (const Expressions::ParserException& e)
  {
    std::cout << "Error : line, col = " << e.m_Line << ", " << e.m_Col << std::endl;
  }
  catch (const std::exception& e)
  {
    std::cout << e.what() << std::endl;
  }

  return 0;
}

}}}