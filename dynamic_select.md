##Runtime function selection based on polimorphic arguments

**Runtime function selection** based on the runtime type of the argument.



Let's say you have:

```cpp
void Draw(box& box);
void Draw(circle& circle);
```

...and a 
```
vector<unique_ptr<Shape>> shapes;
```
Now, you want to select the correct function for circle or box depending of the type of "shape".

You can do the correct selection using this library in this way.

```cpp

 dynamic_select<box, circle>(shapes[0].get(),
                             [](auto a)
                             {
                               draw(a);            
                             });   
```
Works for 1 or 2 arguments. In other words, works for double dispatching.

###Why not virtual always?
Virtual functions works fine in this case. Except for double dispathing.

The problem with interfaces (virtual functions) is the coupling caused by the interfaces. You cannot solve problems independently from each other; instead, you have to deal with the best set of interfaces that fits the algorithms you have so far. When you need to add or remove algorithms then you have to refactoring your interfaces for the best set again, and doing this, sometimes, can break code that is already working. It is very easy to increase coupling with interfaces, and it's hard to keep the interface sets correct. When you do it, probally the interfaces are usefull only in your especific project making your classes less reusable.



This is a prototype.


Complete sample
```cpp

#include <vector>
#include <memory>
#include <iostream>

#include "dynamic_select.h"

using namespace std;


class object
{
public:
    virtual ~object() {}
};

class box : public object
{
};

class circle : public object
{
};

void draw(const box & a)
{
    std::cout << " draw " << typeid(a).name() << std::endl;
}

void draw(const circle &a)
{
    std::cout << " draw " << typeid(a).name() << std::endl;
}

void intercept(const box & a, const circle& b)
{
    std::cout << typeid(a).name() << " intercept " << typeid(b).name() << std::endl;
}

void intercept(const circle& a, const box & b)
{
    std::cout << typeid(a).name() << " intercept " << typeid(b).name() << std::endl;
}

void intercept(const box & a, const box& b)
{
    std::cout << typeid(a).name() << " intercept " << typeid(b).name() << std::endl;
}

void intercept(const circle & a, const circle& b)
{
    std::cout << typeid(a).name() << " intercept " << typeid(b).name() << std::endl;
}

int main()
{
    std::vector<std::unique_ptr<object>> v;
    v.emplace_back(new box());
    v.emplace_back(new circle());

    for (auto& item : v)
    {
        dynamic_select<box, circle>(item.get(),
            [](auto a)
        {
            draw(a);            
        });        
    }

    //Double dispatch 
    for (auto& item : v)
    {
        dynamic_select<box, circle>(v[1].get(),
            item.get(),
            [](auto a, auto b)
        {
            intercept(a, b);
        });
    }

}

```

output

```
 draw class box
 draw class circle
class circle intercept class box
class circle intercept class circle
```

dynamic_select.h
```cpp
#pragma once

template< class... Tn>
struct Gen2
{
    template<class A1, class A2, class F>
    Gen2(const A1 & a1, const A2& a2, F)
    {
    }
};

template<class T, class T1, class ...Tn>
struct Gen2<T, T1, Tn...>
{
    template<class A1, class A2, class F>
    Gen2(A1 * a1, A2* a2, F f)
    {
        if (typeid(T1) == typeid(*a2))
        {
            f(dynamic_cast<const T&>(*a1),
              dynamic_cast<const T1&>(*a2));
        }
        else
        {
            Gen2<T, Tn...>(a1, a2, f);
        }
    }
};

template< class... Tn>
struct Gen
{
    template<class A1,  class F>
    Gen(const A1* a1,  F)
    {
    }

    template<class A1, class A2, class F>
    Gen(const A1* a1, const A2* a2, F)
    {
    }
};

template<class T1, class ...Tn>
struct Gen<T1, Tn...>
{
    template<class A1,class F>
    Gen(const A1 * a1, F f)
    {
        if (typeid(T1) == typeid(*a1))
        {
            f(dynamic_cast<const T1&>(*a1));
        }
        else
        {
            Gen<Tn...>(a1, f);
        }
    }

    template<class A1, class A2, class F>
    Gen(const A1 * a1, const A2* a2, F f)
    {
        if (typeid(T1) == typeid(*a1))
        {
            if (typeid(T1) == typeid(*a2))
            {
                f(dynamic_cast<const T1&>(*a1),
                  dynamic_cast<const T1&>(*a2));
            }
            else
            {
                Gen2<T1, Tn...>(a1, a2, f);
            }
        }
        else
        {
            Gen<Tn...>(a1, a2, f);
        }
    }
};


template<class ...Tn>
struct dynamic_select
{
    template<class A1, class F>
    dynamic_select(const A1 * a1, F f)
    {
        Gen<Tn...>(a1, f);
    }

    template<class A1, class A2, class F>
    dynamic_select(const A1 * a1, const A2* a2, F f)
    {
        Gen<Tn..., Tn...>(a1, a2, f);
    }
};


```



##See also

[type_ptr3.htm](type ptr) Not using C++ rtti.


##Notes

Compiled with:

Visual C++ Compiler Nov 2013 CTP (CTP_Nov2013)

