
```cpp

#include <list>
#include "typepointer.h"
#include <iostream>

using namespace std;


int main()
{
  std::list<type_pointer> list;

  list.push_back(new int(2));
  list.push_back(new double(2));

  for (auto& item : list)
  {
    if (auto p = item.Is<int>())
    {
      cout << *p;
    }
    else if (auto p = item.Is<double>())
    {
      cout << *p;
    }
    cout << endl;
  }

  return 0;
}


}}}


typepointer.h

{{{cpp
#pragma once

struct type_pointer
{
  void* pObject;
  template <class T>
  static void Delete(void* p)
  {
    T* pType = (T*) p;
    delete pType;
  }

  typedef void(*ReleaseFunction)(void*);
  ReleaseFunction releaseF;
  type_pointer(type_pointer&) ;//= delete;
  type_pointer& operator = (type_pointer&) ;//= delete;

public:

  template<class T>
  type_pointer(T* p)
  {
    releaseF = &Delete<T>;
    pObject = p;
  }

  type_pointer(type_pointer&& p)
  {
    releaseF = p.releaseF;
    pObject = p.pObject;
    p.pObject = nullptr;
    p.releaseF = nullptr;
  }
  
  ~type_pointer()
  {
    reset();
  }  

  void reset()
  {
    if (pObject != nullptr)
    {
      releaseF(pObject);
      pObject = nullptr;
      releaseF = nullptr;
    }
  }

  template <class T>
  T* Is()
  {
    return releaseF == &Delete<T> ? (T*) pObject : nullptr;
  }
};



```


