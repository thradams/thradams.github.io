// Tkgen tokenizer file - version 13 jan 2010
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
struct PutBackCharImp
{
  typedef TChar CharType;
  CharType m_PutBackChar;

protected:
  PutBackCharImp() : m_PutBackChar('\0')
  {
  }

  bool HasPutBack(CharType& ch)
  {
    if (m_PutBackChar == '\0')
      return false;
    ch = m_PutBackChar;
    m_PutBackChar = '\0';
    return true;
  }

public:
  void PutBackChar(CharType ch)
  {
    m_PutBackChar = ch;
  }
};

template < class TChar >
struct CommandLineTokenizerStream : public  PutBackCharImp<TChar>
{
  
    typedef typename CharType* Iterator;
    Iterator m_it;

    const int m_argc;
    CharType** m_argv;
    int m_argindex;
    static const CharType CharSeparator = L'\n';

   

public:

    CommandLineTokenizerStream(int argc, CharType** argv) : m_argv(argv) , m_argc(argc)
    {
        m_it = m_argv[0];
        m_argindex = 0;
    }


    bool NextChar(CharType & ch)
    {
        if (HasPutBack(ch))
          return true;

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
        return true;
    }
};


template < class TChar >
struct StringTokenizerStream: public  PutBackCharImp<TChar>
{
    typedef TChar CharType;
    std::basic_string<CharType>& m_str;
    typedef typename std::basic_string<CharType>::iterator Iterator;
    Iterator m_it;

public:

    StringTokenizerStream(typename std::basic_string<CharType>& s) : m_str(s)
    {
        m_it = m_str.begin();
    }

    bool NextChar(CharType & ch)
    {
       if (HasPutBack(ch))
          return true;

        if (m_it == m_str.end())
            return false;
        ch = *m_it++;
        return true;
    }
};

template < class TChar, int BufferSize = 4096 >
struct FileTokenizerStream: public  PutBackCharImp<TChar>
{
    typedef TChar CharType;
    typedef CharType* Buffer;
    typedef std::basic_istream<CharType>  Stream;
    typedef CharType* BufferIterator;

    Buffer m_Buffer;
    BufferIterator m_ForwardIt;


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

    bool NextChar(CharType & ch)
    {
        if (m_Eof)
            return false;

         if (HasPutBack(ch))
          return true;

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

        assert(m_Buffer[BufferSize - 1] == 0);
        assert(m_Buffer[BufferSize * 2 - 1] == 0);
        return true;
    }
};


template < class DFATraits, class TokenizerStreamT >
struct Tokenizer
{
    typedef typename TokenizerStreamT::CharType  CharType;
    TokenizerStreamT& m_TokenizerStream;
    bool m_eof;

    template<class T>
    bool NextTokenNoInterleave(T& lexeme, typename DFATraits::TokenType& tk)
    {
        if (m_eof)
          return false;

        lexeme.clear();
        int lastGoodState = -1;
        int currentState = 0;
        CharType ch;
        
        while (m_TokenizerStream.NextChar(ch))
        {
            currentState = DFATraits::GetNext(currentState, ch);
            if (currentState == -1)
            {
                m_TokenizerStream.PutBackChar(ch);
                return (lastGoodState != -1);
            }
            typename DFATraits::TokenType tk2;
            if (DFATraits::GetTokenFromState(currentState, tk2))
            {
                tk = tk2;
                lastGoodState = currentState;
            }
            lexeme += ch;
        }
        
        currentState = DFATraits::GetNext(currentState, L'\0');
        if (currentState != -1)
        {
          typename DFATraits::TokenType tk2;
          if (DFATraits::GetTokenFromState(currentState, tk2))
          {
            tk = tk2;
            lastGoodState = currentState;
          }
        }

        m_eof = true;
        return (lastGoodState != -1);
    }
    
    bool NextTokenNoInterleave(typename DFATraits::TokenType& tk)
    {
        int lastGoodState = -1;
        int currentState = 0;
        CharType ch;
        
        while (NextChar(ch))
        {
            currentState = DFATraits::GetNext(currentState, ch);
            if (currentState == -1)
            {
                PutBack(ch);
                return (lastGoodState != -1);
            }
            typename DFATraits::TokenType tk2;
            if (DFATraits::GetTokenFromState(currentState, tk2))
            {
                tk = tk2;
                lastGoodState = currentState;
            }
        }
        
        currentState = DFATraits::GetNext(currentState, L'\0');
        if (currentState != -1)
        {
          typename DFATraits::TokenType tk2;
          if (DFATraits::GetTokenFromState(currentState, tk2))
          {
            tk = tk2;
            lastGoodState = currentState;
          }
        }
        m_eof = true;
        return (lastGoodState != -1);
    }

public:

    typedef typename DFATraits::TokenType TokenType;

    Tokenizer(TokenizerStreamT& charEnumerator) 
      : m_TokenizerStream(charEnumerator),
        m_eof(false)
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
