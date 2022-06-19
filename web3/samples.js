var sample = {};



sample["Digit Separator C23"] =
`
int main()
{
    int a = 1000'00;
    _Static_assert(1000'00 == 100000);
}
`;

sample["Binary Literal C23"] =
`

int main()
{
    int a = 0b1010;
    int b = 0B1010;
}
`;


sample["_Static_assert static_assert"] =
    `
int main()
{
    _Static_assert(1 == 1, "error");
    static_assert(1 == 1, "error");
    static_assert(1 == 1);
}
`;


sample["elifdef  elifndef C23"] =
`
/*
  C23 preprocessing directives elifdef and elifndef N2645
*/
#define Y

#ifdef X
#define VERSION 1
#elifdef  Y
#define VERSION 2
#else
#define VERSION 3
#endif

_Static_assert(VERSION == 4, "");

`;


sample["if with initialization C23?"] =
    `
#include <stdio.h>

int main()
{
   int size = 10;
   if (FILE* f = fopen("file.txt", "r"); f)
   {
     /*...*/
     fclose(f);
   }
}
`;


sample["empty initializer C23"] =
    `
int main()
{
    struct X {
        int i;
    } x = {};

    x = (struct X) {};

    struct Y
    {
        struct X x;
    } y = { {} };
}

`;

sample["C23 typeof"] =
`
#define SWAP(a, b) \\
  do {\\
    typeof(a) temp = a; a = b; b = temp; \\
  } while (0)

#pragma expand SWAP

int main()
{
    int a = 1;
    typeof(a) b = 1;
    typeof(int*) p1, p2;
    SWAP(a, b);

    struct { int i; } x;
    typeof(x) x2;
    typeof(x) x3;
}

`;


sample["Literal function (lambdas) (extension)"] =
`
#include <stdio.h>
#include <stdlib.h>
extern char* strdup(const char* s);

void async(void* capture, int sz, void (*F)(void* data))
{
  /*
    The real function would copy capture and the function pointer
    to a queue and then execute at some thread pool
  */
  F(capture);
}

void dispatch(void* capture, int sz, void (*F)(void* data))
{
  /*
    The real function would copy capture and the function pointer
    to a queue and then execute sequencially.
  */
  F(capture);
}


void create_app(const char* appname)
{
  printf("main thread\\n");
 
  struct capture {
     char * name;
  } capture = { .name = strdup(appname) };

  async(&capture, sizeof capture, (void (void* p))
  {
    struct capture* capture = p;
    printf("this is running at any thread (name=%s)\\n", capture->name);

    dispatch(capture, sizeof *capture, (void (void* p) )
    {
      struct capture* capture = p;
      printf("back to main thread\\n");
      free(capture->name);
    });
  });
}

int main()
{
  create_app("string");
  return 0;
}

`;

sample["little of semantics analysis"] =
    `
int main()
{
    int a = 1;
    *a = 2; //error

    struct X { int i; }x;
    x.j = 1;
   
}

`;

