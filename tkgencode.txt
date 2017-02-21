==Tokenizer - TkGen component - version 19 nov 2009==

===Components===

===TokenizerStream===
{{{cpp
typedef _some_char_type_ CharType;

//puts ch into the buffer to be read again
void PutBack(CharType ch);

//returns true and the next char if it exists
bool NextChar(CharType & ch);
}}}

===Lexeme=== 
(Use std::wstring std::string)
{{{cpp
void clear();
void append(CharType);
}}}
===Tokenizer==
{{{cpp
typedef _some_enum_ TokenType;
bool NextToken(Lexeme& lexeme, TokenType& tk);
bool NextToken(TokenType& tk);
}}}

===Source===
* StringTokenizerStream (input is std::wstring)
* FileTokenizerStream (input is a file)

{{{cpp
// Tkgen tokenizer file - version 19 nov 2009
// www.thradams.com
//
// Copyright (C) 2009, Thiago Adams (thiago.adams@gmail.com)
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.


#pragma once

#include <fstream>
#include <string>
#include <cassert>

template < class TChar >
struct StringTokenizerStream
{
    typedef TChar CharType;
    std::basic_string<CharType>& m_str;
    typedef typename std::basic_string<CharType>::iterator Iterator;
    Iterator m_it;
    CharType m_lastChar;

public:

    StringTokenizerStream(typename std::basic_string<CharType>& s) : m_str(s)
    {
        m_lastChar = 0;
        m_it = m_str.begin();
    }

    void PutBack(CharType ch)
    {
        m_lastChar = ch;
    }

    bool NextChar(CharType & ch)
    {
        if (m_lastChar != 0)
        {
            ch = m_lastChar;
            m_lastChar  = 0;
        }
        else
        {
            if (m_it == m_str.end())
                return false;
            ch = *m_it++;
        }
        return true;
    }
};

template < class TChar, int BufferSize = 4096 >
struct FileTokenizerStream
{
    typedef TChar CharType;
    typedef CharType* Buffer;
    typedef std::basic_istream<CharType>  Stream;
    typedef CharType* BufferIterator;

    Buffer m_Buffer;
    BufferIterator m_ForwardIt;

    wchar_t m_putBackChar;
    bool m_Eof;
    Stream& m_stream;

    BufferIterator FirstBufferEnd() const
    {
        return m_Buffer + BufferSize - 1;
    }

    BufferIterator SecondBufferEnd() const
    {
        return m_Buffer + BufferSize * 2 - 1;
    }


public:

    FileTokenizerStream(Stream& stream) :
            m_stream(stream)
    {
        m_putBackChar = 0;
        m_Buffer = new wchar_t[BufferSize * 2];
        m_Buffer[BufferSize * 2 - 1] = 0;
        m_Buffer[BufferSize - 1] = 0;
        m_stream.read(m_Buffer, BufferSize - 1);
        size_t r = m_stream.gcount();
        m_Buffer[r] = 0;
        m_ForwardIt = m_Buffer;
        m_Eof = false;
    }

    ~FileTokenizerStream()
    {
        delete [] m_Buffer;
    }

    void PutBack(CharType ch)
    {
        m_putBackChar = ch;
    }

    bool NextChar(CharType & ch)
    {
        if (m_putBackChar != 0)
        {
            ch = m_putBackChar;
            m_putBackChar = 0;
        }
        else
        {
            if (m_Eof)
                return false;
            ch = *m_ForwardIt++;
            if (*m_ForwardIt == 0)//eof
            {
                if (m_ForwardIt == FirstBufferEnd())
                {
                    m_stream.read(m_Buffer + BufferSize, BufferSize - 1);
                    size_t r = m_stream.gcount();
                    m_Buffer[BufferSize + r ] = 0;
                    m_ForwardIt++;
                }
                else if (m_ForwardIt == SecondBufferEnd())
                {
                    m_stream.read(m_Buffer, BufferSize - 1);
                    size_t r = m_stream.gcount();
                    m_Buffer[r] = 0;
                    m_ForwardIt = m_Buffer;
                }
                else
                {
                    //terminate lexical analysis
                    m_Eof = true;
                }
            }
        }
        assert(m_Buffer[BufferSize - 1] == 0);
        assert(m_Buffer[BufferSize * 2 - 1] == 0);
        return true;
    }
};


template < class DFATraits, class TokenizerStreamT >
struct Tokenizer
{
    TokenizerStreamT& m_TokenizerStream;

public:

    typedef typename DFATraits::TokenType TokenType;

    Tokenizer(TokenizerStreamT& charEnumerator) : m_TokenizerStream(charEnumerator)
    {
    }

    template<class T>
    bool NextToken(T& lexeme, typename DFATraits::TokenType& tk)
    {
        lexeme.clear();
        int lastGoodState = -1;
        int currentState = 0;
        typename TokenizerStreamT::CharType ch;
        while (m_TokenizerStream.NextChar(ch))
        {
            currentState = DFATraits::GetNext(currentState, ch);
            if (currentState == -1)
            {
                m_TokenizerStream.PutBack(ch);
                break;
            }
            typename DFATraits::TokenType tk2;
            if (DFATraits::GetTokenFromState(currentState, tk2))
            {
              tk = tk2;
                lastGoodState = currentState;
            }
            lexeme += ch;
        }
        return (lastGoodState != -1);
    }
    
    bool NextToken(typename DFATraits::TokenType& tk)
    {
        int lastGoodState = -1;
        int currentState = 0;
        typename TokenizerStreamT::CharType ch;
        while (m_TokenizerStream.NextChar(ch))
        {
            currentState = DFATraits::GetNext(currentState, ch);
            if (currentState == -1)
            {
                m_TokenizerStream.PutBack(ch);
                break;
            }
            typename DFATraits::TokenType tk2;
            if (DFATraits::GetTokenFromState(currentState, tk2))
            {
              tk = tk2;
              lastGoodState = currentState;
            }
        }
        return (lastGoodState != -1);
    }    
   
};
}}}
----
===Interleaves===

