
The strdup function is usefull for initialization.
This function is an alternative for repetive calls of  free(p); p = strdup(s);

```cpp


#include <stdio.h>
#include <string.h>
#include <stdlib.h>

struct Person
{
    char* name;
};

char* strnt(const char* source)
{
    size_t sourcelen = strlen(source);
    char* p = malloc(sourcelen + 1);
    if (p != NULL)
    {
        strcpy(p, source);
    }
    return p;
}

size_t strrep(char** dest, const char* source)
{
    size_t sourcelen = strlen(source);
    char* p = realloc(*dest, sourcelen + 1);
    if (p != NULL)
    {
        *dest = p;
        strcpy(p, source);
    }
    else
    {
        sourcelen = 0;
    }

    return sourcelen;
}

int main()
{
    char* name = strnt("test");
    struct Person person = { 0 };
    strrep(&person.name, "new name");
    strrep(&person.name, "new name2");
    
    strrep(&name, "new name3");
    

    free(person.name);
    free(name);
}


```

