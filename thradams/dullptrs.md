

Normal pointers and references to shared objects.

Sample

```cpp
   
   //Creates a new shared object (ref counted)
   X* pShared = new_shared_object<X>();

   //Shares the object with pShared2
   X* pShared2 = share_object(pShared);

   //Release the pShared reference
   release_shared_object(pShared);
   pShared = nullptr;

   //Release the pShared2 reference
   release_shared_object(pShared2);
   pShared2 = nullptr;

//References:

   X& sharedRef = *new_shared_object<X>();
   X& sharedRef2 = share_object(sharedRef);

   //(destructor for instance)
   release_shared_object(sharedRef);
   release_shared_object(sharedRef2);
```

----

Source Code: (scratch)

```cpp

template<class T>
struct AtomicHolder : public T
{
  std::atomic<unsigned int> counter;
  
  AtomicHolder()
  { 
    counter = 1; 
  }

  template<class A1, class A2>
  AtomicHolder(A1&& a1, A2&& a2) : T(std::forward<A1>(a1), std::forward<A2>(a2)) 
  { 
    counter = 1; 
  }
};


template<class T>
int is_shared_object(T *p)
{
  if (!std::is_polymorphic<T>::value)
  {      
    //we can't check using this method
    return -1;
  }
  return  typeid(*p) == typeid(AtomicHolder<T>) ? 1 : 0;
}

template<class T>
T* share_object(T* p)
{  
  assert(is_shared_object(p) != 0);
  AtomicHolder<T> *p2 = static_cast<AtomicHolder<T>*>(p);
  p2->counter++;
  return p;
}


template<class T>
T& share_object(T& r)
{    
  return *share_object(&r);
}


template<class T>
void release_shared_object(T* p)
{
   if (p == nullptr)
     return;

  assert(is_shared_object(p) != 0);

  AtomicHolder<T> *p2 = static_cast<AtomicHolder<T>*>(p);
  if (p2->counter.fetch_add(-1) == 1)
    delete p2;
}

template<class T>
void release_shared_object(T& r)
{
  release_shared_object(&r);
}


template <class T>
T* new_shared_object() //0..N arguments
{
  T* p0 = new AtomicHolder<T>();

  //I don't want to use dynamic_cast
  assert(static_cast<AtomicHolder<T>*>(static_cast<T*>(p0)) == p0);

  return p0;
}

template <class T, class A1, class A2>
AtomicHolder<T>* new_shared_object(A1&& a1, A2&& a2) //0..N arguments
{
  AtomicHolder<T>* p0 = new AtomicHolder<T>(std::forward<A1>(a1), std::forward<A2>(a2));

  //I don't want to use dynamic_cast
  assert(static_cast<AtomicHolder<T>*>(static_cast<T*>(p0)) == p0);

  return p0;
}


```

Sample

```cpp
using namespace std;


struct X
{
  X()
  {
    std::cout << "X" << std::endl;
  }
  virtual ~X()
  {
    std::cout << "~X" << std::endl;
  }
};



int _tmain(int argc, _TCHAR* argv[])
{
  //X *pNotShared = new X;
  //X* pSharedWrong = share_object(pNotShared); //error


  X* pShared = new_shared_object<X>();
  X* pShared2 = share_object(pShared);

  release_shared_object(pShared);
  release_shared_object(pShared2);

  X& sharedRef = *new_shared_object<X>();
  X& sharedRef2 = share_object(sharedRef);

  release_shared_object(sharedRef);
  release_shared_object(sharedRef2);


  return 0;
}


```

----
Sample2:

```cpp
struct Point
{
  int m_x;
  int m_y;

  Point(int x, int y) : m_x(x), m_y(y)
  {
    std::cout << "Point(" <<m_x << ", " << m_y << ")" << std::endl;
  }
  
  ~Point()
  {
    std::cout << "~Point(" <<m_x << ", " << m_y << ")" << std::endl;
  }
};

struct Line
{
  Point& m_start;
  Point& m_end;
  Line(Point& start, Point& end) : 
     m_start(share_object(start)), 
     m_end(share_object(end))
  {
    std::cout << "Line" << std::endl;
  }
  ~Line()
  {
    release_shared_object(m_start);
    release_shared_object(m_end);
    std::cout << "~Line" << std::endl;
  }
};

template<class T>
struct SmartPtr
{
  T *m_p;
  SmartPtr(AtomicHolder<T> *p)
  {
    m_p = p;
  }
  ~SmartPtr() 
  {
    release_shared_object(m_p);
  }
  operator T*()
  {
    return m_p;
  }
  
  T * get()
  {
    return m_p;
  }
};

int _tmain(int argc, _TCHAR* argv[])
{
 {
    Line *pline = nullptr;

    {
      SmartPtr<Point> pt1(new_shared_object<Point>(0,0));
      SmartPtr<Point> pt2(new_shared_object<Point>(1,1));
      pline = new Line(*pt1.get(), *pt2.get());
    }

    Line *pline2 = nullptr;
    {
      SmartPtr<Point> pt3(new_shared_object<Point>(1,0));
      pline2 = new Line(pline->m_end, *pt3.get());
    }

    delete pline;
    delete pline2;
  }  

  return 0;
}

```

Output:

```
Point(0, 0)
Point(1, 1)
Line
Point(1, 0)
Line
~Point(0, 0)
~Line
~Point(1, 1)
~Point(1, 0)
~Line
```

See also:
[http://www.thradams.com/codeblog/shared_ptr.htm](shared_ptr)
