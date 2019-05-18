
Stream.h

```cpp

#include <stdbool.h>
#include <stddef.h>

struct Stream
{
    const char* data; //utf8 encoded

    wchar_t CurrentChar;
    int CurrentLine;
    int CurrentCol;
    int CurrentBytePos;
    int NextBytePos;
};


#define STREAM_INIT {0}


wchar_t Stream_Match(struct Stream* stream);


void Stream_Close(struct Stream* stream);

void Stream_Attach(struct Stream* stream, const char* text);
bool Stream_Set(struct Stream* stream, const char* text);
bool Stream_Open(struct Stream* stream, const char* path);
wchar_t Stream_LookAhead(const struct Stream* stream);
wchar_t Stream_LookAhead2(const struct Stream* stream, wchar_t* ch2);



```

```cpp

#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <assert.h>
#include <string.h>
#include <assert.h>
#include <ctype.h>

#include "Stream.h"


#if defined(_WIN32) || defined(_WIN64) || defined(__WIN32__) || defined(__WINDOWS__)
#define stat _stat
#define strdup _strdup
#endif


void Stream_Attach(struct Stream* stream, const char* text)
{
    Stream_Close(stream);
    stream->data = text;        
}

bool Stream_Set(struct Stream* stream, const char* text)
{
    char* data = strdup(text);
    if (data)
    {
        Stream_Attach(stream, data);
    }
    return data != NULL;
}

bool Stream_Open(struct Stream* stream, const char* path)
{
    bool result = false;
    struct stat info;
    int r = stat(
        path,
        &info);
    if (r == 0)
    {
        char* data = (char*)malloc(sizeof(char) * info.st_size + 1);
        if (data != NULL)
        {
            FILE* file = fopen(path, "r");
            if (file != NULL)
            {
                //SKIP BOM
                if (info.st_size >= 3)
                {
                    fread(data, 1, 3, file);
                    if (data[0] == (char)0xEF &&
                        data[1] == (char)0xBB &&
                        data[2] == (char)0xBF)
                    {
                        size_t n = fread(data, 1, info.st_size - 3, file);
                        data[n] = 0;
                    }
                    else
                    {
                        size_t n = fread(data + 3, 1, info.st_size - 3, file);
                        data[3 + n] = 0;
                    }
                }
                else
                {
                    size_t n = fread(data, 1, info.st_size, file);
                    data[n] = 0;
                }

                fclose(file);
                result = true;
                Stream_Attach(stream, data);
            }
        }
    }
    return result;
}

static wchar_t ReadNextChar(const char* data, int currentPos, int* bytes)
{
    //https://www.ietf.org/rfc/rfc3629.txt
    //https://www.fileformat.info/info/unicode/utf8.htm

	int pos = currentPos;

    unsigned u = EOF;
    
    if (data != NULL)
    {
        int c = data[pos];

        if (c == '\0' /*EOF*/)
        {
            u = EOF;
        }
        else if ((c & 0x80) == 0)
        {
            pos++;
            u = c;
        }
        else if ((c & 0xC0) == 0x80)
        {
            u = EOF;
        }
        else
        {
            pos++;
            u = (c & 0xE0) == 0xC0 ? (c & 0x1F)
                : (c & 0xF0) == 0xE0 ? (c & 0x0F)
                : (c & 0xF8) == 0xF0 ? (c & 0x07)
                : 0;

            if (u == 0)
            {
                u = EOF;
            }
            else
            {
                for (;;)
                {
                    c = data[pos];
                    pos++;

                    if (c == EOF)
                    {
                        break;
                    }
                    else if ((c & 0xC0) == 0x80)
                    {
                        u = (u << 6) | (c & 0x3F);
                    }
                    else
                    {
                        pos--;
                        break;
                    }
                }
            }
        }
    }

    *bytes = pos - currentPos;
    return u;
}

wchar_t Stream_LookAhead(const struct Stream* stream)
{
	int bytes = 0;
	wchar_t ch =
		ReadNextChar(stream->data, stream->NextBytePos, &bytes);

	return ch;
}

wchar_t Stream_LookAhead2(const struct Stream* stream, wchar_t* ch2)
{
	*ch2 = WEOF;

    int bytes = 0;
    wchar_t ch =
		ReadNextChar(stream->data, stream->NextBytePos, &bytes);

	if (bytes > 0)
	{
		*ch2 = ReadNextChar(stream->data, stream->NextBytePos + bytes, &bytes);
	}

    return ch;
}

wchar_t Stream_Match(struct Stream* stream)
{
    //if (stream->CurrentChar)

    int bytes = 0;
	wchar_t ch =
		ReadNextChar(stream->data, stream->NextBytePos, &bytes);


    if (bytes > 0)
    {
		if (stream->CurrentLine == 0)
		{
			stream->CurrentLine = 1;
		}

        stream->CurrentBytePos = stream->NextBytePos;
        stream->NextBytePos += bytes;
        stream->CurrentCol++;
        
        if (ch == '\n') //fopen on windows automatically removes \r
        {
            stream->CurrentLine++;
            stream->CurrentCol = 0;
        }
		stream->CurrentChar = ch;
	}
	else if (ch == (wchar_t)EOF)
	{
		if (stream->CurrentBytePos != stream->NextBytePos)
		{
			stream->CurrentBytePos = stream->NextBytePos;
			stream->CurrentCol++;
			stream->CurrentChar = ch;
		}
	}
    
    return ch;
}

void Stream_Close(struct Stream* stream)
{
    free((void*)stream->data);
    stream->CurrentCol = 0;
    stream->CurrentLine = 0;
    stream->NextBytePos = 0;
    stream->CurrentBytePos = 0;
	stream->CurrentChar = 0;
}



```


