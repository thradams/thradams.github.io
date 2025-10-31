var header = "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\"> \n";
header += "<html xmlns=\"http://www.w3.org/1999/xhtml\">\n";
header += "  <head>\n";
header += "    <title>Thiago\'s website</title>\n";
header += "    <link href=\"trastyle.css\" type=\"text/css\" rel=\"stylesheet\"/>\n";
header += "    <link rel=\"alternate\" type=\"application/rss+xml\" title=\"RSS\" href=\"http://wwww.thradams/codeblog/rss.xml\" />\n";
header += "  </head>\n";
header += "  <script type=\"text/javascript\"> \n";
header += "    var gaJsHost = ((\"https:\" == document.location.protocol) ? \"https://ssl.\" : \"http://www.\");\n";
header += "    \n";
header += "    \n";
header += "    document.write(unescape(\"%3Cscript src=\'\" + gaJsHost + \"google-analytics.com/ga.js\' type=\'text/javascript\'%3E%3C/script%3E\"));\n";
header += "    \n";
header += "    \n";
header += "  </script> \n";
header += "  <script type=\"text/javascript\"> \n";
header += "    try {\n";
header += "    \n";
header += "    \n";
header += "    var pageTracker = _gat._getTracker(\"UA-9617326-1\");\n";
header += "    \n";
header += "    \n";
header += "    pageTracker._trackPageview();\n";
header += "    \n";
header += "    \n";
header += "    } catch(err) {}\n";
header += "  </script> \n";
header += "  <body>\n";
header += "    <div  class=\"pageheader\">\n";
header += "      <h2>Thiago R. Adams website</h2>\n";
header += "      <p> \n";
header += "        <a class=\"linkbox\" href=\"index.htm\">HOME</a> \n";
header += "        <a class=\"linkbox\" href=\"codeblog.htm\">CODE-BLOG</a> \n";
header += "        <a class=\"linkbox\" href=\"downloads.htm\">PROJECTS</a>\n";
header += "        <a class=\"linkbox\" href=\"twitter.htm\">TWITTER</a> \n";
header += "        <a class=\"linkbox\" href=\"links.htm\">LINKS / BOOKS</a> \n";
header += "        <a class=\"linkbox\" href=\"about.htm\">ABOUT</a> \n";
header += "        <br /> \n";
header += "      </p>\n";
header += "    </div>\n";
header += "    <article>\n";
header += "      <!-- Page content begin --> \n";


var footer = "      <!-- Page content end --> \n";
footer += "    </article>\n";
footer += "  </body>\n";
footer += "</html>";


var cppkeywords = {
  "alignas": 0,
  "alignof": 1,
  "and": 0,
  "and_eq": 0,
  "asm": 0,
  "auto": 0,
  "bitand": 0,
  "bitor": 0,
  "bool": 0,
  "break": 0,
  "case": 0,
  "catch": 0,
  "char": 0,
  "char16_t": 0,
  "char32_t": 0,
  "class": 0,
  "compl": 0,
  "const": 0,
  "constexpr": 0,
  "const_cast": 0,
  "continue": 0,
  "decltype": 0,
  "default": 0,
  "delete": 0,
  "do": 0,
  "double": 0,
  "dynamic_cast": 0,
  "else": 0,
  "enum": 0,
  "explicit": 0,
  "export": 0,
  "extern": 0,
  "false": 0,
  "float": 0,
  "for": 0,
  "friend": 0,
  "goto": 0,
  "if": 0,
  "inline": 0,
  "int": 0,
  "long": 0,
  "mutable": 0,
  "namespace": 0,
  "new": 0,
  "noexcept": 0,
  "not": 0,
  "not_eq": 0,
  "nullptr": 0,
  "operator": 0,
  "or": 0,
  "or_eq": 0,
  "private": 0,
  "protected": 0,
  "public": 0,
  "register": 0,
  "reinterpret_cast": 0,
  "return": 0,
  "short": 0,
  "signed": 0,
  "sizeof": 0,
  "static": 0,
  "static_assert": 0,
  "static_cast": 0,
  "struct": 0,
  "switch": 0,
  "template": 0,
  "this": 0,
  "thread_local": 0,
  "throw": 0,
  "true": 0,
  "try": 0,
  "typedef": 0,
  "typeid": 0,
  "typename": 0,
  "union": 0,
  "unsigned": 0,
  "using": 0,
  "virtual": 0,
  "void": 0,
  "volatile": 0,
  "wchar_t": 0,
  "while": 0,
  "xor": 0,
  "xor_eq": 0,
};

