# Tips for Safe C programming


Check this code in your compiler with maximum warning level.

```cpp
#include <string.h>
int main()
{
    //A
    char buffer[3] = "abc";
    
    //B
    strcpy(buffer, "abc");

    //C
    char buffer4[4] ={0};
    strcpy(buffer, buffer4);

}
```


Visual C++ 2019 gave me just warning at B

```
 warning C6386: Buffer overrun while writing to 'buffer':  the writable size is '3' bytes, but '4' bytes might be written.
```

```cpp
#include <string.h>
int main()
{
    //A
    char buffer[] = "abc";
    
    //B
    strcpy(buffer, "abc");

    //C
    char buffer4[4] ={0};
    strcpy(buffer, buffer4);

}
```

