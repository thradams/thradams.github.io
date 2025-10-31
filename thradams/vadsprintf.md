

```cpp


int vadsprintf(char** str, int* sz, const char* fmt, va_list args)
{
    va_list tmpa;
    va_copy(tmpa, args);

    int size = vsnprintf(*str, *sz, fmt, tmpa);

    va_end(tmpa);

    if (size < 0)
    {
        return -1;
    }

    if ((size + 1) > *sz)
    {
        char* newstr = malloc(sizeof(char) * (size + 1));
        if (newstr == 0)
        {
            return -1;
        }

        size = vsprintf(newstr, fmt, args);
        if (size > 0)
        {
            *sz = size;
            free(*str);
            *str = newstr;
        }
    }

    return size;
}

int dsprintf(char** str, int* sz, const char* fmt, ...)
{
    va_list args;
    va_start(args, fmt);
    int size = vadsprintf(str, sz, fmt, args);
    va_end(args);
    return size;
}

int asprintf(char** ptr, const char* format, ...)
{
    //http://www.open-std.org/jtc1/sc22/wg14/www/docs/n1248.pdf
    char* str = 0;
    int sz = 0;
    va_list args;
    va_start(args, format);
    int size = vadsprintf(&str, &sz, format, args);
    if (size > 0)
    {
        *ptr = str;
    }
    va_end(args);
    return size;
}

int vasprintf(char** ptr, const char* format, va_list arg)
{
    //http://www.open-std.org/jtc1/sc22/wg14/www/docs/n1248.pdf
    char* str = 0;
    int sz = 0;
    
    int size = vadsprintf(&str, &sz, format, arg);
    if (size > 0)
    {
        *ptr = str;
    }
    
    return size;
}

void Test1()
{
    int sz = 11;
    char* text = malloc(sz);
    
    int r = dsprintf(&text, &sz, "ola %s", "thiago");
    free(text);
}

int main()
{
    Test1();
}


```