//
var Tokens =
{
  TKLiteralChar: 1,
  TKBlanks: 2,
  TKlinecomment: 3,
  TKcomment: 4,
  TKStringLiteral: 5,
  TKIdentifier: 6,
  TKAny: 7
};

function GetNext(state, ch)
{
  switch (state)
  {
    case 0:
      if (ch >= '\t' && ch <= '\n')
        return 1;
      else if (ch == '\r')
        return 1;
      else if (ch == ' ')
        return 1;
      else if (ch == '!')
        return 2;
      else if (ch == '"')
        return 3;
      else if (ch == '#')
        return 2;
      else if (ch == '$')
        return 4;
      else if (ch >= '%' && ch <= '&')
        return 2;
      else if (ch == '\'')
        return 5;
      else if (ch >= '(' && ch <= '.')
        return 2;
      else if (ch == '/')
        return 6;
      else if (ch >= '0' && ch <= '@')
        return 2;
      else if (ch >= 'A' && ch <= 'Z')
        return 4;
      else if (ch >= '[' && ch <= '^')
        return 2;
      else if (ch == '_')
        return 4;
      else if (ch == '`')
        return 2;
      else if (ch >= 'a' && ch <= 'z')
        return 4;
      else if (ch >= '{' && ch <= '~')
        return 2;
      break;
    case 1:
      if (ch >= '\t' && ch <= '\n')
        return 1;
      else if (ch == '\r')
        return 1;
      else if (ch == ' ')
        return 1;

      break;
    case 2:
      break;
    case 3:
      if (ch >= ' ' && ch <= '!')
        return 8;
      else if (ch == '"')
        return 9;
      else if (ch >= '#' && ch <= '[')
        return 8;
      else if (ch == '\\')
        return 10;
      else if (ch >= ']' && ch <= '~')
        return 8;

      break;
    case 4:
      if (ch == '$')
        return 11;
      else if (ch >= '0' && ch <= '9')
        return 12;
      else if (ch >= 'A' && ch <= 'Z')
        return 11;
      else if (ch == '_')
        return 11;
      else if (ch >= 'a' && ch <= 'z')
        return 11;

      break;
    case 5:
      if (ch >= ' ' && ch <= '&')
        return 13;
      else if (ch == '\'')
        return 14;
      else if (ch >= '(' && ch <= '[')
        return 13;
      else if (ch == '\\')
        return 15;
      else if (ch >= ']' && ch <= '~')
        return 13;

      break;
    case 6:
      if (ch == '*')
        return 16;
      else if (ch == '/')
        return 17;

      break;
    case 7:
      return -1;
      break;
    case 8:
      if (ch >= ' ' && ch <= '!')
        return 8;
      else if (ch == '"')
        return 9;
      else if (ch >= '#' && ch <= '[')
        return 8;
      else if (ch == '\\')
        return 10;
      else if (ch >= ']' && ch <= '~')
        return 8;
      break;
    case 9:
      break;
    case 10:
      if (ch == '"')
        return 8;
      else if (ch >= '/' && ch <= '0')
        return 8;
      else if (ch == '\\')
        return 8;
      else if (ch == 'b')
        return 8;
      else if (ch == 'f')
        return 8;
      else if (ch == 'n')
        return 8;
      else if (ch == 'r')
        return 8;
      else if (ch == 't')
        return 8;
      else if (ch == 'u')
        return 18;
      break;
    case 11:
      if (ch == '$')
        return 11;
      else if (ch >= '0' && ch <= '9')
        return 12;
      else if (ch >= 'A' && ch <= 'Z')
        return 11;
      else if (ch == '_')
        return 11;
      else if (ch >= 'a' && ch <= 'z')
        return 11;

      break;
    case 12:
      if (ch == '$')
        return 19;
      else if (ch >= '0' && ch <= '9')
        return 12;
      else if (ch >= 'A' && ch <= 'Z')
        return 19;
      else if (ch == '_')
        return 19;
      else if (ch >= 'a' && ch <= 'z')
        return 19;
      break;
    case 13:
      if (ch >= ' ' && ch <= '&')
        return 13;
      else if (ch == '\'')
        return 14;
      else if (ch >= '(' && ch <= '[')
        return 13;
      else if (ch == '\\')
        return 15;
      else if (ch >= ']' && ch <= '~')
        return 13;
      break;
    case 14:
      break;
    case 15:
      if (ch == '\'')
        return 13;
      else if (ch >= '/' && ch <= '0')
        return 13;
      else if (ch == '\\')
        return 13;
      else if (ch == 'b')
        return 13;
      else if (ch == 'f')
        return 13;
      else if (ch == 'n')
        return 13;
      else if (ch == 'r')
        return 13;
      else if (ch == 't')
        return 13;
      else if (ch == 'u')
        return 20;
      break;
    case 16:
      if (ch >= '\t' && ch <= '\n')
        return 16;
      else if (ch == '\r')
        return 16;
      else if (ch >= ' ' && ch <= ')')
        return 16;
      else if (ch == '*')
        return 21;
      else if (ch >= '+' && ch <= '~')
        return 16;
      break;
    case 17:
      if (ch == '\n')
        return 22;
      else if (ch == '\r')
        return 23;
      else if (ch >= ' ' && ch <= '~')
        return 17;
      break;
    case 18:
      if (ch >= '0' && ch <= '9')
        return 24;
      else if (ch >= 'A' && ch <= 'F')
        return 24;
      else if (ch >= 'a' && ch <= 'f')
        return 24;
      break;
    case 19:
      if (ch == '$')
        return 19;
      else if (ch >= 'A' && ch <= 'Z')
        return 19;
      else if (ch == '_')
        return 19;
      else if (ch >= 'a' && ch <= 'z')
        return 19;

      break;
    case 20:
      if (ch >= '0' && ch <= '9')
        return 25;
      else if (ch >= 'A' && ch <= 'F')
        return 25;
      else if (ch >= 'a' && ch <= 'f')
        return 25;
      break;
    case 21:
      if (ch >= '\t' && ch <= '\n')
        return 16;
      else if (ch == '\r')
        return 16;
      else if (ch >= ' ' && ch <= '.')
        return 16;
      else if (ch == '/')
        return 26;
      else if (ch >= '0' && ch <= '~')
        return 16;
      break;
    case 22:
      break;
    case 23:
      if (ch == '\n')
        return 22;
      break;
    case 24:
      if (ch >= '0' && ch <= '9')
        return 27;
      else if (ch >= 'A' && ch <= 'F')
        return 27;
      else if (ch >= 'a' && ch <= 'f')
        return 27;
      break;
    case 25:
      if (ch >= '0' && ch <= '9')
        return 28;
      else if (ch >= 'A' && ch <= 'F')
        return 28;
      else if (ch >= 'a' && ch <= 'f')
        return 28;
      break;
    case 26:
      break;
    case 27:
      if (ch >= '0' && ch <= '9')
        return 29;
      else if (ch >= 'A' && ch <= 'F')
        return 29;
      else if (ch >= 'a' && ch <= 'f')
        return 29;
      break;
    case 28:
      if (ch >= '0' && ch <= '9')
        return 30;
      else if (ch >= 'A' && ch <= 'F')
        return 30;
      else if (ch >= 'a' && ch <= 'f')
        return 30;
      break;
    case 29:
      if (ch >= '0' && ch <= '9')
        return 8;
      else if (ch >= 'A' && ch <= 'F')
        return 8;
      else if (ch >= 'a' && ch <= 'f')
        return 8;
      break;
    case 30:
      if (ch >= '0' && ch <= '9')
        return 13;
      else if (ch >= 'A' && ch <= 'F')
        return 13;
      else if (ch >= 'a' && ch <= 'f')
        return 13;
      break;
  }
  return -1;
}

