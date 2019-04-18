# Stream


```c

Conversation opened. 2 messages. 1 message unread.

Skip to content
Using Gmail with screen readers

11 of 43,761
stream
Inbox
x
Thiago
x

Thiago Adams <thiago.adams@gmail.com>
Attachments
17:59 (4 hours ago)
to me


3 Attachments

Thiago Adams <thiago.adams@gmail.com>
Attachments
18:02 (4 hours ago)
to me



On Wed, 17 Apr 2019 at 17:59, Thiago Adams <thiago.adams@gmail.com> wrote:



-- 
www.thradams.com
3 Attachments

#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <assert.h>
#include <string.h>
#include <stdbool.h>

struct Stream
{
    //utf8 encoded text
    char* data;

    wchar_t CurrentChar;
    int CurrentLine;
    int CurrentCol;
    int CurrentBytePos;
    int NextBytePos;
};

#define STREAM_INIT {0}

wchar_t Stream_Match(struct Stream* stream);
void Stream_Close(struct Stream* stream);
void Stream_Attach(struct Stream* stream, char* text);
bool Stream_Set(struct Stream* stream, const char* text);
bool Stream_Open(struct Stream* stream, const char* path);
wchar_t Stream_LookAhead(const struct Stream* stream);
wchar_t Stream_Match(struct Stream* stream);
void Stream_Close(struct Stream* stream);

```

```c

Conversation opened. 2 messages. 1 message unread.

Skip to content
Using Gmail with screen readers

11 of 43,761
stream
Inbox
x
Thiago
x

Thiago Adams <thiago.adams@gmail.com>
Attachments
17:59 (4 hours ago)
to me


3 Attachments

Thiago Adams <thiago.adams@gmail.com>
Attachments
18:02 (4 hours ago)
to me



On Wed, 17 Apr 2019 at 17:59, Thiago Adams <thiago.adams@gmail.com> wrote:



-- 
www.thradams.com
3 Attachments

#include "Stream.h"

#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <assert.h>
#include <string.h>
#include <assert.h>



void Stream_Attach(struct Stream* stream, char* text)
{
    Stream_Close(stream);
    stream->data = text;        
}

bool Stream_Set(struct Stream* stream, const char* text)
{
    char* data = _strdup(text);
    if (data)
    {
        Stream_Attach(stream, data);
    }
    return data != NULL;
}

bool Stream_Open(struct Stream* stream, const char* path)
{
    bool result = false;
    struct _stat info;
    int r = _stat(
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

static wchar_t Stream_ReadNextChar(const struct Stream* stream, int* bytes)
{
    //https://www.ietf.org/rfc/rfc3629.txt
    //https://www.fileformat.info/info/unicode/utf8.htm

    unsigned u = EOF;
    int currentPos = stream->NextBytePos;
    if (stream->data != NULL)
    {
        int c = stream->data[currentPos];

        if (c == '\0' /*EOF*/)
        {
            u = EOF;
        }
        else if ((c & 0x80) == 0)
        {
            currentPos++;
            u = c;
        }
        else if ((c & 0xC0) == 0x80)
        {
            u = EOF;
        }
        else
        {
            currentPos++;
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
                    c = stream->data[currentPos];
                    currentPos++;

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
                        currentPos--;
                        break;
                    }
                }
            }
        }
    }

    *bytes = currentPos - stream->NextBytePos;
    return u;
}

wchar_t Stream_LookAhead(const struct Stream* stream)
{
    int bytes = 0;
    wchar_t ch =
        Stream_ReadNextChar(stream, &bytes);

    return ch;
}

wchar_t Stream_Match(struct Stream* stream)
{
    //assert(stream->data != NULL);

    int bytes = 0;
    wchar_t ch =
        Stream_ReadNextChar(stream, &bytes);

    if (stream->CurrentLine == 0)
    {
        stream->CurrentLine = 1;
    }

    if (bytes > 0)
    {
        stream->CurrentBytePos = stream->NextBytePos;
        stream->NextBytePos += bytes;
        stream->CurrentCol++;
        
        if (ch == '\n')
        {
            stream->CurrentLine++;
            stream->CurrentCol = 0;
        }
    }
    stream->CurrentChar = ch;
    return ch;
}

void Stream_Close(struct Stream* stream)
{
    free(stream->data);
    stream->CurrentCol = 0;
    stream->CurrentLine = 0;
    stream->NextBytePos = 0;
    stream->CurrentBytePos = 0;
}


```


```c

Conversation opened. 2 messages. 1 message unread.

Skip to content
Using Gmail with screen readers

11 of 43,761
stream
Inbox
x
Thiago
x

Thiago Adams <thiago.adams@gmail.com>
Attachments
17:59 (4 hours ago)
to me


3 Attachments

Thiago Adams <thiago.adams@gmail.com>
Attachments
18:02 (4 hours ago)
to me



On Wed, 17 Apr 2019 at 17:59, Thiago Adams <thiago.adams@gmail.com> wrote:



-- 
www.thradams.com
3 Attachments

#include  "Stream.h"
#include <assert.h>
#include <fcntl.h>
#include <io.h>

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

    assert(stream.CurrentCol == 0);
    assert(stream.CurrentLine == 0);
    assert(stream.CurrentChar == 0);
    assert(stream.NextBytePos == 0);
    assert(stream.data == NULL);


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
        assert(stream.NextBytePos == 1);

        Stream_Match(&stream);
        assert(stream.CurrentCol == 2);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == 'a');

        assert(Stream_LookAhead(&stream) == L'ç');

        Stream_Match(&stream);
        assert(stream.CurrentCol == 3);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == L'ç');

        Stream_Match(&stream);
        assert(stream.CurrentCol == 4);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == L'ã');

        Stream_Match(&stream);
        assert(stream.CurrentCol == 4);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == (wchar_t)EOF);
    }

    Stream_Close(&stream);
}

void Test2()
{
    struct Stream stream = STREAM_INIT;
    
    if (Stream_Open(&stream, "bomutf8empty.txt"))
    {
        assert(stream.CurrentCol == 0);
        assert(stream.CurrentLine == 0);
        assert(stream.CurrentChar == 0);
        assert(stream.NextBytePos== 0);

        Stream_Match(&stream);

        assert(stream.CurrentCol == 0);
        assert(stream.CurrentLine == 1);
        assert(stream.CurrentChar == WEOF);
        assert(stream.NextBytePos == 0);
    }

    Stream_Close(&stream);
}

void Test0()
{
    struct Stream stream = STREAM_INIT;

    assert(stream.CurrentCol == 0);
    assert(stream.CurrentLine == 0);
    assert(stream.CurrentChar == 0);

    Stream_Match(&stream);

    Stream_Close(&stream);
}


void PrintLine(const char* source, int pos)
{
    const char* pHead = source[pos];
    while (pHead > source)
    {
        if (*pHead == '\n')
            break;
        pHead--;
    }

    const char* pTail = source[pos];
    while (*pTail)
    {
        if (*pTail == '\n')
            break;
        pTail--;
    }
}

int main()
{
    _setmode(_fileno(stdout), _O_U16TEXT);
    
    Test0();
    Test1();
    Test1L();
    Test2();
    Test3();


   wprintf(L"maçã");
}

```