This is a different code that can be used to skip blanks.

{{{cpp

// Tkgen tokenizer file - version 28 nov 2009
// www.thradams.com
//
// Copyright (C) 2009, Thiago Adams (thiago.adams@gmail.com)
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.


#pragma once

#include <fstream>
#include <string>
#include <cassert>

template < class TChar >
struct StringTokenizerStream
{
    typedef TChar CharType;
    std::basic_string<CharType>& m_str;
    typedef typename std::basic_string<CharType>::iterator Iterator;
    Iterator m_it;
    CharType m_lastChar;

public:

    StringTokenizerStream(typename std::basic_string<CharType>& s) : m_str(s)
    {
        m_lastChar = 0;
        m_it = m_str.begin();
    }

    void PutBack(CharType ch)
    {
        m_lastChar = ch;
    }

    bool NextChar(CharType & ch)
    {
        if (m_lastChar != 0)
        {
            ch = m_lastChar;
            m_lastChar  = 0;
        }
        else
        {
            if (m_it == m_str.end())
                return false;
            ch = *m_it++;
        }
        return true;
    }
};

template < class TChar, int BufferSize = 4096 >
struct FileTokenizerStream
{
    typedef TChar CharType;
    typedef CharType* Buffer;
    typedef std::basic_istream<CharType>  Stream;
    typedef CharType* BufferIterator;

    Buffer m_Buffer;
    BufferIterator m_ForwardIt;

    wchar_t m_putBackChar;
    bool m_Eof;
    Stream& m_stream;

    BufferIterator FirstBufferEnd() const
    {
        return m_Buffer + BufferSize - 1;
    }

    BufferIterator SecondBufferEnd() const
    {
        return m_Buffer + BufferSize * 2 - 1;
    }


public:

    FileTokenizerStream(Stream& stream) :
            m_stream(stream)
    {
        m_putBackChar = 0;
        m_Buffer = new wchar_t[BufferSize * 2];
        m_Buffer[BufferSize * 2 - 1] = 0;
        m_Buffer[BufferSize - 1] = 0;
        m_stream.read(m_Buffer, BufferSize - 1);
        size_t r = m_stream.gcount();
        m_Buffer[r] = 0;
        m_ForwardIt = m_Buffer;
        m_Eof = false;
    }

    ~FileTokenizerStream()
    {
        delete [] m_Buffer;
    }

    void PutBack(CharType ch)
    {
        m_putBackChar = ch;
    }

    bool NextChar(CharType & ch)
    {
        if (m_putBackChar != 0)
        {
            ch = m_putBackChar;
            m_putBackChar = 0;
        }
        else
        {
            if (m_Eof)
                return false;
            ch = *m_ForwardIt++;
            if (*m_ForwardIt == 0)//eof
            {
                if (m_ForwardIt == FirstBufferEnd())
                {
                    m_stream.read(m_Buffer + BufferSize, BufferSize - 1);
                    size_t r = m_stream.gcount();
                    m_Buffer[BufferSize + r ] = 0;
                    m_ForwardIt++;
                }
                else if (m_ForwardIt == SecondBufferEnd())
                {
                    m_stream.read(m_Buffer, BufferSize - 1);
                    size_t r = m_stream.gcount();
                    m_Buffer[r] = 0;
                    m_ForwardIt = m_Buffer;
                }
                else
                {
                    //terminate lexical analysis
                    m_Eof = true;
                }
            }
        }
        assert(m_Buffer[BufferSize - 1] == 0);
        assert(m_Buffer[BufferSize * 2 - 1] == 0);
        return true;
    }
};


template < class DFATraits, class TokenizerStreamT >
struct Tokenizer
{
    TokenizerStreamT& m_TokenizerStream;

public:

    typedef typename DFATraits::TokenType TokenType;

    Tokenizer(TokenizerStreamT& charEnumerator) : m_TokenizerStream(charEnumerator)
    {
    }

    template<class T>
    bool NextToken(T& lexeme, typename DFATraits::TokenType& tk)
    {
        for (;;)
        {
            if (!NextTokenNoInterleave(lexeme, tk))
                return false;
            
            if (!DFATraits::IsInterleave(tk))
              return true;
        }        
    }
    
    bool NextToken(typename DFATraits::TokenType& tk)
    {
        for (;;)
        {
            if (!NextTokenNoInterleave(tk))
                return false;
            
            if (!DFATraits::IsInterleave(tk))
              return true;
        }        
    }
    
    template<class T>
    bool NextTokenNoInterleave(T& lexeme, typename DFATraits::TokenType& tk)
    {
        lexeme.clear();
        int lastGoodState = -1;
        int currentState = 0;
        typename TokenizerStreamT::CharType ch;
        while (m_TokenizerStream.NextChar(ch))
        {
            currentState = DFATraits::GetNext(currentState, ch);
            if (currentState == -1)
            {
                m_TokenizerStream.PutBack(ch);
                break;
            }
            typename DFATraits::TokenType tk2;
            if (DFATraits::GetTokenFromState(currentState, tk2))
            {
              tk = tk2;
                lastGoodState = currentState;
            }
            lexeme += ch;
        }
        return (lastGoodState != -1);
    }
    
    bool NextTokenNoInterleave(typename DFATraits::TokenType& tk)
    {
        int lastGoodState = -1;
        int currentState = 0;
        typename TokenizerStreamT::CharType ch;
        while (m_TokenizerStream.NextChar(ch))
        {
            currentState = DFATraits::GetNext(currentState, ch);
            if (currentState == -1)
            {
                m_TokenizerStream.PutBack(ch);
                break;
            }
            typename DFATraits::TokenType tk2;
            if (DFATraits::GetTokenFromState(currentState, tk2))
            {
              tk = tk2;
              lastGoodState = currentState;
            }
        }
        return (lastGoodState != -1);
    }    
   
};
}}}
----

