

It is possible to print the class layout in Visual C++ using the following command option:

```
 /d1reportSingleClassLayoutCLASSNAME
```

Where CLASSNAME is the name of the class you want to print.

The option can be added at the "Command Line" "Additional Options"


Sample:
```cpp
struct Base
{  
  int baseInt;
  virtual void f(){};
  virtual ~Base(){}
};

struct D1 : public Base
{
  int D1Int;
  virtual void f1(){};
  virtual ~D1(){}
};

struct D2 : public Base
{
  int D2Int;
  virtual void f2(){};
  virtual ~D2(){}
};

struct D3 : public D1, public D2
{
  int D3Int;
  virtual void f(){};  
};
```

```
 /d1reportSingleClassLayoutD3
```

Output:

```
  class D3	size(28):
  	+---
  	| +--- (base class D1)
  	| | +--- (base class Base)
   0	| | | {vfptr}
   4	| | | baseInt
  	| | +---
   8	| | D1Int
  	| +---
  	| +--- (base class D2)
  	| | +--- (base class Base)
  12	| | | {vfptr}
  16	| | | baseInt
  	| | +---
  20	| | D2Int
  	| +---
  24	| D3Int
  	+---
  
  D3::$vftableD1:
  	| &D3_meta
  	|  0
   0	| &D3::f
   1	| &D3::{dtor}
   2	| &D1::f1
  
  D3::$vftableD2:
  	| -12
   0	| &thunk: this-=12; goto D3::f
   1	| &thunk: this-=12; goto D3::{dtor}
   2	| &D2::f2
  
  D3::f this adjustor: 0
  D3::{dtor} this adjustor: 0
  D3::__delDtor this adjustor: 0
  D3::__vecDelDtor this adjustor: 0

```