```cpp
#pragma once

#include "Stream.h"

enum JSTokens
{
  TK_JS_NONE,
  TK_JS_LEFT_CURLY_BRACKET,
  TK_JS_RIGHT_CURLY_BRACKET,
  TK_JS_LEFT_SQUARE_BRACKET,
  TK_JS_RIGHT_SQUARE_BRACKET,
  TK_JS_COMMA,
  TK_JS_COLON,
  TK_JS_STRING,
  TK_JS_NUMBER,
  TK_JS_TRUE,
  TK_JS_FALSE,
  TK_JS_NULL,
  TK_JS_EOF,
};

struct JsonScanner
{
  struct Stream Stream;
  enum JSTokens Token;
  int LexemeStart;
  int LexemeSize;  
};

#define JSONSCANNER_INIT ((struct JsonScanner){STREAM_INIT, TK_JS_NONE, 0, 0})

void JsonScanner_Destroy(struct JsonScanner* scanner);

enum JSTokens JsonScanner_Match(struct JsonScanner* scanner);
void JsonScanner_Destroy(struct JsonScanner* scanner);
bool JsonScanner_Set(struct JsonScanner* scanner, const char* sinkString);
void JsonScanner_Attach(struct JsonScanner* scanner, const char* sinkString);
bool JsonScanner_Open(struct JsonScanner* scanner, const char* path);

```



