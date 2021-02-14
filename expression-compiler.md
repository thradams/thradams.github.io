# Expression compiler

Given a expression this compiler generates C code that 
solves the expression and also reports errors.


```cpp

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>


struct stream
{
  const char* p;
};
#define ch(S) (*(S)->p)
#define match(S) ((S)->p++)

void parse_expression(struct stream* stream, char* r);

void parse_value(struct stream* stream, char* left)
{

  if (ch(stream) >= '0' && ch(stream) <= '9')
  {
    while (ch(stream) >= '0' && ch(stream) <= '9')
    {
      *left = ch(stream);
      left++;
      match(stream);
    }
    *left = 0;
  }
  else if (ch(stream) >= 'a' && ch(stream) <= 'z')
  {
    while (ch(stream) >= 'a' && ch(stream) <= 'z')
    {
      *left = ch(stream);
      left++;
      match(stream);
    }
    *left = 0;
  }
  else if (ch(stream) == '(')
  {
    match(stream);
    parse_expression(stream, left);
    match(stream);
  }
  else
  {
    //error
  }
}

void parse_expression(struct stream* stream, char* right)
{
  char left[100];


  if ((ch(stream) >= '0' && ch(stream) <= '9') ||
      (ch(stream) >= 'a' && ch(stream) <= 'z') ||
      ch(stream) == '(')
  {
    parse_value(stream, left);
  }
  else
  {
    parse_expression(stream, left);
  }

  char op = ch(stream);
  if (op == '*' || op == '/')
  {

    match(stream);
    parse_expression(stream, right);
    if (op == '*')
    {
      printf("  if((%s == -1) && (%s == INT_MIN)) /*overflow */ return 1;\n", left, right);
      printf("  if((%s == -1) && (%s == INT_MIN)) /*overflow */ return 1;\n", right, left);
      printf("  if(%s > INT_MAX / %s) /* overflow */ return 1;\n", left, right);
      printf("  if(%s < INT_MIN / %s) /* overflow */ return 1;\n", left, right);
    }
    else
    {
      printf("  if((%s == INT_MIN) && (%s == -1)) /* a / b would overflow */ return 1;\n", left, right);
    }
    printf("  r = %s %c %s;\n\n", left, op, right);

    strcpy(right, "r");
  }
  else if (op == '+' || op == '-')
  {


    match(stream);
    parse_expression(stream, right);
    if (op == '+')
    {
      printf("  if ((%s > 0) && (%s > INT_MAX - %s)) return 1; /*overflow*/\n", right, left, right);
      printf("  if ((%s < 0) && (%s < INT_MIN - %s)) return 1; /*underflow*/\n", right, left, right);
    }
    else
    {
      printf("  if ((%s < 0) && (%s > INT_MAX + %s)) return 1;\n", right, left, right);
      printf("  if ((%s > 0) && (%s < INT_MAX + %s)) return 1;\n", right, left, right);
    }

    printf("  r = %s %c %s;\n\n", left, op, right);
    strcpy(right, "r");
  }
  else
  {
    strcpy(right, left);
  }

}

void solve(const char* p)
{
  struct stream s = {.p = p};

  printf("\n");
  printf("/*%s*/\n", p);
  printf("int solve(int* result)\n");
  printf("{\n");
  printf("  int r;\n");

  char r[100];
  parse_expression(&s, r);

  printf("  *result = r;\n");
  printf("  return 0;\n");
  printf("}\n");
  printf("\n");
}

int main()
{
  for (;;)
  {
    char input[128] = {0};
    printf("> ");
    gets(input);
    solve(input);
  }
}

```

```cpp
/*a+b*c*/
int solve(int* result)
{
  int r;
  if((b == -1) && (c == INT_MIN)) /*overflow */ return 1;
  if((c == -1) && (b == INT_MIN)) /*overflow */ return 1;
  if(b > INT_MAX / c) /* overflow */ return 1;
  if(b < INT_MIN / c) /* overflow */ return 1;
  r = b * c;

  if ((r > 0) && (a > INT_MAX - r)) return 1; /*overflow*/
  if ((r < 0) && (a < INT_MIN - r)) return 1; /*underflow*/
  r = a + r;

  *result = r;
  return 0;
} 
```


