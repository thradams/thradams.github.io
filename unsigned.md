
Useful functions to avoid underflow/overflow and using the remaining value.

```cpp

unsigned int UnsignedSubtraction(unsigned int a, unsigned int b,
unsigned int* r)
{
   const unsigned int minval = 1;
   const unsigned int avaiable =  a - minval;
   if (b > avaiable)
   {
      *r = b - avaiable;
      return minval;
   }

   *r = 0;
   return a - b;
}


unsigned int UnsignedAddition(unsigned int a, unsigned int b, unsigned int* r)
{
   const unsigned int maxval = 255;
   const unsigned int avaiable = maxval - a;
   if (b > avaiable)
   {
       *r = b - avaiable;
       return maxval;
   }

   *r = 0;
   return a + b;
}

```
