# Error object

We need this when error codes are insufficient.

```cpp
#include <stdio.h>
#include <stdarg.h> 
#include <assert.h>
#include <assert.h>

struct error
{
    char* message;
    int capacity;
    int code;
};

/*
  The seterror function returns the number of characters that are written,
  not counting the terminating null character. 
  
  If the buffer size specified by er->capacity isn't sufficiently large to contain 
  the output specified by format and argptr, the return value of seterror is the 
  number of characters that would be written, not counting the null character, 
  if er->capacity were sufficiently large.
  
  If the return value is greater than count - 1, the output has been truncated. 
  
  A return value of -1 indicates that an encoding error has occurred.
*/
int seterror(struct error* er, _In_z_ _Printf_format_string_  const char* fmt, ...)
{
    /*the usage follow a pattern that the error is set just once*/
    assert(er->message[0] == 0);
    assert(er->code == 0);
    assert(er->capacity >= 0);

    er->code = 1;

    va_list args;
    va_start(args, fmt);
    int n = vsnprintf(er->message, er->capacity, fmt, args);
    va_end(args);
  
    return n;
}

void clearerror(struct error* err)
{
    err->code = 0;
    err->message[0] = 0;
}

int F(struct error* err)
{
    if (1)
    {
        seterror(err, "some error");
    }
    return err->code;
}

int main()
{
    struct error err = { .message = (char[100]) {0}, .capacity = 100 };
    
    if (F(&err) != 0)
    {
       printf("%s", err.message);
    }
} 

```

Getting the error message from windows GetLastError
```cpp
  FormatMessageA(FORMAT_MESSAGE_FROM_SYSTEM, "", GetLastError(), 0, err->message, err->capacity, NULL);        
```

Getting the error message from errno. 

```cpp
   
   strerror_s(err->message, err->capacity, errno);   
```

