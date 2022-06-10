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


sample["Static_assert C11/C23"] =
    `
/*
  _Static_assert(condition, "text"); //C11 C23
  _Static_assert(condition); //C23
*/

int main()
{
    _Static_assert(1 == 1, "error");
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

    SWAP(a, b);
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