```cpp

#include "JsonScanner.h"
#include <assert.h>


bool JsonScanner_Open(struct JsonScanner* scanner, const char* path)
{
	JsonScanner_Destroy(scanner);
	*scanner = JSONSCANNER_INIT;
	bool b = Stream_Open(&scanner->Stream, path);
	if (b)
	{
		Stream_Match(&scanner->Stream);
	}

	return b;
}

bool JsonScanner_Set(struct JsonScanner* scanner, const char* json)
{
	JsonScanner_Destroy(scanner);
	*scanner = JSONSCANNER_INIT;
	bool b = Stream_Set(&scanner->Stream, json);
	if (b) 
	{
		Stream_Match(&scanner->Stream);
	}
	return b;
}

void JsonScanner_Attach(struct JsonScanner* scanner, const char* json)
{
	JsonScanner_Destroy(scanner);
	*scanner = JSONSCANNER_INIT;
	Stream_Attach(&scanner->Stream, json);
	Stream_Match(&scanner->Stream);
}

void JsonScanner_Destroy(struct JsonScanner* scanner)
{
	Stream_Close(&scanner->Stream);
}

static wchar_t MatchChar(struct JsonScanner* scanner)
{
	scanner->LexemeSize++;
	return Stream_Match(&scanner->Stream);
}

static wchar_t MatchCharWith(struct JsonScanner* scanner, wchar_t wch)
{
	wchar_t ch = scanner->Stream.CurrentChar;
	if (ch == wch)
	{
		scanner->LexemeSize++;
		Stream_Match(&scanner->Stream);
		ch = scanner->Stream.CurrentChar;
	}
	else
	{
		//unexpected
	}
	return ch;
}

enum JSTokens JsonScanner_Match(struct JsonScanner* scanner)
{
	wchar_t ch = scanner->Stream.CurrentChar;

	while (ch == ' ' || ch == '\n' || ch == '\r' || ch == '\t')
	{
		Stream_Match(&scanner->Stream);
		ch = scanner->Stream.CurrentChar;
	}

	scanner->LexemeStart = scanner->Stream.CurrentBytePos;
	scanner->LexemeSize = 0;

	scanner->Token = TK_JS_NONE;
	ch = scanner->Stream.CurrentChar;

	if (ch == '{')
	{
		scanner->Token = TK_JS_LEFT_CURLY_BRACKET;
		MatchChar(scanner);
	}
	else if (ch == '}')
	{
		scanner->Token = TK_JS_RIGHT_CURLY_BRACKET;
		MatchChar(scanner);
	}
	else if (ch == '[')
	{
		scanner->Token = TK_JS_LEFT_SQUARE_BRACKET;
		MatchChar(scanner);
	}
	else if (ch == ']')
	{
		scanner->Token = TK_JS_RIGHT_SQUARE_BRACKET;
		MatchChar(scanner);
	}
	else if (ch == 'f')//false
	{
		scanner->Token = TK_JS_FALSE;
		MatchCharWith(scanner, L'f');
		MatchCharWith(scanner, L'a');
		MatchCharWith(scanner, L'l');
		MatchCharWith(scanner, L's');
		MatchCharWith(scanner, L'e');
	}
	else if (ch == 't')//true
	{
		scanner->Token = TK_JS_TRUE;
		MatchCharWith(scanner, L't');
		MatchCharWith(scanner, L'r');
		MatchCharWith(scanner, L'u');
		MatchCharWith(scanner, L'e');
	}
	else if (ch == 'n')//null
	{
		scanner->Token = TK_JS_NULL;
		MatchCharWith(scanner, L'n');
		MatchCharWith(scanner, L'u');
		MatchCharWith(scanner, L'l');
		MatchCharWith(scanner, L'l');
	}
	else if (ch == '"')
	{
		scanner->Token = TK_JS_STRING;

		scanner->LexemeStart++;

		Stream_Match(&scanner->Stream);
		ch = scanner->Stream.CurrentChar;

		for (;;)
		{
			if (ch == L'\\')
			{
				//scape
				ch = MatchChar(scanner);

				switch (ch)
				{
				case '"':
				case '/':
				case '\\':
				case 'b':
				case 'f':
				case 'n':
				case 'r':
				case 't':
					ch = MatchChar(scanner);
					break;
				default:
					break;
				}
			}
			else if (ch == '"')
			{
				Stream_Match(&scanner->Stream);
				ch = scanner->Stream.CurrentChar;
				break;
			}
			else
			{
				//qualquer coisa  
				ch = MatchChar(scanner);
			}
		}
	}
	else if (ch == ':')
	{
		ch = MatchChar(scanner);
		scanner->Token = TK_JS_COLON;
	}
	else if (ch == ',')
	{
		scanner->Token = TK_JS_COMMA;
		ch = MatchChar(scanner);
	}
	else if (ch == '-' || (ch >= '0' && ch <= '9'))
	{
		scanner->Token = TK_JS_NUMBER;

		ch = MatchChar(scanner);


		while (ch >= L'0' && ch <= L'9')
		{
			ch = MatchChar(scanner);
		}

		if (ch == L'.')
		{
			ch = MatchChar(scanner);

			while (ch >= L'0' && ch <= L'9')
			{
				ch = MatchChar(scanner);
			}
		}

		if (ch == L'E' || ch == L'e')
		{
			ch = MatchChar(scanner);

			if (ch == L'+' || ch == L'-')
			{
				ch = MatchChar(scanner);
			}

			while (ch >= L'0' && ch <= L'9')
			{
				ch = MatchChar(scanner);
			}
		}
	}
	else if (ch == '\0')
	{
		scanner->Token = TK_JS_EOF;
	}
	else
	{
		//error
	}
	return scanner->Token;
}




```



```cpp
#pragma once

struct Data
{
  void (*ExchangeBool)(struct Data* data, const char* name, bool* p);
  void (*ExchangeInt)(struct Data* data, const char* name, int* p);
  void (*ExchangeText)(struct Data* data, const char* name, char* p, int count);
};

void JsonLoad(const char* file, 
              void (*Exchange)(struct Data* data, void* p), 
              void* object);


int LoadCommandLine(int argc,
  char* argv[],
  void (*Exchange)(struct Data* data, void* p),
  void* object);

/*
How to use:

struct X {
  int id;
  bool bFlag;
  char name[10];
};

void ExchangeX(struct Data* data, void* p)
{
  struct X* x = (struct X*)p;
  data->ExchangeInt(data, "id", &x->id);
  data->ExchangeText(data, "name", x->name, 10);
  data->ExchangeBool(data, "flag", &x->bFlag);
}


struct X x = {0};

//test.json file is:
//
//{
//  "id" :  1,
//  "name": "teste",
//  "flag"  : true
//}

JsonLoad("test.json", ExchangeX, &x);

//In case you have this command line:
//--id 1 --name teste --flag

LoadCommandLine(argc, argv,  ExchangeX, &x);

*/


```


