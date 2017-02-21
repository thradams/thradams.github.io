##gc - Simple class to detect memory leaks
24 December 2004


Use this small class to detected memory leaks in your application. To use it just derive your class from the gc class. If any object is still alive in the end of your application, the method OnMemoryLeak will be called.

Generally I use an assert(false) to customize the OnMemoryLeak method.

```cpp

#ifndef __GC_H__
#define __GC_H__

#ifdef _DEBUG

#include <vector>
#include <algorithm>
#include <functional>
#include <typeinfo>

class gc
{
    struct gcList : public std::vector<gc*>
    {
        ~gcList()
        {
            std::for_each(begin(), end(), std::mem_fun(&OnMemoryLeak));
        }
    };

    static gcList& GCList()
    {
        static gcList vec;
        return vec;
    }

  void OnMemoryLeak(void)
  {
     const char *leak_in = typeid(*this).name();
     //do something here :
  }

protected:
  gc()
  {
    GCList().push_back(this);
  }

  virtual ~gc() {
      std::vector<gc*>::iterator it = std::find(GCList().begin(), GCList().end(), this);
      if (it != GCList().end())
         GCList().erase(it);
  }
};

#else

// it does nothing in releas
class gc {};

#endif


#endif //__GC_H_
```

