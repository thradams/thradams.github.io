# Permutations
February 2020

Given a string (for instance "abcd") and a group size (for instance 2) we generate all combinations.

```
ab
ac
ad
ba
bc
bd
ca
cb
cd
da
db
dc
```

Because the order matters we have for instance ab and also ba.

The number of items generate is:
```

 N!
-----
(G-1)!

or 

N * (N-1) * (N-2) ...


4*3 = 12

   4!
 ----- = 12
 (2-1)
 
```



```cpp
#include <stdio.h>
#include <stdlib.h>

_Bool NotUsed(int used[], int s, int index)
{
  for (int i = 0; i < s; i++)
  {
    if (used[i] == index)
      return 0;
  }
  return 1;
}

void f2(const char* s, int indexesUsed[], int usedCount, int count, int groupSize)
{
  if (usedCount == groupSize)
  {
    for (int i = 0; i < usedCount; i++)
    {
      printf("%c", s[indexesUsed[i]]);
    }
    printf("\n");
    return;
  }
  for (int i = 0; i < count; i++)
  {
    if (NotUsed(indexesUsed, usedCount, i))
    {
      indexesUsed[usedCount] = i; //insert on the set of used indexes
      f2(s, indexesUsed, usedCount + 1, count, groupSize);
    }
  }
}


int main()
{
  int used[8] = {-1};
  f2("abcd", used, 0, sizeof("abcd") - 1, 2);
}

```