function GetTokenFromState(state)
{
  switch (state)
  {
    case 1:
      return Tokens.TKBlanks;
      break;
    case 2:
      return Tokens.TKAny;
      break;
    case 3:
      return Tokens.TKAny;
      break;
    case 4:
      return Tokens.TKIdentifier;
      break;
    case 5:
      return Tokens.TKAny;
      break;
    case 6:
      return Tokens.TKAny;
      break;
    case 9:
      return Tokens.TKStringLiteral;
      break;
    case 11:
      return Tokens.TKIdentifier;
      break;
    case 14:
      return Tokens.TKLiteralChar;
      break;
    case 19:
      return Tokens.TKIdentifier;
      break;
    case 22:
      return Tokens.TKlinecomment;
      break;
    case 26:
      return Tokens.TKcomment;
      break;
    default:
  }

  return null;
}

var StringStream = (function ()
{
  function StringStream(str)
  {
    this.pos = 0;
    this.hasputbuck = false;
    this.putback = "";
    this.text = "";
    this.pos = 0;
    this.text = str;
  }
  StringStream.prototype.GetChar = function (ch)
  {
    if (this.hasputbuck)
    {
      this.hasputbuck = false;
      return this.putback;
    }

    if (this.pos == this.text.length)
    {
      return null;
    }
    ;

    ch = this.text.charAt(this.pos);
    this.pos++;
    return ch;
  };

  StringStream.prototype.PutBack = function (ch)
  {
    this.hasputbuck = true;
    this.putback = ch;
  };
  return StringStream;
})();

