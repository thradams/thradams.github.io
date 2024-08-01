
```c
/*
  C23  <stdckdint.h> emulation in MSVC
*/
#pragma once

#define ENABLE_INTSAFE_SIGNED_FUNCTIONS
#include <intsafe.h>


#define ckd_add(result, a, b)  \
  _Pragma("warning( push )")\
  _Pragma("warning( disable : 4244 )")\
  _Generic(*result, \
  signed char       :      SUCCEEDED(Int8Add(a, b, (signed char*)result)),\
  unsigned char     :     SUCCEEDED(UInt8Add(a, b, (unsigned char*)result)),\
  short             :     SUCCEEDED(ShortAdd(a, b, (short*)result)),\
  unsigned short    :    SUCCEEDED(UShortAdd(a, b, (unsigned short*)result)),\
  int               :       SUCCEEDED(IntAdd(a, b, (int*)result)),\
  unsigned int      :      SUCCEEDED(UIntAdd(a, b, (unsigned int*)result)),\
  long              :      SUCCEEDED(LongAdd(a, b, (long*) result)),\
  unsigned long     :     SUCCEEDED(ULongAdd(a, b, (unsigned long*)result)),\
  long long         :  SUCCEEDED(LongLongAdd(a, b, (long long*)result)),\
  unsigned long long: SUCCEEDED(ULongLongAdd(a, b, (unsigned long long*)result))  \
  _Pragma(" warning( pop ) ")\
)

#define ckd_sub(result, a, b)  \
  _Pragma("warning( push )")\
  _Pragma("warning( disable : 4244 )")\
  _Generic(*result, \
  signed char       :      SUCCEEDED(Int8Sub(a, b, (signed char*)result)),\
  unsigned char     :     SUCCEEDED(UInt8Sub(a, b, (unsigned char*)result)),\
  short             :     SUCCEEDED(ShortSub(a, b, (short*)result)),\
  unsigned short    :    SUCCEEDED(UShortSub(a, b, (unsigned short*)result)),\
  int               :       SUCCEEDED(IntSub(a, b, (int*)result)),\
  unsigned int      :      SUCCEEDED(UIntSub(a, b, (unsigned int*)result)),\
  long              :      SUCCEEDED(LongSub(a, b, (long*) result)),\
  unsigned long     :     SUCCEEDED(ULongSub(a, b, (unsigned long*)result)),\
  long long         :  SUCCEEDED(LongLongSub(a, b, (long long*)result)),\
  unsigned long long: SUCCEEDED(ULongLongSub(a, b, (unsigned long long*)result))  \
  _Pragma(" warning( pop ) ")\
)


#define ckd_mul(result, a, b)  \
  _Pragma("warning( push )")\
  _Pragma("warning( disable : 4244 )")\
  _Generic(*result, \
  signed char       :      SUCCEEDED(Int8Mult(a, b, (signed char*)result)),\
  unsigned char     :     SUCCEEDED(UInt8Mult(a, b, (unsigned char*)result)),\
  short             :     SUCCEEDED(ShortMult(a, b, (short*)result)),\
  unsigned short    :    SUCCEEDED(UShortMult(a, b, (unsigned short*)result)),\
  int               :       SUCCEEDED(IntMult(a, b, (int*)result)),\
  unsigned int      :      SUCCEEDED(UIntMult(a, b, (unsigned int*)result)),\
  long              :      SUCCEEDED(LongMult(a, b, (long*) result)),\
  unsigned long     :     SUCCEEDED(ULongMult(a, b, (unsigned long*)result)),\
  long long         :  SUCCEEDED(LongLongMult(a, b, (long long*)result)),\
  unsigned long long: SUCCEEDED(ULongLongMult(a, b, (unsigned long long*)result))  \
  _Pragma(" warning( pop ) ")\
)


```
