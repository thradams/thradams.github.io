

This program compares the call cost of using shared_ptr as functions argument when cast or copy are necessary.





See also: [http://www.thradams.com/codeblog/stopwatch2.htm](Stopwatch class)

Source Code:

```cpp

#include <memory>
#include "Stopwatch.h"
#include <iostream>

struct Base 
{ 
    virtual void f(int& i) const {i += 1;}
};

struct Derived : public Base 
{ 
  virtual void f(int& i) const  {i += 2;}
};

void f1(int& i, std::shared_ptr<Base> sp) {sp->f(i);}
void f2(int& i,std::shared_ptr<const Base> sp) {sp->f(i);}
void f3(int& i,const std::shared_ptr<Base>& sp) {sp->f(i);}
void f4(int& i,const std::shared_ptr<const Base>& sp) { sp->f(i);}

void f5(int& i,std::shared_ptr<Derived> sp) {sp->f(i);}
void f6(int& i,std::shared_ptr<const Derived> sp) {sp->f(i);}
void f7(int& i,const std::shared_ptr<Derived>& sp) {sp->f(i);}
void f8(int& i,const std::shared_ptr<const Derived>& sp) { sp->f(i);}

void ff1(int& i,Base* p) { p->f(i);}
void ff2(int& i,const Base* p) { p->f(i);}
void ff3(int& i,const Derived* p) { p->f(i);}
void ff4(int& i,Derived* p) {p->f(i);}

#define TOTAL 10000000

#define TestShared(F)\
{ \
    int i = 0; \
    std::shared_ptr<Derived> sp ( new Derived());\
    Stopwatch s(true);\
    int k = 0;\
    for (int i = 0; i < TOTAL; i++)\
    {\
      F(k, sp);\
    }\
    std::cout << #F << "  " << s.GetElapsedMilliseconds() << "ms " <<  k << std::endl;\
}

#define TestPtr(F)\
{ \
    int i = 0; \
    Derived* p ( new Derived());\
    Stopwatch s(true);\
    int k = 0;\
    for (int i = 0; i < TOTAL; i++)\
    {\
      F(k, p);\
    }\
    std::cout << #F << "  " << s.GetElapsedMilliseconds() << "ms " <<  k << std::endl;\
    delete p; \
}


int main()
{
   
   std::cout << "Using shared_ptr" << std::endl;
   std::cout << "------------------------" << std::endl;
   TestShared(f1)
   TestShared(f2)
   TestShared(f3)
   TestShared(f4)
   TestShared(f5)
   TestShared(f6)
   TestShared(f7)
   TestShared(f8)
   
   std::cout << std::endl;
   std::cout << std::endl;

   std::cout << "Using Pointer" << std::endl << std::endl;
   std::cout << "------------------------" << std::endl;

   TestPtr(ff1)
   TestPtr(ff2)
   TestPtr(ff3)
   TestPtr(ff4)
   
   std::cout << std::endl;
   std::cout << std::endl;
}

```

Output: (VC++ 2010 express)

```
Using shared_ptr
------------------------
f1  278ms 20000000
f2  241ms 20000000
f3  263ms 20000000
f4  225ms 20000000
f5  273ms 20000000
f6  203ms 20000000
f7  58ms 20000000
f8  208ms 20000000


Using Pointer

------------------------
ff1  40ms 20000000
ff2  62ms 20000000
ff3  40ms 20000000
ff4  40ms 20000000

```

