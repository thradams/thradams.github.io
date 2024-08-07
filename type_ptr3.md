

## Polymorphism without inheritance and abstract classes

type_ptr is a type that can be used to hold objects in a container for instance, and can be used to select function in runtime.


Compiled with:

Visual C++ Compiler Nov 2013 CTP (CTP_Nov2013)



Sample:

```cpp

#include <iostream>
#include <vector>
#include "type_ptr.h"

class box
{
};
class circle
{
};

void draw(const box &)
{
    std::cout << "in a box" << std::endl;
}

void draw(const circle &)
{
    std::cout << "in a circle" << std::endl;
}

int main()
{    
    std::vector<type_ptr> v;
    v.emplace_back(new box());
    v.emplace_back(new circle());

    for (auto& item : v)
    {
        select<box, circle>(item, [](auto s){ draw(s); });
    }     
    
}

```


type_ptr.h


```cpp
#pragma once

#include <cassert>

class type_ptr
{
    template<class T>
    static void Delete(void* p)
    {
        delete (T*) p;
    }

protected:

    void(*DeleteF)(void*);
    void * ptr;

public:

    type_ptr(type_ptr&& other)
    {
        ptr = other.ptr;
        DeleteF = other.DeleteF;

        other.ptr = nullptr;
        other.DeleteF = nullptr;
    }

    template<class T>
    type_ptr(T* p)
    {
        ptr = p;
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
        return DeleteF == &Delete<T>;
    }

    template<class T>
    T* is_ptr() const
    {
        if (is<T>())
        {
            return (T*) ptr;
        }
        return nullptr;
    }

    template<class T>
    T& ref()
    {
        assert(is_ptr<T>() != nullptr);
        return *((T*) ptr);
    }
};


template<class... N>
struct select
{
    template<class F>
    select(type_ptr &, const F &)
    {
    }
};

template<class T1, class... Tn>
struct select<T1, Tn...>
{
    template<class F>
    select(type_ptr &p, const F &f)
    {
        if (p.is<T1>())
            f(p.ref<T1>());
        else
            select<Tn...>(p, f);
    }
};

template<class... TN, class List, class F>
void for_each(List& list, F f)
{
    for (auto& item : list)
    {
        select<TN...>(item, f);
    }
}

```