```cpp

#include <string.h>
#include <stdlib.h>
#include <stdbool.h>
#include "JsonExchange.h"
#include "JsonScanner.h"

struct ReadPropertyData
{
  struct Data data;
  enum JSTokens token;
  const char* key;
  int keyLen;
  const char* value;
  int valueLen;
  bool bStop;

};


static void ReadPropertyData_ExchangeBool(struct Data* data, const char* name, bool* p)
{
  struct ReadPropertyData* pData = (struct ReadPropertyData*)data;
  if (!pData->bStop &&
    strncmp(name, pData->key, pData->keyLen) == 0)
  {
    pData->bStop = true;
    *p = pData->token == TK_JS_TRUE;
  }
}

static void ReadPropertyData_ExchangeInt(struct Data* data, const char* name, int* p)
{
  struct ReadPropertyData* pData = (struct ReadPropertyData*)data;
  if (!pData->bStop &&
    pData->value != NULL &&
    strncmp(name, pData->key, pData->keyLen) == 0)
  {
    pData->bStop = true;
    *p = atoi(pData->value);
  }
}

static void ReadPropertyData_ExchangeString(struct Data* data, const char* name, char* p, int count)
{
  struct ReadPropertyData* pData = (struct ReadPropertyData*)data;
  if (!pData->bStop &&
    pData->value != NULL &&
    strncmp(name, pData->key, pData->keyLen) == 0)
  {
    pData->bStop = true;
    int n = pData->valueLen < count - 1 ? pData->valueLen : count - 1;
    strncpy(p, pData->value, n);
    p[n] = 0;

  }
}



void JsonLoad(const char* file,
  void (*Exchange)(struct Data* data, void* p),
  void* object)
{
  struct ReadPropertyData data = { 0 };

  data.data.ExchangeBool = ReadPropertyData_ExchangeBool;
  data.data.ExchangeInt = ReadPropertyData_ExchangeInt;
  data.data.ExchangeText = ReadPropertyData_ExchangeString;

  struct JsonScanner scanner = JSONSCANNER_INIT;
  if (JsonScanner_Open(&scanner, file))
  {
    JsonScanner_Match(&scanner); //TK_NONE
    enum JSTokens tk = JsonScanner_Match(&scanner); //{

    for (;;)
    {
      data.key = &scanner.Stream.data[scanner.LexemeStart];
      data.keyLen = scanner.LexemeSize;
      tk = JsonScanner_Match(&scanner); //name
      tk = JsonScanner_Match(&scanner); //:
      data.value = &scanner.Stream.data[scanner.LexemeStart];
      data.valueLen = scanner.LexemeSize;
      data.token = tk;
      tk = JsonScanner_Match(&scanner); //value

      data.bStop = false;
      Exchange(&data.data, object);

      if (tk != TK_JS_COMMA)
        break;
      tk = JsonScanner_Match(&scanner); //value
    }
  }


}

int LoadCommandLine(int argc,
  char* argv[],
  void (*Exchange)(struct Data* data, void* p),
  void* object)
{
  struct ReadPropertyData data = { 0 };

  data.data.ExchangeBool = ReadPropertyData_ExchangeBool;
  data.data.ExchangeInt = ReadPropertyData_ExchangeInt;
  data.data.ExchangeText = ReadPropertyData_ExchangeString;

  for (int i = 1; i < argc;)
  {
    data.bStop = false;

    if (argv[i][0] == '-' && argv[i][1] == '-')
    {
      data.key = &argv[i][2];
      data.keyLen = strlen(&argv[i][2]);

      //Este null evita que seja tentado em propriedades
      //nao boleanas
      data.value = NULL;
      data.valueLen = 0;
      data.token = TK_JS_TRUE;

      //Tenta como se fosse um flag
      Exchange(&data.data, object);

      if (data.bStop)
      {
        //conseguiu como um flag
        i++;
      }
      else
      {
        //nao era flag le mais um para pegar valor
        i++;
        if (i < argv)
        {
          data.value = argv[i];
          data.valueLen = strlen(argv[i]);
          data.token = TK_JS_NONE;
          Exchange(&data.data, object);
          i++;
        }
      }
    }
    else
    {
      i++;
    }
  }
}



```

```cpp

#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#include "JsonExchange.h"

struct X
{
  int id;
  bool bFlag;
  char name[10];
};


void ExchangeX(struct Data* data, void* p)
{
  struct X* x = (struct X*)p;
  data->ExchangeInt(data, "id", &x->id);
  data->ExchangeText(data, "name", x->name, 10);
  data->ExchangeBool(data, "flag", &x->bFlag);
}

void Test3()
{
  struct X x = {0};
  JsonLoad("test.json", ExchangeX, &x);
}

int main(int argc, char* argv[])
{
  //struct User user = { 0 };
  //ParseJsonObject("user.json", &User, &user);
  //Test2();
  Test3();

  struct X x = {0};
  LoadCommandLine(argc, argv,  ExchangeX, &x);
  
}
```

