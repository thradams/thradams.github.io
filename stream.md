# Stream

UTF8 Stream object. It uses memory to keep the text.

Can load files or use strings.

Can track the position in memory. (line col bytepos)

Sample
```cpp
#include  "Stream.h"
#include <assert.h>
#include <fcntl.h>
#include <ctype.h>
#include <stddef.h>
#include <stdio.h>

#if defined(_WIN32) || defined(_WIN64) || defined(__WIN32__) || defined(__WINDOWS__)
#include <io.h>
#include <windows.h>
#endif

void PrintLine(const char* source, int pos, int col)
{
	const char* pHead = source + pos;
	while (pHead > source)
	{
		if (*pHead == '\n')
		{
			pHead++;
			break;
		}
		pHead--;
	}

	const char* pTail = source + pos;
	while (*pTail)
	{
		if (*pTail == '\n')
			break;
		pTail++;
	}

#if defined(_WIN32) || defined(_WIN64) || defined(__WIN32__) || defined(__WINDOWS__)
	   UINT oldcp = GetConsoleOutputCP();
	    SetConsoleOutputCP(CP_UTF8);
#endif
		printf("%.*s\n", (int) (pTail - pHead), pHead);
		for (int i = 1; i < pTail - pHead; i++)
		{
			if (i < col)
				printf(" ");			
			else
			{
				printf("^");
				break;
			}
		}
		
#if defined(_WIN32) || defined(_WIN64) || defined(__WIN32__) || defined(__WINDOWS__)
		SetConsoleOutputCP(oldcp);
#endif
	//}
}


void Test3()
{
    struct Stream stream = STREAM_INIT;

    assert(stream.CurrentCol == 0);
    assert(stream.CurrentLine == 0);
    assert(stream.CurrentChar == 0);
    assert(stream.NextBytePos == 0);
    assert(stream.data == NULL);

    //Stream_Set(&stream, u8"maçã");
    if (Stream_Set(&stream, u8"ábç\n dêf\n"))
    {
        assert(stream.CurrentCol == 0);
        assert(stream.CurrentLine == 0);
        assert(stream.CurrentChar == 0);
        assert(stream.NextBytePos == 0);
        assert(stream.data != NULL);


        Stream_Match(&stream);

        assert(stream.CurrentCol == 1);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == L'á');
        assert(stream.NextBytePos == 2);

        Stream_Match(&stream);
        assert(stream.CurrentCol == 2);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == L'b');
        assert(stream.NextBytePos == 3);

        Stream_Match(&stream);
        assert(stream.CurrentCol == 3);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == L'ç');
        assert(stream.NextBytePos == 5);

        Stream_Match(&stream);
        assert(stream.CurrentCol == 0);
        assert(stream.CurrentLine == 2);
        assert(stream.CurrentChar == L'\n');
        assert(stream.NextBytePos == 6);

        Stream_Match(&stream);
        assert(stream.CurrentCol == 1);
        assert(stream.CurrentLine == 2);
        assert(stream.CurrentChar == L' ');
        assert(stream.NextBytePos == 7);

        Stream_Match(&stream);
        assert(stream.CurrentCol == 2);
        assert(stream.CurrentLine == 2);
        assert(stream.CurrentChar == L'd');
        assert(stream.NextBytePos == 8);

		PrintLine(stream.data, stream.CurrentBytePos, stream.CurrentCol);

        Stream_Match(&stream);
        assert(stream.CurrentCol == 3);
        assert(stream.CurrentLine == 2);
        assert(stream.CurrentChar == L'ê');
        assert(stream.NextBytePos == 10);

        Stream_Match(&stream);
        assert(stream.CurrentCol == 4);
        assert(stream.CurrentLine == 2);
        assert(stream.CurrentChar == L'f');
        assert(stream.NextBytePos == 11);

        Stream_Match(&stream);
        assert(stream.CurrentCol == 0);
        assert(stream.CurrentLine == 3);
        assert(stream.CurrentChar == L'\n');
        assert(stream.NextBytePos == 12);

    }

    Stream_Close(&stream);
}



void Test1()
{
    struct Stream stream = STREAM_INIT;

    //Stream_Set(&stream, u8"maçã");
    if (Stream_Open(&stream, "utf8maca.txt"))
    {
        assert(stream.CurrentCol == 0);
        assert(stream.CurrentLine == 0);
        assert(stream.CurrentChar == 0);
        assert(stream.NextBytePos == 0);
        assert(stream.data != NULL);


        Stream_Match(&stream);

        assert(stream.CurrentCol == 1);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == 'm');
        assert(stream.CurrentBytePos == 0);
        assert(stream.NextBytePos == 1);

        Stream_Match(&stream);
        assert(stream.CurrentCol == 2);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == 'a');        
        assert(stream.CurrentBytePos == 1);
        assert(stream.NextBytePos == 2);

        assert(Stream_LookAhead(&stream) == L'ç');

        Stream_Match(&stream);
        assert(stream.CurrentCol == 3);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == L'ç');
        assert(stream.CurrentBytePos == 2);
        assert(stream.NextBytePos == 4);

        Stream_Match(&stream);
        assert(stream.CurrentCol == 4);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == L'ã');

        Stream_Match(&stream);
        assert(stream.CurrentCol == 4);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == (wchar_t)EOF);

        Stream_Match(&stream);
        assert(stream.CurrentCol == 4);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == (wchar_t)EOF);
    }

    Stream_Close(&stream);
}


void Test1L()
{
    struct Stream stream = STREAM_INIT;


    if (Stream_Set(&stream, u8"maçã"))
    {
        assert(stream.CurrentCol == 0);
        assert(stream.CurrentLine == 0);
        assert(stream.CurrentChar == 0);
        assert(stream.NextBytePos == 0);
        assert(stream.data != NULL);


        Stream_Match(&stream);

        assert(stream.CurrentCol == 1);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == 'm');
        assert(stream.CurrentBytePos == 0);
		assert(stream.NextBytePos == 1);

        Stream_Match(&stream);
        assert(stream.CurrentCol == 2);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == 'a');
		assert(stream.CurrentBytePos == 1);
		assert(stream.NextBytePos == 2);

        assert(Stream_LookAhead(&stream) == L'ç');


		wchar_t ch2;
		wchar_t ch1=  Stream_LookAhead2(&stream, &ch2);
		assert(ch1 == L'ç' && ch2 == L'ã');

        Stream_Match(&stream);
        assert(stream.CurrentCol == 3);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == L'ç');

	
		ch1 = Stream_LookAhead2(&stream, &ch2);
		assert(ch1 == L'ã' && ch2 == WEOF);

        Stream_Match(&stream);
        assert(stream.CurrentCol == 4);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == L'ã');
		assert(stream.CurrentBytePos== 4);
		assert(stream.NextBytePos == 6);


		ch1 = Stream_LookAhead2(&stream, &ch2);
		assert(ch1 == WEOF && ch2 == WEOF);

        Stream_Match(&stream);
        assert(stream.CurrentCol == 5);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == (wchar_t)EOF);
		assert(stream.CurrentBytePos == 6);
		assert(stream.NextBytePos == 6);


		Stream_Match(&stream);
		assert(stream.CurrentCol == 5);
		assert(stream.CurrentLine == 1);
		assert(stream.CurrentChar == (wchar_t)EOF);
		assert(stream.CurrentBytePos == 6);
		assert(stream.NextBytePos == 6);
    }

    Stream_Close(&stream);
}

void Test2()
{
    struct Stream stream = STREAM_INIT;
    
    if (Stream_Open(&stream, "utf8maca.txt"))
    {
        assert(stream.CurrentCol == 0);
        assert(stream.CurrentLine == 0);
        assert(stream.CurrentChar == 0);
        assert(stream.NextBytePos== 0);

        Stream_Match(&stream);

        assert(stream.CurrentCol == 0);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == EOF);
        assert(stream.NextBytePos == 0);
    }

    Stream_Close(&stream);
}

void EmptyTest()
{
    struct Stream stream = STREAM_INIT;

    assert(stream.CurrentCol == 0);
    assert(stream.CurrentLine == 0);
    assert(stream.CurrentChar == 0);
	assert(stream.CurrentBytePos== 0);
	assert(stream.NextBytePos == 0);
	assert(stream.data == 0);

    Stream_Match(&stream);

	assert(stream.CurrentCol == 0);
	assert(stream.CurrentLine == 0);
	assert(stream.CurrentChar == 0);
	assert(stream.CurrentBytePos == 0);
	assert(stream.NextBytePos == 0);
	assert(stream.data == 0);


	
	assert(Stream_LookAhead(&stream) == (wchar_t)EOF);

    Stream_Close(&stream);

	assert(stream.CurrentCol == 0);
	assert(stream.CurrentLine == 0);
	assert(stream.CurrentChar == 0);
	assert(stream.CurrentBytePos == 0);
	assert(stream.NextBytePos == 0);
	assert(stream.data == 0);
}



int main()
{
    //_setmode(_fileno(stdout), _O_U16TEXT);
    
    EmptyTest();
    Test1();
    Test1L();
    Test2();
    Test3();


   //wprintf(L"maçã");
}
```

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

/*
Description:
    The Stream_Match function updates the values of CurrentLine
	CurrentCol, CurrentBytePos and NextBytePos to represent the 
	next character.
	For convenience the updated CurrentChar is returned.
*/
wchar_t Stream_Match(struct Stream* stream);

/*
Description:
	The Stream_Close reset the  Stream object for this initial state.
*/
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

