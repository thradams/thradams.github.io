## Arrays with size

1 - Sample using C VLAs syntax


```c
int find(int key, int len, int a[len])
{
  for (int i = 0; i < len; i++)
  {
    if (a[i] == key)
    {
      return i;
    }
  }
  return -1;
}
```

2 - Sample using arrays with size

```c
  
  int b[2][3] = { {0,1,2}, {3,4,5} };
  int (*pb)[2][3] = &b;

  int n, m;
  int(*pb)[n][m] = 0;

  //warning C6386: Buffer overrun while writing to 'p[8]':
  //the writable size is '24' bytes, but '108' bytes might be
  //written.
  *pb[8][8] = 1;
```


3 - Sample allocating array of size buflen

```c
int main()
{
  int n = 10;
  
  int(*buf)[n] = malloc(sizeof(int) * n);
  if (buf)
  {
    for (int i = 0; i < n; i++)
    {
      (*buf)[i] = i;
    }
  }
  printf("size = %d", (int) sizeof(*buf)); //40
  free(buf);
}

```

4 - Problem : return types
```c
int(*)[n] Alloc(int n);

//C++
auto Alloc(int n) -> int(*)[n];
```

5 - Problem: structs

"A structure or union cannot contain a member with a **variably modified type** because member names
are not ordinary identifiers as defined in 6.2.3."

```c
struct X
{
  int n;
  int a[n];
};
```

6 - Problem : people don't use this for dynamic arrays
```c
 
 /*existing  code is like this*/

 void F(int * a, int len);
 
 int buflen = 3;
 int * buf  = malloc(sizeof(int) * buflen);
 buf[2] = 1;
```

7 - Some existing checks [static]

```c
void bar(int myArray[static 10]);

  int a[9];
  bar(a);

/*
warning : array argument is too small; contains 9 elements, callee requires at least 10 [-Warray-bounds]
*/

bar(NULL);
/*
warning : null passed to a callee that requires a non-null argument [-Wnonnull]
*/
 
```

8 - Not checking..

```c
void bar2(int myArray[static 15])
{
}

void bar(int myArray[static 10])
{
  bar2(myArray);
}

```


9 - Traditional 2 dimension dynamic arrays

```c
void F(int n, int m, int *a)
{
  for (int i = 0; i < n; i++)
  {
    for (int k = 0; k < m; k++)
    {
      printf(" %d ", a[i * m + k]); //calculated linear index      
    }
    printf("\n");
  }
}

int main()
{
  int n = 2;
  int m = 3;
  int *p = malloc(sizeof(int) * m * n);
  int j  = 0;
  
  for (int i = 0; i < n; i++)
  {
    for (int k = 0; k < m; k++)
    {
      p[i * m + k] = j;
      j++;
    }
  }

  F(n, m, p);
  
  free(p);
}

```

10 - Using VLA syntax

```c

void F(int n, int m, int a[n][m])
{
  for (int i = 0; i < n; i++)
  {
    for (int k = 0; k < m; k++)
    {
      printf(" %d ", a[i][k]);
      
    }
    printf("\n");
  }
}

int main()
{
  int n = 2;
  int m = 3;
  int (*p)[n][m] = malloc(sizeof * p);
  int j  = 0;
  
  for (int i = 0; i < n; i++)
  {
    for (int k = 0; k < m; k++)
    {
      (*p)[i][k] = j;
      j++;
    }
  }

  F(n, m, *p);
  
  free(p);
}

```


11 - Bounds checkin for **existing** C

```c

int main()
{
  int n = 2;
  int(*p)[n] = malloc(sizeof * p);
  
  n = 0;
  for (int i = 0; i < n + 2; i++)
  {
      (*p)[i]= i;
  }

  n = 1;
  for (int i = 0; i < n + 2; i++)
  {
    (*p)[i] = i;
  }

  free(p);
}

```

12 - Using the VLA syntax in structs in standard C

```c
struct Item
{
  int i;
};

struct Items
{
  struct Item * /*auto*/ (* /*auto*/ Data)[0/*Size*/];
  int Size;  
};

int main()
{
  struct Items items = { 0 };
  (*items.Data)[0]->i = 1;
}
```
13 - Sugestion for syntax for annotating pointers and keeping the current syntax used by programmers

(like a type-qualifier for pointers and keep the current syntax.)

```c
 int buflen = 3;
 int *[buflen] buf = malloc(sizeof(int) * buflen);
 buf[2] = 1;
 //instead of 
 //(*buf)[2] = 1;

 //sizeof(*buf) == buflen
```


```c
void F(int n, int m, int * [n][m] a)
{
  for (int i = 0; i < n; i++)
  {
    for (int k = 0; k < m; k++)
    {
      printf(" %d ", a[i * m + k]);
      
    }
    printf("\n");
  }
}

int main()
{
  int n = 2;
  int m = 3;
  
  int *[n][m] p = malloc(sizeof(int) * m * n);

  int j  = 0;
  
  for (int i = 0; i < n; i++)
  {
    for (int k = 0; k < m; k++)
    {
      p[i * m + k] = j; //same syntax
      j++;
    }
  }

  F(n, m, p); //cast to VLA syntax?
  
  free(p);
}

```
