##Character names

Do you need name for characteres?

```cpp

Character names 0-127 
Reference:
http://unicode.org/Public/UNIDATA/UnicodeData.txt

const wchar_t* GetCharName(wchar_t ch)
{
  switch(ch)
  {
  case 0x0000: return L"NULL"; 
  case 0x0001: return L"START_OF_HEADING"; 
  case 0x0002: return L"START_OF_TEXT"; 
  case 0x0003: return L"END_OF_TEXT"; 
  case 0x0004: return L"END_OF_TRANSMISSION"; 
  case 0x0005: return L"ENQUIRY"; 
  case 0x0006: return L"ACKNOWLEDGE"; 
  case 0x0007: return L"BELL"; 
  case 0x0008: return L"BACKSPACE"; 
  case 0x0009: return L"CHARACTER_TABULATION"; 
  case 0x000A: return L"LINE_FEED"; 
  case 0x000B: return L"LINE_TABULATION"; 
  case 0x000C: return L"FORM_FEED"; 
  case 0x000D: return L"CARRIAGE_RETURN"; 
  case 0x000E: return L"SHIFT_OUT"; 
  case 0x000F: return L"SHIFT_IN"; 
  case 0x0010: return L"DATA_LINK_ESCAPE"; 
  case 0x0011: return L"DEVICE_CONTROL_ONE"; 
  case 0x0012: return L"DEVICE_CONTROL_TWO"; 
  case 0x0013: return L"DEVICE_CONTROL_THREE"; 
  case 0x0014: return L"DEVICE_CONTROL_FOUR"; 
  case 0x0015: return L"NEGATIVE_ACKNOWLEDGE"; 
  case 0x0016: return L"SYNCHRONOUS_IDLE"; 
  case 0x0017: return L"END_OF_TRANSMISSION_BLOCK"; 
  case 0x0018: return L"CANCEL"; 
  case 0x0019: return L"END_OF_MEDIUM"; 
  case 0x001A: return L"SUBSTITUTE"; 
  case 0x001B: return L"ESCAPE"; 
  case 0x001C: return L"INFORMATION_SEPARATOR_FOUR"; 
  case 0x001D: return L"INFORMATION_SEPARATOR_THREE"; 
  case 0x001E: return L"INFORMATION_SEPARATOR_TWO"; 
  case 0x001F: return L"INFORMATION_SEPARATOR_ONE"; 
  case 0x0020: return L"SPACE"; 
  case 0x0021: return L"EXCLAMATION_MARK"; //!
  case 0x0022: return L"QUOTATION_MARK"; //"
  case 0x0023: return L"NUMBER_SIGN"; //#
  case 0x0024: return L"DOLLAR_SIGN"; //$
  case 0x0025: return L"PERCENT_SIGN"; //%
  case 0x0026: return L"AMPERSAND"; //&
  case 0x0027: return L"APOSTROPHE"; //'
  case 0x0028: return L"LEFT_PARENTHESIS"; //(
  case 0x0029: return L"RIGHT_PARENTHESIS"; //)
  case 0x002A: return L"ASTERISK"; //*
  case 0x002B: return L"PLUS_SIGN"; //+
  case 0x002C: return L"COMMA"; //,
  case 0x002D: return L"HYPHEN_MINUS"; //-
  case 0x002E: return L"FULL_STOP"; //.
  case 0x002F: return L"SOLIDUS"; ///
  case 0x0030: return L"DIGIT_ZERO"; //0
  case 0x0031: return L"DIGIT_ONE"; //1
  case 0x0032: return L"DIGIT_TWO"; //2
  case 0x0033: return L"DIGIT_THREE"; //3
  case 0x0034: return L"DIGIT_FOUR"; //4
  case 0x0035: return L"DIGIT_FIVE"; //5
  case 0x0036: return L"DIGIT_SIX"; //6
  case 0x0037: return L"DIGIT_SEVEN"; //7
  case 0x0038: return L"DIGIT_EIGHT"; //8
  case 0x0039: return L"DIGIT_NINE"; //9
  case 0x003A: return L"COLON"; //:
  case 0x003B: return L"SEMICOLON"; //;
  case 0x003C: return L"LESS_THAN_SIGN"; //<
  case 0x003D: return L"EQUALS_SIGN"; //=
  case 0x003E: return L"GREATER_THAN_SIGN"; //>
  case 0x003F: return L"QUESTION_MARK"; //?
  case 0x0040: return L"COMMERCIAL_AT"; //@
  case 0x0041: return L"LATIN_CAPITAL_LETTER_A"; //A
  case 0x0042: return L"LATIN_CAPITAL_LETTER_B"; //B
  case 0x0043: return L"LATIN_CAPITAL_LETTER_C"; //C
  case 0x0044: return L"LATIN_CAPITAL_LETTER_D"; //D
  case 0x0045: return L"LATIN_CAPITAL_LETTER_E"; //E
  case 0x0046: return L"LATIN_CAPITAL_LETTER_F"; //F
  case 0x0047: return L"LATIN_CAPITAL_LETTER_G"; //G
  case 0x0048: return L"LATIN_CAPITAL_LETTER_H"; //H
  case 0x0049: return L"LATIN_CAPITAL_LETTER_I"; //I
  case 0x004A: return L"LATIN_CAPITAL_LETTER_J"; //J
  case 0x004B: return L"LATIN_CAPITAL_LETTER_K"; //K
  case 0x004C: return L"LATIN_CAPITAL_LETTER_L"; //L
  case 0x004D: return L"LATIN_CAPITAL_LETTER_M"; //M
  case 0x004E: return L"LATIN_CAPITAL_LETTER_N"; //N
  case 0x004F: return L"LATIN_CAPITAL_LETTER_O"; //O
  case 0x0050: return L"LATIN_CAPITAL_LETTER_P"; //P
  case 0x0051: return L"LATIN_CAPITAL_LETTER_Q"; //Q
  case 0x0052: return L"LATIN_CAPITAL_LETTER_R"; //R
  case 0x0053: return L"LATIN_CAPITAL_LETTER_S"; //S
  case 0x0054: return L"LATIN_CAPITAL_LETTER_T"; //T
  case 0x0055: return L"LATIN_CAPITAL_LETTER_U"; //U
  case 0x0056: return L"LATIN_CAPITAL_LETTER_V"; //V
  case 0x0057: return L"LATIN_CAPITAL_LETTER_W"; //W
  case 0x0058: return L"LATIN_CAPITAL_LETTER_X"; //X
  case 0x0059: return L"LATIN_CAPITAL_LETTER_Y"; //Y
  case 0x005A: return L"LATIN_CAPITAL_LETTER_Z"; //Z
  case 0x005B: return L"LEFT_SQUARE_BRACKET"; //[
  case 0x005C: return L"REVERSE_SOLIDUS"; 
  case 0x005D: return L"RIGHT_SQUARE_BRACKET"; //]
  case 0x005E: return L"CIRCUMFLEX_ACCENT"; //^
  case 0x005F: return L"LOW_LINE"; //_
  case 0x0060: return L"GRAVE_ACCENT"; //`
  case 0x0061: return L"LATIN_SMALL_LETTER_A"; //a
  case 0x0062: return L"LATIN_SMALL_LETTER_B"; //b
  case 0x0063: return L"LATIN_SMALL_LETTER_C"; //c
  case 0x0064: return L"LATIN_SMALL_LETTER_D"; //d
  case 0x0065: return L"LATIN_SMALL_LETTER_E"; //e
  case 0x0066: return L"LATIN_SMALL_LETTER_F"; //f
  case 0x0067: return L"LATIN_SMALL_LETTER_G"; //g
  case 0x0068: return L"LATIN_SMALL_LETTER_H"; //h
  case 0x0069: return L"LATIN_SMALL_LETTER_I"; //i
  case 0x006A: return L"LATIN_SMALL_LETTER_J"; //j
  case 0x006B: return L"LATIN_SMALL_LETTER_K"; //k
  case 0x006C: return L"LATIN_SMALL_LETTER_L"; //l
  case 0x006D: return L"LATIN_SMALL_LETTER_M"; //m
  case 0x006E: return L"LATIN_SMALL_LETTER_N"; //n
  case 0x006F: return L"LATIN_SMALL_LETTER_O"; //o
  case 0x0070: return L"LATIN_SMALL_LETTER_P"; //p
  case 0x0071: return L"LATIN_SMALL_LETTER_Q"; //q
  case 0x0072: return L"LATIN_SMALL_LETTER_R"; //r
  case 0x0073: return L"LATIN_SMALL_LETTER_S"; //s
  case 0x0074: return L"LATIN_SMALL_LETTER_T"; //t
  case 0x0075: return L"LATIN_SMALL_LETTER_U"; //u
  case 0x0076: return L"LATIN_SMALL_LETTER_V"; //v
  case 0x0077: return L"LATIN_SMALL_LETTER_W"; //w
  case 0x0078: return L"LATIN_SMALL_LETTER_X"; //x
  case 0x0079: return L"LATIN_SMALL_LETTER_Y"; //y
  case 0x007A: return L"LATIN_SMALL_LETTER_Z"; //z
  case 0x007B: return L"LEFT_CURLY_BRACKET"; //{
  case 0x007C: return L"VERTICAL_LINE"; //|
  case 0x007D: return L"RIGHT_CURLY_BRACKET"; //}
  case 0x007E: return L"TILDE"; //~
  }
}

