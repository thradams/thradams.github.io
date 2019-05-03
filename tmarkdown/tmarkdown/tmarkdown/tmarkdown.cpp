#include "stdafx.h"
#include "system.h"
#include <iostream>
#include <string>
#include <fstream>
#include <codecvt>
#include "tokenizer.h"
#include "out.h"
#include "creole.h"
#include <sstream>
#include <Windows.h>
#include <ctime>
#include <map>
#include <sys/types.h>
#include <sys/stat.h>

enum Block
{
  BlockNone,
  BlockText,
  BlockCode,
};

typedef Tokenizer<Creole::Creole, StringTokenizerStream<wchar_t> > CreoleParser;

void StringToFile(const wchar_t* psz,
                  const wchar_t* fileName)
{
  std::locale ulocale(std::locale(), new std::codecvt_utf8<wchar_t>);
  std::wofstream ofs(fileName);

  if (ofs.is_open())
  {
    ofs.imbue(ulocale);
    ofs << psz;
  }
}

std::wstring FileToString(const wchar_t* fileName)
{
  std::wstring result;
  std::locale ulocale(std::locale(), new std::codecvt_utf8<wchar_t>);
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


inline void find_replace(std::wstring& in_this_string,
                         const std::wstring& find,
                         const std::wstring& replace)
{
  std::wstring::size_type pos = 0;
  while (std::wstring::npos != (pos = in_this_string.find(find, pos)))
  {
    in_this_string.replace(pos, find.length(), replace);
    pos += replace.length();
  }
}


void PrintHtml(std::wostream &str, const wchar_t * psz)
{
  while (*psz)
  {
    switch (*psz)
    {
    case L'&':
      str << L"&amp;";
      break;
    case L'<':
      str << L"&lt;";
      break;
    case L'>':
      str << L"&gt;";
      break;
    case L'"':
      str << L"&quot;";
      break;
    //case L'\'':str << L"&apos;"; break;
    default:
      str << *psz;
    }
    psz++;
  }
}

void CppParser(StringTokenizerStream<wchar_t> &st,
               std::wostream &str,
               bool isCppCode)
{
  Tokenizer<MGrammar::MGrammar, StringTokenizerStream<wchar_t> > tk(st);

  std::wstring lexeme;
  MGrammar::Tokens token;

  MGrammar::Tokens previoustoken = MGrammar::SPACES;

  while (tk.NextToken(lexeme, token))
  {

    switch (token)
    {
    case MGrammar::CHAR:
    case MGrammar::STRING:

      if (isCppCode)
      {
        str << L"<span class=\"string\">";
      }
      PrintHtml(str, lexeme.c_str());
      if (isCppCode)
      {
        str << L"</span>";
      }
      break;

    case MGrammar::LINECOMMENT:

      if (isCppCode)
      {
        str << L"<span class=\"comment\">";
      }
      lexeme.erase(lexeme.size() - 2, 2);
      PrintHtml(str, lexeme.c_str());
      if (isCppCode)
      {
        str << L"</span>" << std::endl;
      }
      break;

    case MGrammar::COMMENT:
      if (isCppCode)
      {
        str << L"<span class=\"comment\">";
      }
      PrintHtml(str, lexeme.c_str());
      if (isCppCode)
      {
        str << L"</span>";
      }
      break;


    default:
    {

      if (token == MGrammar::NOWIKI_BLOCK_CLOSE &&
          previoustoken == MGrammar::NEWLINE)
      {
        //terminou
        return;
      }


      if (token == MGrammar::DEFINE ||
          (token >= MGrammar::KY_ASM && token <= MGrammar::KY_ALIGNOF))
      {
        if (isCppCode)
        {
          str << L"<span class=\"keyword\">";
        }
        PrintHtml(str, lexeme.c_str());
        if (isCppCode)
        {
          str << L"</span>";
        }
      }
      else
      {
        if (token == MGrammar::NEWLINE)
        {
          str << std::endl;
        }
        else
        {
          PrintHtml(str, lexeme.c_str());
        }
      }
    }
    }//
    previoustoken = token;
  }
}

void CreateIfDontExists(const std::wstring& file)
{
  std::wstring file2(file);
  find_replace(file2, L".html", L".txt");
  find_replace(file2, L".htm", L".txt");
  
  auto r = FileToString(file2.c_str());
  if (r.empty())
  {
    StringToFile(L"", file2.c_str());
  }
}

void CreoleParserFunc(const std::wstring& path,
  StringTokenizerStream<wchar_t>& st,
                      std::wostream &str,
                      bool & donext,
                      std::wstring & lexeme,
                      MGrammar::Tokens& token)
{
  CreoleParser creoletk(st);
  Creole::Tokens ctk;
  std::wstring ws2;
  bool stop = false;
  bool lineBegin = true;
  bool strong = false;
  bool italic = false;
  bool insideitem = false;
  bool insideitempound = false;
  bool paragraph = false;
  bool codepre = false;

  //str << L"<p>" << std::endl;

  while (!stop && creoletk.NextToken(ws2, ctk))
  {

    switch (ctk)
    {
    case Creole::NEWLINE2:


      if (insideitem)
      {
        str << _T(" </li>") << std::endl;
        str << _T("</ul>") << std::endl;
        insideitem = false;
      }
      else if (insideitempound)
      {
        str << _T(" </li>") << std::endl;
        str << _T("</ol>") << std::endl;
        insideitempound = false;
      }

      if (paragraph)
      {
        paragraph = false;
        str << L"</p>" << std::endl;
      }

      lineBegin = true;
      //str << L"</p><p>"<< std::endl;
      break;
    case Creole::DASH:
    {
      int i = 0;
      for (; i < 4; i++)
      {
        if (!creoletk.NextToken(ws2, ctk))
        {
          break;
        }

        if (ctk != Creole::DASH)
        {
          break;
        }
      }
      if (i == 3)
      {
        str << L"<hr /> ";
      }
      else
      {
        str << L"-";
        for (int k = 0; k < i; k++)
        {
          str << L"-";
        }
        PrintHtml(str, ws2.c_str());
      }
    }
    break;

    case Creole::POUND:

      if (lineBegin)
      {
        if (insideitempound)
        {
          str << _T(" </li>") << std::endl;
          str << _T(" <li>") << std::endl;
        }
        else
        {
          str << _T("<ol>") << std::endl;
          str << _T(" <li>") << std::endl;
          insideitempound = true;
        }
      }
      else
      {
        str << _T("#");
      }

      break;
    case Creole::STAR:
    {
      if (!paragraph)
      {
        paragraph = true;
        str << L"<p>" << std::endl;
      }

      if (creoletk.NextToken(ws2, ctk))
      {
        if (ctk == Creole::STAR)
        {
          if (!paragraph)
          {
            paragraph = true;
            str << L"<p>" << std::endl;
          }

          if (!strong)
          {
            str << L"<strong>";
            strong = true;
          }
          else
          {
            str << L"</strong>";
            strong = false;
          }
        }
        else
        {
          if (lineBegin)
          {
            if (insideitem)
            {
              str << _T(" </li>") << std::endl;
              str << _T(" <li>") << std::endl;
            }
            else
            {
              str << _T("<ul>") << std::endl;
              str << _T(" <li>") << std::endl;
              insideitem = true;
            }

            //andar enquanto for espacos
            //entrar no modo lista  sair quando achar outro * no comeco de linha
            //* e outra coisa no comeco de linha
          }
          else
          {
            str << L"*";
            PrintHtml(str, ws2.c_str());
          }
        }
      }
      else
      {
        PrintHtml(str, ws2.c_str());
      }
    }
    break;

    case Creole::ESCAPE:
      if (!paragraph)
      {
        paragraph = true;
        str << L"<p>" << std::endl;
      }

      creoletk.NextToken(ws2, ctk);
      str << ws2.c_str();
      break;

    case Creole::EQUAL:
    {


      if (lineBegin)
      {
        int count = 1;
        if (creoletk.NextToken(ws2, ctk))
        {
          while (ctk == Creole::EQUAL)
          {
            count++;
            if (!creoletk.NextToken(ws2, ctk))
            {
              break;
            }
          }
        }

        if (paragraph)
        {
          paragraph = false;
          str << L"</p>" << std::endl;
        }

        switch (count)
        {
        case 1:
          str << L"<h1>";
          break;
        case 2:
          str << L"<h2>";
          break;
        case 3:
          str << L"<h3>";
          break;
        case 4:
          str << L"<h4>";
          break;
        case 5:
          str << L"<h5>";
          break;
        case 6:
          str << L"<h6>";
          break;
        }

        bool inside = true;
        for (;;)
        {
          if (ctk == Creole::NEWLINE ||
              ctk == Creole::NEWLINE2)
          {
            break;
          }

          if (ctk == Creole::EQUAL)
          {
            inside = false;
          }

          if (inside)
          {
            PrintHtml(str, ws2.c_str());
          }

          if (!creoletk.NextToken(ws2, ctk))
          {
            break;
          }
        }
        switch (count)
        {
        case 1:
          str << L"</h1>";
          break;
        case 2:
          str << L"</h2>";
          break;
        case 3:
          str << L"</h3>";
          break;
        case 4:
          str << L"</h4>";
          break;
        case 5:
          str << L"</h5>";
          break;
        case 6:
          str << L"</h6>";
          break;
        }
      }
      else
      {
        PrintHtml(str, ws2.c_str());
      }
    }
    break;
    case Creole::ITAL:
      if (!paragraph)
      {
        paragraph = true;
        str << L"<p>" << std::endl;
      }
      if (!italic)
      {
        str << L"<em>";
        italic = true;
      }
      else
      {
        str << L"</em>";
        italic = false;
      }
      break;

    case Creole::CODEPRE:
      if (!paragraph)
      {
        paragraph = true;
        str << L"<p>" << std::endl;
      }
      if (!codepre)
      {
        str << L"<code>";
        codepre = true;
      }
      else
      {
        str << L"</code>";
        codepre = false;
      }
      break;

    case Creole::NEXTLINE:
      if (!paragraph)
      {
        paragraph = true;
        str << L"<p>" << std::endl;
      }

      str << L" ";
      lineBegin = true;
      break;
    case Creole::FORCED_LINEBREAK:
      if (!paragraph)
      {
        paragraph = true;
        str << L"<p>" << std::endl;
      }

      str << L"<br/>";
      break;

    case Creole::NEWLINE:

      if (!paragraph)
      {
        paragraph = true;
        str << L"<p>" << std::endl;
      }

      str << L" ";
      lineBegin = true;
      //  stop = true;
      break;
    case Creole::IMAGE_OPEN:
    {
      if (!paragraph)
      {
        paragraph = true;
        str << L"<p>" << std::endl;
      }

      if (lineBegin)
      {
        str << "<div class=\"image_center\">" << std::endl;
      }

      str << "<img src=\"";
      Creole::Tokens tk;
      std::wstring s;
      creoletk.NextToken(s, tk);
      std::wstring ss;
      bool pipefound = false;
      while (tk != Creole::IMAGE_CLOSE)
      {
        if (tk != Creole::PIPE)
        {
          ss += s;
          PrintHtml(str, s.c_str());
        }
        else
        {
          pipefound = true;
          str << "\" alt=\"";
          ss.clear();
        }
        if (!creoletk.NextToken(s, tk))
        {
          break;
        }
      }


      str << "\" />";

      if (lineBegin)
      {
        str << "</div>" << std::endl;
      }
    }
    break;

    case Creole::LINK_OPEN:
    {
      if (!paragraph)
      {
        paragraph = true;
        str << L"<p>" << std::endl;
      }

      str << "<a href=\"";
      Creole::Tokens tk;
      std::wstring s;
      creoletk.NextToken(s, tk);
      std::wstring ss;
      bool pipefound = false;
      while (tk != Creole::LINK_CLOSE)
      {
        if (tk != Creole::PIPE)
        {
          ss += s;
          PrintHtml(str, s.c_str());
        }
        else
        {
          pipefound = true;
          str << "\">";

          //verificar se o arquivo existe
          CreateIfDontExists(path + ss);

          ss.clear();
        }
        if (!creoletk.NextToken(s, tk))
        {
          break;
        }
      }
      if (!pipefound)
      {
        str << "\">";
        PrintHtml(str, ss.c_str());
        
        //verificar se o arquivo existe
        CreateIfDontExists(path + ss);

        str << "</a>";
      }
      else
      {
        str << "</a>";
      }

    }
    break;

    case Creole::NOWIKI_CPPOPEN:

      if (paragraph)
      {
        paragraph = false;
        str << L"</p>" << std::endl;
      }

      str << L"<pre><tt>";
      CppParser(st, str, true);
      str << L"</tt></pre>";

      break;

    case Creole::NOWIKI_OPEN:
      if (paragraph)
      {
        paragraph = false;
        str << L"</p>" << std::endl;
      }
      str << L"<pre><tt>";
      CppParser(st, str, false);
      str << L"</tt></pre>";

      break;

    default:
      if (!paragraph)
      {
        paragraph = true;
        str << L"<p>" << std::endl;
      }
      PrintHtml(str, ws2.c_str());
      lineBegin = false;
    }
  }
  if (paragraph)
  {
    paragraph = false;
    str << L"</p>" << std::endl;
  }
}

std::wstring Generate(const std::wstring& path,
                      const std::wstring& header,
                      const std::wstring& wikiText,
                      const std::wstring& footer)
{
  std::wstring wikiText2(wikiText);
  StringTokenizerStream<wchar_t> st(wikiText2);
  bool donext;
  MGrammar::Tokens token;
  std::wstring lexeme;
  std::wostringstream str;// ((LPCWSTR)strFileOut);
  CreoleParserFunc(path, st, str, donext, lexeme, token);

  std::wstring ws;
  ws += header;
  ws += str.str();
  ws += footer;

  return ws;
}

std::map<std::wstring, time_t> GenerateMap(const std::wstring& path)
{
  std::map<std::wstring, time_t> map;
  ForEachFile(path.c_str(), L"*.txt", [&map, &path](const wchar_t* pszFileName)
  {
    std::wstring filePath(path);
    filePath += pszFileName;
    struct _stat filestat;
    _wstat(filePath.c_str(), &filestat);    
    map[filePath] = filestat.st_mtime;
  });
  return map;
}

void GenerateAllFiles(std::map<std::wstring, time_t> &previousMap, 
                      const wchar_t* pszDirectory)
{
  auto path = GetPath(pszDirectory);

  auto header = FileToString((path + L"_header.txt").c_str());
  auto footer = FileToString((path + L"_footer.txt").c_str());


  ForEachFile(path.c_str(), L"*.txt", [&previousMap, &path, &footer, &header](const wchar_t* pszFileName)
  {
    std::wstring filePath(path);
    filePath += pszFileName;

    bool bGenerate = true;
    auto itpos = previousMap.find(filePath);
    if (itpos != previousMap.end())
    {    
      //achou..
      struct _stat filestat;
      _wstat(filePath.c_str(), &filestat);
      bGenerate = filestat.st_mtime > itpos->second;
      if (bGenerate)
      {
        time_t t;
        time(&t);
        previousMap[filePath] = t;
      }
    }
    else
    {
      bGenerate = true;
      time_t t;
      time(&t);
      previousMap[filePath] = t;
    }

    if (bGenerate)
    {
      auto wikiText = FileToString(filePath.c_str());
      auto htmlText = Generate(path, header, wikiText, footer);
      std::wstring fileOut(pszFileName);
      find_replace(fileOut, L".txt", L".htm");
      fileOut = path + fileOut;
      StringToFile(htmlText.c_str(), fileOut.c_str());
      std::wcout << pszFileName << std::endl;
    }
    else
    {
    }
  });

};

int _tmain(int argc, _TCHAR* argv[])
{
  std::map<std::wstring, time_t> previousMap;
  if (argc > 1)
  { 
      GenerateAllFiles(previousMap, argv[0]);
    
  }
  else
  {    
      std::wcout << L"waiting changes..." << std::endl;
      for (;;)
      {
          Sleep(1000);
          GenerateAllFiles(previousMap, argv[0]);
      }
  }
  
  return 0;
}


