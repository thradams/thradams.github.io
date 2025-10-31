

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

function CppToHtml(text)
{
  var ss = new StringStream(text);

  var result = '<pre><tt>';

  var r = NextTokenNoInterleave(ss);
  while (r != null)
  {
      r.lexeme = Escape(r.lexeme);
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

function Escape(text)
{
    var r = "";
    for (i in text)
    {
        switch (text[i])
        {
            case '"':
                r += "&quot;";
                break;
            case '&':
                r += "&amp";
                break;
            case '<':
                r += "&lt;";
                break;
            case '>':
                r += "&gt;"
                break;
            default:
                r += text[i];
        }
    }
    return r;

}