```

```cpp

const wchar_t*  IntToLiteral(int i)
{
    switch (i)
    {
    case '\0': return L"\\0";
    case '\r': return L"\\r";
    case '\n': return L"\\n";
    case '\t': return L"\\t";
    case '\'': return L"\\'";
    case '\"': return L"\\\"";
    case '\?': return L"\\?";
    case '\\': return L"\\\\";
    case '\a': return L"\\a";
    case '\b': return L"\\b";
    case '\f': return L"\\f";
    case '\v': return L"\\v";
    }

    static wchar_t ch[2] = {0,0};
    ch[0] = wchar_t(i);
    return ch;
}

```

Useful to TklGen:

```cpp
    token EndMark = '\0';
    token CHARACTER_TABULATION = '\t';
    token LINE_FEED = '\n';
    token LINE_TABULATION = '\v';
    token FORM_FEED = '\f';
    token CARRIAGE_RETURN = '\r';
    token SPACE = ' ';
    token EXCLAMATION_MARK = '!';
    token QUOTATION_MARK = '\"';
    token NUMBER_SIGN = '#';
    token DOLLAR_SIGN = '$';
    token PERCENT_SIGN = '%';
    token AMPERSAND = '&';
    token APOSTROPHE = '\'';
    token LEFT_PARENTHESIS = '(';
    token RIGHT_PARENTHESIS = ')';
    token ASTERISK = '*';
    token PLUS_SIGN = '+';
    token COMMA = ',';
    token HYPHEN_MINUS = '-';
    token FULL_STOP = '.';
    token SOLIDUS = '/';
    token COLON = ':';
    token SEMICOLON = ';';
    token LESS_THAN_SIGN = '<';
    token EQUALS_SIGN = '=';
    token GREATER_THAN_SIGN = '>';
    token QUESTION_MARK = '\?';
    token COMMERCIAL_AT = '@';
    token LEFT_SQUARE_BRACKET = '[';
    token REVERSE_SOLIDUS = '\\';
    token RIGHT_SQUARE_BRACKET = ']';
    token CIRCUMFLEX_ACCENT = '^';
    token LOW_LINE = '_';
    token GRAVE_ACCENT = '`';
    token LEFT_CURLY_BRACKET = '{';
    token VERTICAL_LINE = '|';
    token RIGHT_CURLY_BRACKET = '}';

```
