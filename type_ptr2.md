## Polymorphism without virtual funcions

**type_ptr** is a type that can be used to hold objects in a container for instance, and can be used to select function in runtime.


Sample

```cpp
struct Box
{
  ~Box()
  {
    std::cout << "~box" << std::endl;
  }
};

struct Circle
{
  ~Circle()
  {
    std::cout << "~circle" << std::endl;
  }
};

void Print(Box& box)
{
  std::cout << "box" << std::endl;
}

void Print(Circle& circle)
{
  std::cout << "circle" << std::endl;
}

struct F
{
  template<class T> static void Call(T& r) { Print(r); }
};

void Test1()
{
  std::vector<type_ptr> v;

  v.emplace_back(new Box());
  v.emplace_back(new Circle());

  //Option 1 
  for (auto & item : v)
  {
    if (auto p = item.is_ptr<Box>())
    {
      Print(*p);
    }
    else if (auto p = item.is_ptr<Circle>())
    {
      Print(*p);
    }
  }

  //Option 2 
  for (auto & item : v)
  {
    switch (is_index<Box, Circle>(item))
    {
    case 1:
      Print(item.ref<Box>());
      break;
    case 2:
      Print(item.ref<Circle>());
      break;
    default:
      break;
    }
  }

  //Option 3  
  for (auto & item : v)
  {
    Select<F, Box, Circle>(item);
  }
}

int _tmain(int argc, _TCHAR* argv[])
{
  Test1();
  return 0;
}


```


type_ptr.h
```cpp


#include "stdafx.h"
#include <iostream>
#include <vector>
#include <memory>
#include <string>
#include <cassert>

class type_ptr
{
  template<class T>
  static void Delete(void* p)
  {
    delete (T*)p;
  }

protected:

  void(*DeleteF)(void*);
  void * ptr;
  const type_info* tinfo;

public:

  type_ptr(type_ptr&& other)
  {
    ptr = other.ptr;
    tinfo = other.tinfo;
    DeleteF = other.DeleteF;

    other.ptr = nullptr;
    other.tinfo = nullptr;
    other.DeleteF = nullptr;
  }

  template<class T>
  type_ptr(T* p)
  {
    ptr = p;
    tinfo = &typeid(*p);
    DeleteF = &Delete<T>;
  }

  type_ptr()
  {
    ptr = nullptr;
    type_info* tinfo = nullptr;
  }

  ~type_ptr()
  {
    if (DeleteF != nullptr)
    {
      DeleteF(ptr);
      ptr = nullptr;
    }
  }

  template<class T>
  bool is() const
  {
    return (*tinfo == typeid(T));
  }

  template<class T>
  T* is_ptr() const
  {
    if (is<T>())
    {
      return (T*)ptr;
    }
    return nullptr;
  }

  template<class T>
  T& ref()
  {
    assert(is_ptr<T>() != nullptr);
    return *((T*)ptr);
  }
};


template<int N>
int is_index_imp(const type_ptr&)
{
  return -1;
}

template<int N, class T1, typename... TN>
int is_index_imp(const type_ptr& tp)
{
  if (tp.is<T1>())
  {
    return N;
  }

  return is_index_imp<N + 1, TN...>(tp);
}

template<typename... TN>
int is_index(const type_ptr& tp)
{
  return is_index_imp<1, TN...>(tp);
}


template<class F>
void call_imp(const type_ptr&)
{
}

template<class F, class T1, typename... TN>
void call_imp(const type_ptr& tp)
{
  if (auto p = tp.is_ptr<T1>())
  {
    return F::Call(*p);
  }

  return call_imp<F, TN...>(tp);
}

template<class F, typename... TN>
void Select(const type_ptr& tp)
{
  return call_imp<F, TN...>(tp);
}

```