===Compact Tokenizer for const wchar_t * ===
(The stream has been integrated into tokenizer)

{{{cpp
template < class DFATraits >
class Tokenizer
{
  typedef wchar_t CharType;

  const CharType* m_str;    
  const CharType* m_it;
  CharType m_lastChar;

  void PutBack(CharType ch)
  {
    m_lastChar = ch;
  }

  bool NextChar(CharType & ch)
  {
    if (m_lastChar != 0)
    {
      ch = m_lastChar;
      m_lastChar  = 0;
    }
    else
    {
      if (*m_it == 0)
        return false;
      ch = *m_it++;
    }
    return true;
  }

public:

  typedef typename DFATraits::TokenType TokenType;

  Tokenizer(const CharType* psz) : m_str(psz)
  {
    m_lastChar = 0;
    m_it = psz;
  }

  template<class T>
  bool NextToken(T& lexeme, typename DFATraits::TokenType& tk)
  {
    for (;;)
    {
      if (!NextTokenNoInterleave(lexeme, tk))
        return false;

      if (!DFATraits::IsInterleave(tk))
        return true;
    }        
  }

  template<class T>
  bool NextTokenNoInterleave(T& lexeme, typename DFATraits::TokenType& tk)
  {
    lexeme.clear();
    int lastGoodState = -1;
    int currentState = 0;
    CharType ch;
    while (NextChar(ch))
    {
      currentState = DFATraits::GetNext(currentState, ch);
      if (currentState == -1)
      {
        PutBack(ch);
        break;
      }
      typename DFATraits::TokenType tk2;
      if (DFATraits::GetTokenFromState(currentState, tk2))
      {
        tk = tk2;
        lastGoodState = currentState;
      }
      lexeme += ch;
    }
    return (lastGoodState != -1);
  }
};
}}}