function NextTokenNoInterleave(stream)
{
  var lexeme = "";
  var tk = -1;

  var lastGoodState = -1;
  var currentState = 0;
  var ch = '';

  while ((ch = stream.GetChar()) != null)
  {
    currentState = GetNext(currentState, ch);

    if (currentState == -1)
    {
      stream.PutBack(ch);
      break;
    }

    var tk2 = GetTokenFromState(currentState);

    if (tk2 != null)
    {
      tk = tk2;
      lastGoodState = currentState;
    }

    lexeme += ch;
  }

  if (lastGoodState != -1)
  {
    return { token: tk, lexeme: lexeme };
  }
  else
  {
    return null;
  }
}

function GetHtml(text)
{
  var ss = new StringStream(text);

  var result = '<pre><tt>';

  var r = NextTokenNoInterleave(ss);
  while (r != null)
  {
    switch (r.token)
    {
      case Tokens.TKLiteralChar:
        result += '<span class="string" >';
        result += r.lexeme;
        result += '</span>';
        break;
      case Tokens.TKBlanks:
        result += r.lexeme;
        break;
      case Tokens.TKlinecomment:
        result += '<span class="comment" >';
        result += r.lexeme;
        result += '</span>';
        break;
      case Tokens.TKcomment:
        result += '<span class="comment" >';
        result += r.lexeme;
        result += '</span>';
        break;
      case Tokens.TKStringLiteral:
        result += '<span class="string" >';
        result += r.lexeme;
        result += '</span>';
        break;
      case Tokens.TKIdentifier:

        if (cppkeywords.hasOwnProperty(r.lexeme))
        {
          result += '<span class="keyword" >';
          result += r.lexeme;
          result += '</span>';
        }
        else
        {
          result += r.lexeme;
        }

        break;
      case Tokens.TKAny:
        result += r.lexeme;
        break;
    }

    r = NextTokenNoInterleave(ss);
  }

  result += '</tt></pre>';
  return result;
}

function OnChange()
{
  var text = document.getElementById("TextFrom").value;
  document.getElementById("TextTo").innerHTML = GetHtml(text);
}


//

