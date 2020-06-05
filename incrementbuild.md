

This code opens a file and searchs for  BUILD_NUMBER followed by spaces and integer. Then increments the number
and saves the file.

It can be used for automated build.


```cpp
#include "stream.h"

#include "osstream.h"
#include <string.h>

enum token {
    TK_NUMBER,
    TK_IDENTIFIER,
    TK_SPACES,
    TK_OTHER,

    TK_END
};

/**
 * Encode a code point using UTF-8
 *
 * @author Ondřej Hruška <ondra@ondrovo.com>
 * @license MIT
 *
 * @param out - output buffer (min 5 characters), will be 0-terminated
 * @param utf - code point 0-0x10FFFF
 * @return number of bytes on success, 0 on failure (also produces U+FFFD, which uses 3 bytes)
 */
int utf8_encode(char* out, int utf)
{
    if (utf <= 0x7F) {
        // Plain ASCII
        out[0] = (char)utf;
        out[1] = 0;
        return 1;
    }
    else if (utf <= 0x07FF) {
        // 2-byte unicode
        out[0] = (char)(((utf >> 6) & 0x1F) | 0xC0);
        out[1] = (char)(((utf >> 0) & 0x3F) | 0x80);
        out[2] = 0;
        return 2;
    }
    else if (utf <= 0xFFFF) {
        // 3-byte unicode
        out[0] = (char)(((utf >> 12) & 0x0F) | 0xE0);
        out[1] = (char)(((utf >> 6) & 0x3F) | 0x80);
        out[2] = (char)(((utf >> 0) & 0x3F) | 0x80);
        out[3] = 0;
        return 3;
    }
    else if (utf <= 0x10FFFF) {
        // 4-byte unicode
        out[0] = (char)(((utf >> 18) & 0x07) | 0xF0);
        out[1] = (char)(((utf >> 12) & 0x3F) | 0x80);
        out[2] = (char)(((utf >> 6) & 0x3F) | 0x80);
        out[3] = (char)(((utf >> 0) & 0x3F) | 0x80);
        out[4] = 0;
        return 4;
    }
    else {
        // error - use replacement character
        out[0] = (char)0xEF;
        out[1] = (char)0xBF;
        out[2] = (char)0xBD;
        out[3] = 0;
        return 0;
    }
}

enum token read_token(struct stream* s, char* buffer)
{
    if (s->CurrentChar == (wchar_t)(-1))
    {
        return TK_END;
    }

    enum token tk = TK_OTHER;
    if (s->CurrentChar >= '0' && s->CurrentChar <= '9')
    {
        tk = TK_NUMBER;
        while (s->CurrentChar >= '0' && s->CurrentChar <= '9')
        {
            *buffer = (char)s->CurrentChar;
            buffer++;
            stream_match(s);
        }
    }
    else if (s->CurrentChar == ' ')
    {
        tk = TK_SPACES;
        while (s->CurrentChar == ' ')        
        {
            *buffer = (char)s->CurrentChar;
            buffer++;
            stream_match(s);
        }
    }
    else if ((s->CurrentChar >= 'a' && s->CurrentChar <= 'z') ||
             (s->CurrentChar >= 'A' && s->CurrentChar <= 'Z') ||
             s->CurrentChar == '_')
    {
        tk = TK_IDENTIFIER;
        while ((s->CurrentChar >= 'a' && s->CurrentChar <= 'z') ||
               (s->CurrentChar >= 'A' && s->CurrentChar <= 'Z') ||
               s->CurrentChar == '_') 
        {
            *buffer = (char)s->CurrentChar;
            buffer++;
            stream_match(s);
        }
    }
    else
    {
        int count = utf8_encode(buffer, s->CurrentChar);
        buffer += count;        
        stream_match(s);
    }

    *buffer = 0;
    return tk;
}

void increment_build(const char* input)
{
    struct stream s = { 0 };
    struct osstream os = { 0 };

    if (stream_fopen(&s, input))
    {
        stream_match(&s);

        char buffer[400];
        enum token tk = read_token(&s, buffer);
        if (tk != TK_END)
        {
            osstream_printf(&os, "%s", buffer);
        }
        while (tk != TK_END)
        {


            tk = read_token(&s, buffer);
            if (tk == TK_IDENTIFIER && strcmp(buffer, "BUILD_NUMBER") == 0)
            {
                osstream_printf(&os, "%s", buffer);
                tk = read_token(&s, buffer);

                osstream_printf(&os, "%s", buffer);

                tk = read_token(&s, buffer);
                int n = atoi(buffer);
                n++;
                osstream_printf(&os, "%d", n);
            }
            else if (tk != TK_END)
            {
                osstream_printf(&os, "%s", buffer);
            }
        }
    }

    stream_close(&s);

    FILE* f = fopen(input, "w");
    if (f != NULL)
    {
        fprintf(f, "%s", os.c_str);
        fclose(f);
    }
    osstream_close(&os);

}


```

