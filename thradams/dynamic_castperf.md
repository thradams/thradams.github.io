
## Which one is faster?

dynamic_cast, castTo style or queryInterface style?

(All results are from VC++ 2010 compiler)

----

###castTo x dynamic_cast

```cpp
class D;

class B
{
public:
 virtual ~B() { }
 virtual D* cast() { return 0;  }
};

class D : public B
{
public:
  int f(int i) { return i; }
  virtual D* cast() { return this; }
};

int Test1(B* p)
{
  int k = 0;
  for (int i = 0 ; i < 1000000; i++)
  {
    D* pD = dynamic_cast<D*>(p);
    k += pD->f(i);
  }
  return k;
}

int Test2(B* p)
{
  int k = 0;
  for (int i = 0 ; i < 1000000; i++)
  {
    D* pD = p->cast();
    k += pD->f(i);
  }
  return k;
}


int main()
{
  D d;
  Stopwatch s;
  
  std::cout << "dynamic_cast" << std::endl;
  s.Start();
  std::cout << Test1(&d) << std::endl;
  s.Stop();
  std::cout << s.GetElapsedTicks();
  std::cout << std::endl;
  std::cout << std::endl;

  std::cout << "cast()" << std::endl;
  s.Start();
  std::cout << Test2(&d) << std::endl;
  s.Stop();
  std::cout << s.GetElapsedTicks();

}
```


Output
```
dynamic_cast
1783293664
114084 ticks

cast()
1783293664
161149 ticks
```

**dynamic_cast 114084 ticks  , cast() 161149 ticks**

----

## Crosscast - only dynamic_cast

```cpp

struct A
{
  int iA;

  virtual ~A () {}  
};

struct B
{
  int iB;
};

struct D: public A, public B
{
  int iD;
  D() { iB = 0; iA = 0; iD = 0; } 
};

void f(A* pa)
{
   for (int i = 0 ; i < 100000000; i++)
   {
     B *pb = dynamic_cast<B*> (pa);
     pb->iB++;
   }
   
   B *pb = dynamic_cast<B*> (pa);
   std::cout << "total = " << pb->iB << std::endl;
}

int main()
{
  A *pa = new D;
  Stopwatch s;
  s.Start();
  f(pa);
  s.Stop();
  std::cout << s.GetElapsedTicks() << " ticks " 
            << s.GetElapsedMilliseconds() << " ms " << std::endl;
}

```

Output
```
total = 100000000
21270954 ticks 8361 ms
```


## Crosscast - dynamic_cast x queryinterface

COM QueryInterface style:

```cpp

struct I
{
  virtual ~I()
  {
  };
  
  virtual void* queryInterface(int i) 
  {
    switch (i)
    {
      case 0: return static_cast<I*>(this);     
    }
    return nullptr;
  };

};

struct A : public I
{
  int iA;
  
  virtual void* queryInterface(int i) 
  {
    switch (i)
    {
      case 0: return static_cast<I*>(this);
      case 1: return static_cast<A*>(this);
    }
    return nullptr;
  };

  virtual ~A () {}  
};

struct B : public I
{
  int iB;
  
  virtual void* queryInterface(int i) 
  {
    switch (i)
    {
      case 0: return static_cast<I*>(this);
      case 2: return static_cast<B*>(this);
    }
    return nullptr;
  };  
};

struct D: public A, public B, public I
{
  int iD;
  D() { iB = 0; iA = 0; iD = 0; } 
  
  virtual void* queryInterface(int i) 
  {
    switch (i)
    {
      case 0: return static_cast<I*>(this);
      case 1: return static_cast<A*>(this);
      case 2: return static_cast<B*>(this);
    }
    return nullptr;
  };  
};

void f(A* pa)
{
   for (int i = 0 ; i < 100000000; i++)
   {
     B *pb = (B*)pa->queryInterface(2);
     pb->iB++;
   }
   
   B *pb = (B*)pa->queryInterface(2);
   std::cout << "total = " << pb->iB << std::endl;
}

int main()
{
  A *pa = new D;
  Stopwatch s;
  s.Start();
  f(pa);
  s.Stop();
  std::cout << s.GetElapsedTicks() << " ticks " 
            << s.GetElapsedMilliseconds() << " ms " << std::endl;
}

```

Output
```
total = 100000000
1038177 ticks 408 ms
```

**dynamic_cast 8361 ms, querinterface style = 408ms**

----

## Crosscast - dynamic_cast with a common base class I ==

```cpp

struct I
{
  virtual ~I()
  {
  };
};

struct A : public I
{
  int iA;

  virtual ~A () {}  
};

struct B : public I
{
  int iB;
};

struct D: public A, public B , public I
{
  int iD;
  D() { iB = 0; iA = 0; iD = 0; } 
};


void f(A* pa)
{
   for (int i = 0 ; i < 100000000; i++)
   {
     B *pb = dynamic_cast<B*>(pa);
     pb->iB++;
   }
   
   B *pb = dynamic_cast<B*>(pa);
   std::cout << "total = " << pb->iB << std::endl;
}

int main()
{
  A *pa = new 
    D;
  Stopwatch s;
  s.Start();
  f(pa);
  s.Stop();
  std::cout << s.GetElapsedTicks() << " ticks " 
            << s.GetElapsedMilliseconds() << " ms " << std::endl;
}

```

```
total = 100000000
28984300 ticks 11393 ms
```

**dynamic_cast 11393 ms, querinterface style = 408ms**

