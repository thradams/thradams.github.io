
```cpp


#include <stdio.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <errno.h>
#include <string.h>
#include <stdbool.h>


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

```

```cpp
int main()
{
    char* s = readfile("teste.txt");
    if (s != NULL)
    {
        free(s);
    }
    else
    {
        printf("%s\n", strerror(errno));
    }
}
```
