
 
Header:

**Tokenizer.h**

{{{cpp

//////////////////////////////////////////////////////////////////////////////
// TKLGEN - VersionMar  8 2013
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

template < class TDFA,
         class TInputStream >
struct Tokenizer
{
public:
    typedef TInputStream             InputStream;
    typedef typename TDFA::TokenType TokenType;

private:

  
    Tokenizer& operator=(const Tokenizer&); //= deleted

    template<class T>
    bool NextTokenNoInterleave(T& lexeme, TokenType& tk)
    {
        lexeme.clear();
        int lastGoodState = -1;
        int currentState = 0;
        wchar_t ch;

        while (m_InputStream.NextChar(ch))
        {
            currentState = TDFA::GetNext(currentState, ch);

            if (currentState == -1)
            {
                m_InputStream.PutBack(ch);
                break;
            }

            TokenType tk2;

            if (TDFA::GetTokenFromState(currentState, tk2))
            {
                tk = tk2;
                lastGoodState = currentState;
            }

            lexeme.append(1, ch);
        }

        return (lastGoodState != -1);
    }


public:

    InputStream& m_InputStream;

    Tokenizer(InputStream& stream)
        : m_InputStream(stream)
    {
    }

    template<class T>
    bool NextToken(T& lexeme, TokenType& tk)
    {
        for (;;)
        {
            if (!NextTokenNoInterleave(lexeme, tk))
            {
                return false;
            }

            if (!TDFA::IsInterleave(tk))
            {
                return true;
            }
        }
    }
};


}}}


Testing the tokenizer:

The generated DFA is necessary:

{{{cpp
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

template<class Scanner>
void PrintTokens(Scanner& scanner)
{
  
    std::wstring lexeme;
    Scanner::TokenType token;

    while (scanner.NextToken(lexeme, token))    
    { 
      std::wcout.width(15);
      std::wcout <<  TokensToString(token);
      std::wcout << L" : ";
      PrintLiteral(lexeme.c_str());
      std::wcout << std::endl;
    }
}

int main()
{
    StringStream ss(L"blabla");
 
    typedef Tokenizer<Sample2::DFA, StringStream> StringStreamScanner;   
    
    StringStreamScanner scanner(ss);

    PrintTokens(scanner);
}

}}}


{{{cpp


template <class TDFA,
          class T,
          class TInputStream>
bool NextTokenNoInterleave(TInputStream& stream,
                           T& lexeme,
                           typename TDFA::TokenType& tk)
{
  lexeme.clear();
  int lastGoodState = -1;
  int currentState = 0;
  wchar_t ch;

  while (stream.NextChar(ch))
  {
    currentState = TDFA::GetNext(currentState, ch);

    if (currentState == -1)
    {
      stream.PutBack(ch);
      break;
    }

    typename TDFA::TokenType tk2;

    if (TDFA::GetTokenFromState(currentState, tk2))
    {
      tk = tk2;
      lastGoodState = currentState;
    }

    lexeme.append(1, ch);
  }

  return (lastGoodState != -1);
}

}}}
