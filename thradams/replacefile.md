# Replacing parts of a file

Replacing lines that are between BEGIN INSERT and END INSERT

```cpp

#include <stdio.h>

#include <stdio.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <errno.h>
#include <string.h>
#include <stdbool.h>
#include <errno.h>
#include <varargs.h>
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <stdarg.h>


inline bool fread2(void* buffer, size_t size, size_t count, FILE* stream, size_t* sz)
{
    *sz = 0;//out

    bool result = false;
    size_t n = fread(buffer, size, count, stream);
    if (n == count) {
        *sz = n;
        result = true;
    }
    else if (n < count) {
        if (feof(stream))
        {
            *sz = n;
            result = true;
        }
    }
    return result;
}

char* readfile(const char* path)
{
    char* result = NULL;

    struct stat info;
    if (stat(path, &info) == 0)
    {
        char* data = (char*)malloc(sizeof(char) * info.st_size + 1);
        if (data != NULL)
        {
            FILE* file = fopen(path, "r");
            if (file != NULL)
            {
                if (info.st_size >= 3)
                {
                    size_t n = 0;
                    if (fread2(data, 1, 3, file, &n))
                    {
                        if (n == 3)
                        {
                            if (data[0] == (char)0xEF &&
                                data[1] == (char)0xBB &&
                                data[2] == (char)0xBF)
                            {
                                if (fread2(data, 1, info.st_size - 3, file, &n))
                                {
                                    //ok
                                    data[n] = 0;
                                    result = data; data = 0;
                                }
                            }
                            else if (fread2(data + 3, 1, info.st_size - 3, file, &n))
                            {
                                data[3 + n] = 0;
                                result = data; data = 0;
                            }
                        }
                        else
                        {
                            data[n] = 0;
                            result = data; data = 0;
                        }
                    }
                }
                else
                {
                    size_t n = 0;
                    if (fread2(data, 1, info.st_size, file, &n))
                    {
                        data[n] = 0;
                        result = data; data = 0;
                    }
                }
                fclose(file);
            }
            free(data);
        }
    }
    return result;
}


struct osstream
{
    char* c_str;
    int size;
    int capacity;
};


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

int savefile(const char* filename, const char* content)
{
    int result = 0;

    FILE* f = fopen(filename, "w");
    if (f)
    {
        int count = strlen(content);
        int result = fwrite(content, sizeof(char), count, f);
        if (count != result)
        {
            //fwrite error
            result = ferror(f);
        }
        fclose(f);
    }
    else
    {
        //fopen error
        result = errno;
    }

    return result;
}

int change_text(const char* filename, const char* newcontent)
{
    char* s = readfile("file.txt");
    if (s != NULL)
    {
        struct osstream ss = { 0 };
        const char* p1 = strstr(s, "<!--BEGIN INSERT-->");
        if (p1)
        {
            osstream_printf(&ss, "%.*s", (int)(p1 - s), s);
            osstream_printf(&ss, "<!--BEGIN INSERT-->\n");

            const char* p2 = strstr(p1 + 1, "<!--END INSERT-->");
            if (p2)
            {
                osstream_printf(&ss, "%s\n", newcontent);

                osstream_printf(&ss, "<!--END INSERT-->\n");
                osstream_printf(&ss, "%s", p2 + sizeof("<!--END INSERT-->"));
            }
        }
        free(s);
        savefile("file.txt", ss.c_str);
        osstream_close(&ss);
    }
    else
    {
        printf("%s\n", strerror(errno));
    }
    return 0;
}

int main()
{
    change_text("file.txt", "new content");
}

```