```cpp

#include <stdio.h>
#include <stdlib.h>
//#include <sys/types.h>
//#include <sys/stat.h>
#include <assert.h>
#include <string.h>
#include <assert.h>
#include <ctype.h>
#include <stdbool.h>
#include <stddef.h>

struct stream
{
    const char* data; //utf8 encoded

    wchar_t CurrentChar;
    int CurrentLine;
    int CurrentCol;
    int CurrentBytePos;
    int NextBytePos;
};


#define STREAM_INIT {0}


wchar_t stream_match(struct stream* stream);


void stream_close(struct stream* stream);

void stream_attach(struct stream* stream, const char* text);
bool stream_set(struct stream* stream, const char* text);
bool stream_fopen(struct stream* stream, const char* path);
wchar_t stream_look_ahead(const struct stream* stream);
wchar_t stream_look_ahead_twice(const struct stream* stream, wchar_t* ch2);

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

#include "stream.h"


#if defined(_WIN32) || defined(_WIN64) || defined(__WIN32__) || defined(__WINDOWS__)
#define stat _stat
#define strdup _strdup
#endif


void stream_attach(struct stream* stream, const char* text)
{
    stream_close(stream);
    stream->data = text;
}

bool stream_set(struct stream* stream, const char* text)
{
    char* data = strdup(text);
    if (data)
    {
        stream_attach(stream, data);
    }
    return data != NULL;
}

bool stream_fopen(struct stream* stream, const char* path)
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
                stream_attach(stream, data);
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

wchar_t stream_look_ahead(const struct stream* stream)
{
    int bytes = 0;
    wchar_t ch =
        ReadNextChar(stream->data, stream->NextBytePos, &bytes);

    return ch;
}

wchar_t stream_look_ahead_twice(const struct stream* stream, wchar_t* ch2)
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

wchar_t stream_match(struct stream* stream)
{

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

void stream_close(struct stream* stream)
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
#include <errno.h>
#include <varargs.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>

struct osstream
{
    char* c_str;
    int size;
    int capacity;
};


int osstream_putc(int ch, struct osstream* sb);

int osstream_close(struct osstream* stream);


int osstream_vafprintf(struct osstream* stream, const char* fmt, va_list args);

int osstream_printf(struct osstream* stream, const char* fmt, ...);

```

```cpp
#include "osstream.h"


int osstream_putc(int ch, struct osstream* sb)
{
    if (sb->size + 1 > sb->capacity)
    {
        int n = sb->capacity + sb->capacity / 2;
        if (n < sb->size + 1)
        {
            n = sb->size + 1;
        }

        char* pnew = sb->c_str;
        pnew = (char*)realloc(pnew, (n + 1) * sizeof(char));
        if (pnew)
        {
            sb->c_str = pnew;
            sb->capacity = n;
        }
        else
        {
            errno = ENOMEM;
            ch = EOF;
        }
    }

    if (ch != EOF)
    {
        sb->c_str[sb->size] = ch;
        sb->c_str[sb->size + 1] = 0;
        sb->size++;
    }

    return ch;
}

int osstream_close(struct osstream* stream)
{
    free(stream->c_str);
    return 0;
}


int osstream_vafprintf(struct osstream* stream, const char* fmt, va_list args)
{
    int size = 0;
    va_list tmpa;

    va_copy(tmpa, args);

    size = vsnprintf(stream->c_str + stream->size, stream->capacity - stream->size, fmt, tmpa);

    va_end(tmpa);

    if (size < 0)
    {
        return -1;
    }

    if (stream->size + size > stream->capacity)
    {
        char* pnew = stream->c_str;
        pnew = (char*)realloc(pnew, (stream->size + size + 1) * sizeof(char));
        if (pnew)
        {
            stream->c_str = pnew;
            stream->capacity = stream->size + size;
        }
        else
        {
            errno = ENOMEM;
            size = -1;
        }
    }

    size = vsprintf(stream->c_str + stream->size, fmt, args);
    if (size > 0)
    {
        stream->size += size;
    }
    return size;
}

int osstream_printf(struct osstream* stream, const char* fmt, ...)
{
    va_list args;
    va_start(args, fmt);
    int size = osstream_vafprintf(stream, fmt, args);
    va_end(args);
    return size;
}

```

