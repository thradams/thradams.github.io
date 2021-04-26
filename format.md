

```cpp

#define _CRT_SECURE_NO_WARNINGS

#include <stdio.h>
#include <assert.h>
#include <string.h>
#include <stdarg.h>

int format(char* s, size_t n, const char* format, ...)
{
    const char* arg[10] = { 0 };
    _Static_assert(sizeof(arg) / sizeof(arg[0]) == 10, "0-9");

    va_list args;
    va_start(args, format);
    const char* p = format;
    while (*p)
    {
        if (*p == '%' && (*(p + 1) != '%'))
        {
            p++;
            int index = (*p - '0');
            if (index >= 0 && index <= 9)
            {
                if (arg[index] == 0)
                {
                    arg[index] = va_arg(args, char*);
                    printf("SET %d = %s\n", index, arg[index]);
                }
            }

        }
        p++;
    }
    va_end(args);


    p = format;
    int count = 0;
    while (*p)
    {
        if (*p == '%')
        {
            p++; //skip %
            if (*p >= '0' && *p <= '9')
            {
                int index = (*p - '0');
                const char* from = arg[index];
                
                if (from == NULL)
                {
                    from = "???";
                }

                while (from && *from)
                {
                    if (count < n - 1)
                    {
                        s[count] = *from;
                    }
                    count++;
                    from++;
                }
                p++;
            }
            else if (*p == '%')
            {
                if (count < n - 1)
                {
                    s[count] = *p;
                }
                count++;
                p++;
            }
            else
            {
                /*error?*/
            }
        }
        else
        {
            if (count < n - 1)
            {
                s[count] = *p;
            }
            count++;
            p++;
        }
    }

    if (count < n)
    {
        s[count] = 0;
    }
    else
    {
        if (n > 0)
          s[n - 1] = 0;
    }

    return count;
}

int main()
{
    printf("A %1$s B %2$s C %1$s", "ONE", "TWO");

    char buffer[50];
    int n = format(buffer, sizeof buffer, "A %% %1", "ONE");
    assert(strcmp(buffer, "A % ONE") == 0);
    assert(n == 7);

    n = format(buffer, sizeof buffer, "A %0 B %1 C %0", "ONE", "TWO");
    assert(n == 17);
    assert(strcmp(buffer, "A ONE B TWO C ONE") == 0);


    char buffer3[3];
    n = format(buffer3, sizeof buffer3, "%0", "ABC");
    assert(n == 3);
    assert(strcmp(buffer3, "AB") == 0);

}
```
