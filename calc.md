
## Simple expression parser.

June 2020

grammar:
```


  Value    : [0-9.]+ | '(' Expr ')'
  Product : Expr (('*' | '/') Expr)*
  Sum      : Expr (('+'  | '-') Expr)*
  Expr      :   Product | Sum | Value

```

```cpp

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

struct stream {char* p;};
#define ch(S) (*(S)->p)
#define match(S) ((S)->p++)

int parse_expression(struct stream* stream);

int parse_value(struct stream* stream) {
    
    int result = 0;
    if (ch(stream) >= '0' && ch(stream) <= '9') {
        result = atoi(stream->p);
        while (ch(stream) >= '0' && ch(stream) <= '9')
            match(stream);
    }
    else if (ch(stream) == '(') {
        match(stream);
        result = parse_expression(stream);
        match(stream);
    }
    else {
        //error
    }
    return result;
}


int parse_expression(struct stream* stream)
{
    int result = 0;
    int left = 0;
    if ((ch(stream) >= '0' && ch(stream) <= '9') || ch(stream) == '(') {
        left = parse_value(stream);
    }
    else  {
        left = parse_expression(stream);
    }

    char op = ch(stream);
    if (op == '*' || op == '/')
    {
        match(stream);
        int right = parse_expression(stream);
        result = op == '*' ? left * right : left / right;
    }
    else if (op == '+' || op == '-') {
        match(stream);
        int right = parse_expression(stream);
        result = op == '+' ? left + right : left - right;
    }
    else {
        result = left;
    }
    return result;
}

int solve(const char* p)
{
    struct stream s = { .p = p };
    int r = parse_expression(&s);
}

int main() {

    for (;;)
    {
        char input[128] = { 0 };
        printf("> ");
        gets(input);
        int result = solve(input);
        printf("\t%d\n", result);
    }
}

```
