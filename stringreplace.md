
The strdup function is usefull for initialization.
This function is an alternative for repetive calls of  free(p); p = strdup(s);

```cpp

char* strrep1(char* dest, const char* source)
{    
    char* p = realloc(dest, strlen(source) + 1);
    if (p != NULL) {   
        strcpy(p, source);
    }   
    return p;
}

char* strrep2(char* dest, const char* source)
{
    char* p = malloc(strlen(source) + 1);
    if (p != NULL)
    {
        free(dest);
        strcpy(p, source);
    }
    else
    {
        //returns the source unchanged
        p = source;
    }
    return p;
}

size_t strrep3(char** dest, const char* source)
{
    size_t sourcelen = strlen(source);    
    char* p = malloc(sourcelen + 1);
    if (p != NULL)
    {
        free(*dest);
        *dest = p;
        strcpy(p, source);
    }
    else
    {
        sourcelen = 0;
    }

    return sourcelen;
}

```

