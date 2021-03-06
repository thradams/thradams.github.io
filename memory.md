##Memory

Memory manipulation functions
```cpp

//
// Copyright (C) 2009, Thiago R. Adams
// http://www.thradams.com
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.
//

#include <cassert>
#include <limits>

namespace memory 
{
    template<class T>
    void clearbits(T & v, int bit_index, int nbits)
    {
        T mask = ~(T(0)) << (sizeof(T) * CHAR_BIT - T(nbits));
        mask =  mask >> (sizeof(T) * CHAR_BIT - T(bit_index) - T(nbits));
        v &= ~mask;
    }

    template<class T, class T2>
    void setbits(T &v, int bit_index, int nbits, T2 number)
    {  
        //static_assert(is_unsigned<T>::value);
        assert(number <= (std::numeric_limits<T>::max)());
        assert(number >= 0);

        clearbits(number, nbits, sizeof(T2) * CHAR_BIT - nbits);

        T big(number);
        big = (big << bit_index);

        clearbits(v, bit_index, nbits);
        v |= big;
    }

    template<class T>
    T getbits(T v, int bit_index, int nbits)
    {
        T r = v >> bit_index;
        clearbits(r, nbits, sizeof(T) * CHAR_BIT - nbits);
        return r;
    }

    template<class T>
    bool is_bit_on(T v, int bit_index)
    {
        return (v & (T(1) << bit_index)) != 0;
    }

} //namespace memory

```
===Helper===
```cpp
template<class T>
void PrintBitsLn(T v)
{
  for  (int i = 0; i < sizeof(T) * CHAR_BIT ; i++)
  {
    std::cout << (memory::is_bit_on(v, i) ? '1' : '0');
  }
  std::cout << std::endl;
}
```
###History

* 3 fev 2010 : PrintBitsLn Added
