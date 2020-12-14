# Dynamic bitset

[Make container](makecontainer.md)



```cpp


#include <stdbool.h>
#include <limits.h>
#include <assert.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>



struct bitset
{
  unsigned long* bits;
  int size;  
};

#define BITSET_NUM_BITS_PER_WORD (CHAR_BIT * sizeof(unsigned long))

int bitset_resize(struct bitset* p, int newSize)
{
  if (newSize > p->size)
  {
    int oldsize = p->size;
    unsigned long* pnew = realloc(p->bits, newSize * sizeof(p->bits[0]));
    if (pnew)
    {
      memset(pnew + oldsize, 0, sizeof(p->bits[0]) * (newSize - oldsize));
      p->bits = pnew;
      p->size = newSize;
    }
    else
    {
      return 0; /*out of mem*/
    }
  }

  return p->size;
}


inline bool bitset_clear(struct bitset* bitset)
{
  memset(bitset->bits, 0, bitset->size * sizeof(bitset->bits[0]));
}

inline bool bitset_getbit(struct bitset* bitset, int index)
{
  assert(index / BITSET_NUM_BITS_PER_WORD < bitset->size);
  return (bitset->bits[index / BITSET_NUM_BITS_PER_WORD] & (1ul << index % BITSET_NUM_BITS_PER_WORD)) != 0;
}

inline void bitset_setbit(struct bitset* bitset, int index, bool b)
{
  int wordindex = index / BITSET_NUM_BITS_PER_WORD;

  if ((wordindex + 1) > bitset->size)
  {
    if (bitset_resize(bitset, wordindex + 1) == 0)
    {
      return;
    }
  }
 
  unsigned long bit = 1ul << index % BITSET_NUM_BITS_PER_WORD;
  if (b)
  {
    bitset->bits[wordindex] |= bit;
  }
  else
  {
    bitset->bits[wordindex] &= ~bit;
  }
}


void bitset_destroy(struct bitset* p)
{
  free(p->bits);
}

void bitset_print(struct bitset* bitset)
{
  for (int i = 0; i < bitset->size * BITSET_NUM_BITS_PER_WORD; i++)
  {
    if (i != 0 && i % 8 == 0)
      printf(" ");
    if (i != 0 && i % 32 == 0)
      printf("\n");

    printf("%d", bitset_getbit(bitset, i));
  }
  printf("\n");
}


int main()
{
  struct bitset a = {0};

  bitset_setbit(&a, 7, true);
  bitset_print(&a);
  printf("-----\n");
  bitset_setbit(&a, 32, true);
  bitset_print(&a);

  bitset_destroy(&a);
}
	
```