function Escape(text)
{
  return text.replace(/[-\[\]\/\ {\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function ReplaceAll(search, replace, str)
{
  search = Escape(search);
  return str.replace(new RegExp(search, 'g'), replace);
}
;

function ProcessHeaders(lineOfText)
{
  var s = lineOfText.match("^=[^=]+");
  if ((s && s[0].length == 0) || !s)
    return "";

  var text = ReplaceAll("=", "", s[0]);
  text = "<h1>" + text + "</h1>\n";
  return text;
}

function ProcessHeaders2(lineOfText)
{
  var s = lineOfText.match("^==[^=]+");
  if ((s && s[0].length == 0) || !s)
    return "";

  var text = ReplaceAll("=", "", s[0]);
  text = "<h2>" + text + "</h2>\n";
  return text;
}

function ProcessHeaders3(lineOfText)
{
  var s = lineOfText.match("^===[^=]+");
  if ((s && s[0].length == 0) || !s)
    return "";

  var text = ReplaceAll("=", "", s[0]);
  text = "<h3>" + text + "</h3>\n";
  return text;
}

function ProcessHeaders4(lineOfText)
{
  var s = lineOfText.match("^====[^=]+");
  if ((s && s[0].length == 0) || !s)
    return "";

  var text = ReplaceAll("=", "", s[0]);
  text = "<h4>" + text + "</h4>\n";
  return text;
}

function ReplaceItalic(wikiText)
{
  while (1)
  {
    var sbold = wikiText.match("//[^/]+//");
    if ((sbold && sbold[0].length == 0) || !sbold)
    {
      break;
    }

    var sbold2 = ReplaceAll("/", "", sbold[0]);
    sbold2 = "<em>" + sbold2 + "</em>";
    wikiText = ReplaceAll(sbold[0], sbold2, wikiText);
  }
  return wikiText;
}

function ReplaceLinks(wikiText)
{
  while (1)
  {
    var sbold = wikiText.match("\\[\\[[^\\|]+\\|[^\\]]+\\]\\]");
    if ((sbold && sbold[0].length == 0) || !sbold)
    {
      break;
    }

    var sbold2 = ReplaceAll("[", "", sbold[0]);
    sbold2 = ReplaceAll("]", "", sbold2);

    var splits = sbold2.split("|");

    var link = "<a href=\"" + splits[0] + "\">" + splits[1] + "</a>";

    wikiText = ReplaceAll(sbold[0], link, wikiText);
  }
  return wikiText;
}

function ReplaceImages(wikiText)
{
  while (1)
  {
    var sbold = wikiText.match("\\{\\{[^\\}]+\\}\\}");

    //var sbold = wikiText.match("\\{\\{[a-z.]+\\|[a-z.]+\\}\\}");
    if ((sbold && sbold[0].length == 0) || !sbold)
    {
      break;
    }

    var sbold2 = ReplaceAll("{", "", sbold[0]);
    sbold2 = ReplaceAll("}", "", sbold2);

    //var splits = sbold2.split("|");
    var link = "<img src=\"" + sbold2 + "\"\\>";

    wikiText = ReplaceAll(sbold[0], link, wikiText);
  }
  return wikiText;
}

function ReplaceBolds(wikiText)
{
  while (1)
  {
    var sbold = wikiText.match("[\*][\*][^\*]+[\*][\*]");
    if ((sbold && sbold[0].length == 0) || !sbold)
    {
      break;
    }

    var sbold2 = ReplaceAll("*", "", sbold[0]);
    sbold2 = "<b>" + sbold2 + "</b>";
    wikiText = ReplaceAll(sbold[0], sbold2, wikiText);
  }
  return wikiText;
}

function ReplaceBr(wikiText)
{
  while (1)
  {
    var sbold = wikiText.indexOf("\\\\");
    if (sbold == -1)
      break;

    wikiText = ReplaceAll("\\\\", "<br/>", wikiText);
  }
  return wikiText;
}

function ReplaceInternals(currentLine)
{
  currentLine = ReplaceBolds(currentLine);
  currentLine = ReplaceItalic(currentLine);
  currentLine = ReplaceLinks(currentLine);
  currentLine = ReplaceImages(currentLine);
  currentLine = ReplaceBr(currentLine);
  return currentLine;
}
function ProcessP(lineOfText)
{
  //p poderia ficar por ultimo se nao for outro sera p
  var s = lineOfText.match("[a-zA-Z0-9_]+");
  if ((s && s[0].length == 0) || !s)
    return "";

  lineOfText = ReplaceInternals(lineOfText);

  var text = "<p>" + lineOfText + "</p>\n";
  return text;
}

function ProcessPageBreak(lineOfText)
{
  var s = lineOfText.indexOf("--pagebreak--");
  if (s != 0)
    return "";
  var text = "<p style=\"page-break-after:always;\"> </p>";
  return text;
}

function ProcessHorizontalLine(lineOfText)
{
  var s = lineOfText.match("----");
  if ((s && s[0].length == 0) || !s)
    return "";

  var text = "<hr>\n";
  return text;
}

function GeneratePage(wikitext)
{
  var arrayOfLines = wikitext.match(/[^\r\n]+/g);

  if (!arrayOfLines)
  {
    arrayOfLines = [""];
  }

  var result = "";
  result += header;

  var listIsOpen = false;
  for (var line = 0 ; line < arrayOfLines.length; line++)
  {
    var currentLine = arrayOfLines[line];
    if (currentLine.indexOf(" * ") == 0)
    {
      if (!listIsOpen)
      {
        listIsOpen = true;
        result += "<ul>";
      }
      result += "<li>";
      currentLine = currentLine.trim();
      currentLine = currentLine.substr(1, currentLine.length - 1);
      currentLine = ReplaceInternals(currentLine);
      result += currentLine;
      result += "</li>";
    }
    else
    {
      if (listIsOpen)
      {
        result += "</ul>";
        listIsOpen = false;
      }

      var s;
      if (s = ProcessHeaders(currentLine))
      {
        result += s;
      }
      else if (s = ProcessHeaders2(currentLine))
      {
        result += s;
      }
      else if (s = ProcessHeaders3(currentLine))
      {
        result += s;
      }
      else if (s = ProcessHeaders4(currentLine))
      {
        result += s;
      }
      else if (s = ProcessPageBreak(currentLine))
      {
        result += s;
      }
      else if (s = ProcessHorizontalLine(currentLine))
      {
        result += s;
      }
      else if (currentLine == "{{{cpp")
      {
        line++;
        var content = "";
        while (currentLine != "}}}")
        {
          var currentLine = arrayOfLines[line];
          if (currentLine != "}}}")
          {
            content += currentLine;
            content += "\r\n";
            line++;
          }
        }

        result += GetHtml(content);
      }
      else if (currentLine == "{{{")
      {
        line++;
        var content = "";
        while (currentLine != "}}}")
        {
          var currentLine = arrayOfLines[line];
          if (currentLine != "}}}")
          {
            content += currentLine;
            content += "\r\n";
            line++;
          }
        }

        result += "<pre>";
        result += content;
        result += "</pre>";
      }
      else if (s = ProcessP(currentLine))
      {
        result += s;
      }
      else
      {
      }

    }
  }

  result += footer;
  return result;
}

function UpdatePage()
{
  var el = document.getElementById('content');
  var input = document.getElementById('wikitext');
  var htmlresult = document.getElementById('htmlresult');
  var wikitext = input.value;

  var htmlResult = GeneratePage(wikitext);
  el.innerHTML = htmlResult;
  htmlresult.value = htmlResult;
}

function OnPreview(e)
{
  UpdatePage();
}

function OnWikiChanged(e)
{  
}

function OnShowHide(e)
{
  var el = document.getElementById('wikitext');
  var btn = document.getElementById('ShowHide');
  if (el.style.display != "none")
  {
    OnPreview(e);
    el.style.display = "none";
    btn.value = "Edit markup";
  }
  else
  {
    el.style.display = "block";
    btn.value = "Hide markup";
  }
}

function OnShowHideResult(e)
{
  var el = document.getElementById('htmlresult');
  var btn = document.getElementById('ShowHideResult');
  if (el.style.display != "none")
  {
    el.style.display = "none";
    btn.value = "Show html";
  }
  else
  {
    el.style.display = "block";
    btn.value = "Hide html";
  }
}


window.onload = function ()
{
  UpdatePage();
};