Sample:
{{{cpp
  const wchar_t* s = L"a.b.c";
  Tokenizer<StateMachine> tk(s);
  Tokenizer<StateMachine>::TokenType t;
  
  std::wstring lexeme;
  while (tk.NextToken(lexeme, t))
  {
  }
}}}

==Sends EOF==
{{{cpp
// Tkgen tokenizer file - version 19 nov 2009
// www.thradams.com
//
// Copyright (C) 2009, Thiago Adams (thiago.adams@gmail.com)
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.


#pragma once

#include <fstream>
#include <string>
#include <cassert>

template < class TChar >
struct CommandLineTokenizerStream
{
    typedef TChar CharType;
    typedef typename CharType* Iterator;
    Iterator m_it;
    CharType m_lastChar;
    const int m_argc;
    CharType** m_argv;
    int m_argindex;
    static const CharType CharSeparator = L'\n';

public:

    CommandLineTokenizerStream(int argc, CharType** argv) : m_argv(argv) , m_argc(argc)
    {
        m_it = m_argv[0];
        m_argindex = 0;
        m_lastChar = 0;
    }

    void PutBack(CharType ch)
    {
        m_lastChar = ch;
    }

    bool NextChar(CharType & ch)
    {
        if (m_lastChar != 0)
        {
            ch = m_lastChar;
            m_lastChar  = 0;
        }
        else
        {
            if (*m_it == L'\0')
            {
                if (m_argindex == (m_argc - 1))
                    return false;
                else
                {
                    m_argindex++;
                    m_it = m_argv[m_argindex];
                    ch = CharSeparator;
                    return true;
                }
            }
            ch = *m_it++;
        }
        return true;
    }
};


template < class TChar >
struct StringTokenizerStream
{
    typedef TChar CharType;
    std::basic_string<CharType>& m_str;
    typedef typename std::basic_string<CharType>::iterator Iterator;
    Iterator m_it;
    CharType m_lastChar;
    bool m_Eof;
    static const wchar_t eofChar = L'\0';
public:

    StringTokenizerStream(typename std::basic_string<CharType>& s) : m_str(s)
    {
        m_Eof = false;
        m_lastChar = 0;
        m_it = m_str.begin();
    }

    void PutBack(CharType ch)
    {
        m_lastChar = ch;
    }

    bool NextChar(CharType & ch)
    {
        if (m_Eof)
          return false;

        if (m_lastChar != 0)
        {
            ch = m_lastChar;
            m_lastChar  = 0;
        }
        else
        {
            if (m_it == m_str.end())
            {
                m_Eof = true;
                ch = eofChar;
                return true;
            }
            ch = *m_it++;
        }
        return true;
    }
};

template < class TChar, int BufferSize = 4096 >
struct FileTokenizerStream
{
    typedef TChar CharType;
    typedef CharType* Buffer;
    typedef std::basic_istream<CharType>  Stream;
    typedef CharType* BufferIterator;

    Buffer m_Buffer;
    BufferIterator m_ForwardIt;

    static const wchar_t eofChar = L'\0';

    wchar_t m_putBackChar;
    bool m_Eof;
    bool m_EofEnd;
    Stream& m_stream;

    BufferIterator FirstBufferEnd() const
    {
        return m_Buffer + BufferSize - 1;
    }

    BufferIterator SecondBufferEnd() const
    {
        return m_Buffer + BufferSize * 2 - 1;
    }


public:

    FileTokenizerStream(Stream& stream) :
            m_stream(stream)
    {
        m_putBackChar = 0;
        m_Buffer = new wchar_t[BufferSize * 2];
        m_Buffer[BufferSize * 2 - 1] = 0;
        m_Buffer[BufferSize - 1] = 0;
        m_stream.read(m_Buffer, BufferSize - 1);
        size_t r = m_stream.gcount();
        m_Buffer[r] = 0;
        m_ForwardIt = m_Buffer;
        m_Eof = false;
        m_EofEnd = false;
    }

    ~FileTokenizerStream()
    {
        delete [] m_Buffer;
    }

    void PutBack(CharType ch)
    {
        m_putBackChar = ch;
    }

    bool NextChar(CharType & ch)
    {
        if (m_EofEnd)
        {
          return false;
        }

        if (m_putBackChar != 0)
        {
            ch = m_putBackChar;
            m_putBackChar = 0;
        }
        else
        {
            //sends eof char
            if (m_Eof)
            {
                ch = eofChar;
                m_EofEnd = true;
                return true;
            }

            ch = *m_ForwardIt++;
            if (*m_ForwardIt == 0)//eof
            {
                if (m_ForwardIt == FirstBufferEnd())
                {
                    m_stream.read(m_Buffer + BufferSize, BufferSize - 1);
                    size_t r = m_stream.gcount();
                    m_Buffer[BufferSize + r ] = 0;
                    m_ForwardIt++;
                }
                else if (m_ForwardIt == SecondBufferEnd())
                {
                    m_stream.read(m_Buffer, BufferSize - 1);
                    size_t r = m_stream.gcount();
                    m_Buffer[r] = 0;
                    m_ForwardIt = m_Buffer;
                }
                else
                {
                    //terminate lexical analysis
                    m_Eof = true;
                }
            }
        }
        assert(m_Buffer[BufferSize - 1] == 0);
        assert(m_Buffer[BufferSize * 2 - 1] == 0);
        return true;
    }
};


template < class DFATraits, class TokenizerStreamT >
struct Tokenizer
{
    TokenizerStreamT& m_TokenizerStream;

    template<class T>
    bool NextTokenNoInterleave(T& lexeme, typename DFATraits::TokenType& tk)
    {
        lexeme.clear();
        int lastGoodState = -1;
        int currentState = 0;
        typename TokenizerStreamT::CharType ch;
        while (m_TokenizerStream.NextChar(ch))
        {
            currentState = DFATraits::GetNext(currentState, ch);
            if (currentState == -1)
            {
                m_TokenizerStream.PutBack(ch);
                break;
            }
            typename DFATraits::TokenType tk2;
            if (DFATraits::GetTokenFromState(currentState, tk2))
            {
                tk = tk2;
                lastGoodState = currentState;
            }
            lexeme += ch;
        }
        return (lastGoodState != -1);
    }

    bool NextTokenNoInterleave(typename DFATraits::TokenType& tk)
    {
        int lastGoodState = -1;
        int currentState = 0;
        typename TokenizerStreamT::CharType ch;
        while (m_TokenizerStream.NextChar(ch))
        {
            currentState = DFATraits::GetNext(currentState, ch);
            if (currentState == -1)
            {
                m_TokenizerStream.PutBack(ch);
                break;
            }
            typename DFATraits::TokenType tk2;
            if (DFATraits::GetTokenFromState(currentState, tk2))
            {
                tk = tk2;
                lastGoodState = currentState;
            }
        }
        return (lastGoodState != -1);
    }

public:

    typedef typename DFATraits::TokenType TokenType;

    Tokenizer(TokenizerStreamT& charEnumerator) : m_TokenizerStream(charEnumerator)
    {
    }

    template<class T>
    bool NextToken(T& lexeme, typename DFATraits::TokenType& tk)
    {
        for (;;)
        {
            if (!NextTokenNoInterleave(lexeme, tk))
                return false;
            if (!DFATraits::IsInterleave(tk))
                return true;
        }
    }

    bool NextToken(typename DFATraits::TokenType& tk)
    {
        for (;;)
        {
            if (!NextTokenNoInterleave(tk))
                return false;
            if (!DFATraits::IsInterleave(tk))
                return true;
        }
    }  
};

}}}
