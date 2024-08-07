

## C++ Properties using C++ 11 

A property is a "virtual field".\\
When the virtual field is used as rvalue it calls some get function.
When the virtual field is used as lvalue it calls the best set_ function.

The idea behind this implementation is to detect when the field is used as lvalue using operator =, and to detect when the field is used as rvalue overriding operators +,- etc.


### Sample

```cpp
auto result = x.prop;
x.prop = something;
```
will be equivalent of:
```cpp
auto result = x.get_prop();
x.set_prop(something);
```

### Tested with:
 * VC++ 2012

See previous post [[properties.h]]

----
### properties.h

```cpp
#pragma once

//
// Copyright (C) 2012, Thiago R. Adams
// http://www.thradams.com
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.
//

#include <type_traits>
#include <ostream>
#include <type_traits>
#include <ostream>

struct property_tag {};

template<class T>
struct is_property : public std::is_base_of<property_tag, T> {};

template<class TA, class TB,  class R>
struct enable_if_any_is_prop : public std::enable_if<is_property<TA>::value || is_property<TB>::value, R>
{
};

template<class TA,  class R>
struct enable_if_is_prop : public std::enable_if<is_property<TA>::value, R>
{
};

template<class TA,  class R>
struct enable_if_is_not_prop : public std::enable_if<!is_property<TA>::value, R>
{
};

template <class T>
auto eval(const T& v) -> typename enable_if_is_prop<T, decltype(v.get())>::type
{
    return v.get();
}

template <class T>
auto eval(const T& v) -> typename enable_if_is_not_prop<T, decltype(v) >::type
{
    return v;
}

template <typename R, typename O>
R ReturnType(R (O::*)(void) const) 
{ 
  return R();
}


#define READ_ONLY_PROPERTY(CLASSTYPE, GETFUNC, name)\
struct CLASSTYPE_##name : public property_tag\
{\
  typedef decltype(ReturnType(&CLASSTYPE::GETFUNC)) GETTYPE;\
  template<class T> operator T() const\
  {\
      return get();\
  }\
  GETTYPE operator ()() const \
  {\
      return get();\
  }\
  operator GETTYPE() const\
  {\
      return get();\
  }\
  GETTYPE get() const \
  {\
     return reinterpret_cast<const CLASSTYPE*>(this - offsetof(CLASSTYPE, name))->GETFUNC();\
  }\
} name

#define PROPERTY(CLASSTYPE, GETFUNC, SETFUNC, name)\
struct CLASSTYPE_##name : public property_tag\
{\
    typedef CLASSTYPE_##name MyType;\
    typedef decltype(ReturnType(&CLASSTYPE::GETFUNC)) GETTYPE;\
    template<class T> operator T()\
    {\
        return get();\
    }\
    GETTYPE operator ()() const \
    {\
        return get();\
    }\
    GETTYPE get() const \
    {\
       return reinterpret_cast<const CLASSTYPE*>(this - offsetof(CLASSTYPE, name))->GETFUNC();\
    }\
	template<class T>\
	void set(T&& value)\
    {\
       reinterpret_cast<CLASSTYPE*>(this - offsetof(CLASSTYPE, name))->SETFUNC(std::forward<T>(value));\
    }\
    template <class T> typename enable_if_is_prop<T, MyType&>::type\
    operator =(T&& value)\
    {\
        set(std::forward<T>(value.get()));\
        return *this;\
    }\
    template <class T> typename enable_if_is_not_prop<T, MyType&>::type\
    operator =(T&& value)\
    {\
        set(std::forward<T>(value));\
        return *this;\
    }\
} name


#define DECLARE_BINARY_OPERATOR(OPERATOR) \
template <class TA, class TB> \
auto operator OPERATOR(const TA& a, const TB& b) -> typename enable_if_any_is_prop<TA, TB, decltype(eval(a) OPERATOR eval(b)) >::type \
{ \
  return eval(a) OPERATOR eval(b);\
}

DECLARE_BINARY_OPERATOR(+)
DECLARE_BINARY_OPERATOR(-)
DECLARE_BINARY_OPERATOR(*)
DECLARE_BINARY_OPERATOR(/)
DECLARE_BINARY_OPERATOR(%)
DECLARE_BINARY_OPERATOR(<)
DECLARE_BINARY_OPERATOR(>)
DECLARE_BINARY_OPERATOR(==)
DECLARE_BINARY_OPERATOR(>=)
DECLARE_BINARY_OPERATOR(<=)
DECLARE_BINARY_OPERATOR(!=)
DECLARE_BINARY_OPERATOR(&&)
DECLARE_BINARY_OPERATOR(||)
DECLARE_BINARY_OPERATOR(>>)
DECLARE_BINARY_OPERATOR(<<)

#define DECLARE_COMPOUND_OPERATOR(OPERATOR) \
template <class TA, class TB> \
auto operator OPERATOR=(TA& a, const TB& b) -> typename enable_if_any_is_prop<TA, TB, TA&>::type \
{ \
   a = (a.get() OPERATOR b);\
   return a;\
}

DECLARE_COMPOUND_OPERATOR(+)
DECLARE_COMPOUND_OPERATOR(-)
DECLARE_COMPOUND_OPERATOR(*)
DECLARE_COMPOUND_OPERATOR(/)
DECLARE_COMPOUND_OPERATOR(%)
DECLARE_COMPOUND_OPERATOR(&)
DECLARE_COMPOUND_OPERATOR(|)
DECLARE_COMPOUND_OPERATOR(^)
DECLARE_COMPOUND_OPERATOR(>>)
DECLARE_COMPOUND_OPERATOR(<<)

//Increment Prefix
template <class TA>
auto operator ++(TA& a) -> typename enable_if_is_prop<TA, decltype(a.get()) >::type
{
    a = (a.get() + 1);
    return a.get();
}

//Increment Suffix
template <class TA>
auto operator ++(TA& a, int) -> typename enable_if_is_prop<TA, decltype(a.get()) >::type
{
    auto temp = a.get();
    a = (a.get() + 1);
    return temp;
}

//Decrement Prefix
template <class TA>
auto operator --(TA& a) -> typename enable_if_is_prop<TA, decltype(a.get()) >::type
{
    a = (a.get() - 1);
    return a.get();
}

//Decrement Suffix
template <class TA>
auto operator --(TA& a, int) -> typename enable_if_is_prop<TA, decltype(a.get()) >::type
{
    auto temp = a.get();
    a = (a.get() - 1);
    return temp;
}

//Logical negation (NOT)
template <class TA>
auto operator !(const TA& a) -> typename std::enable_if < is_property<TA>::value, decltype(!eval(a)) >::type
{
    return !a.get();
}

template <class TA>
auto operator ~(const TA& a) -> typename enable_if_is_prop<TA, decltype(~a.get()) >::type
{
    return ~a.get();
}

//iostrem
template<class Elem,  class Traits, class TB> inline
typename enable_if_is_prop<TB, std::basic_ostream<Elem, Traits>& >::type
         operator << (std::basic_ostream<Elem, Traits>& os, const TB& b)
{
    return os << b.get();
}




```

----

### sample.cpp
```cpp

#include <cassert>
#include <string>
#include <iostream>
#include "properties.h"

struct X
{
    std::string m_text;

    void set_text(std::string value)
    {
        m_text = value;
    }

    std::string get_text() const
    {
        return m_text;
    }

    PROPERTY(X, get_text,set_text, text);

    int m_width;

    void set_width(int value)
    {
        m_width = value;
    }

    int get_width() const
    {
        return m_width;
    }

    PROPERTY(X, get_width, set_width, width);

    bool m_b;

    void set_b(bool value)
    {
        m_b = value;
    }

    bool get_b() const
    {
        return m_b;
    }

    PROPERTY(X, get_b, set_b,  b);

};

struct X2
{

    std::string m_text2;

    void set_text2(const char* value)
    {
          m_text2 = value;
    }
    void set_text2(std::string value)
    {
        m_text2 = value;
    }

    const std::string& get_text2() const
    {
        return m_text2;
    }

    PROPERTY(X2, get_text2, set_text2, text2);

    int m_width;

    void set_width(int value)
    {
        m_width = value;
    }

    int get_width() const
    {
        return m_width;
    }

    PROPERTY(X, get_width, set_width, width);

    bool m_b;

    bool get_b() const
    {
        return m_b;
    }
    
    READ_ONLY_PROPERTY(X, get_b, b);
};

void f(int) {}
void f1(const int) {}
void f2(int&) {}
void f3(double) {}
void f4(const std::string&) {}


int main()
{
    X x;
    X2 x2;
    bool b = x.text <= x2.text2;
    b = x2.text2 <= x.text;
    x.text = x2.text2;
    x.text == x2.text2;
    x.text != x2.text2;
    x.text != "aa";
    x.text = "aa";
    x.text = x.text + "b";
    x.text = "a" + x.text;
    x.text += "c";
    x.text = x.text + x2.text2;
    x2.text2="text2";
    b = (x.text == "aa");
    b = x.text > x2.text2;
    b = x.text < x2.text2;
    b = x.text < "a";
    //x2.b = true; //b is read only
    f4(x.text);
    b = x.text <= x2.text2;
    x.width = !x.width;
    x.width = 1;
    x.width += 1;
    x.width -= 1;
    x.width *= 1;
    x.width /= 1;
    x.width = x.width == 2 || x.width == 1;
    x.width = x.width && x.width ;

    b = x2.b;
    x.b = false;
    x.b = !x.b;
    x.b == x2.b;
    x.width++;
    x.width--;

    x.b = x.b || 1;
    x.b = x.b || x2.b;
    x.width = x.width && 1;
    x.width = x.width && x.width;
    x.width += x.width;
    x.width -= 1;
    x2.width = 2;
    x.width == x2.width;
    x.width++;
    x.width >= 1;
    x.width >= x2.width;
    x.width <= x2.width;
    b = x.width < x2.width;
    b = x.width > x2.width;
    f(x.width);
    f1(x.width);
    ++x.width;
    x.width = x2.width + 1;
    x.width = x.width  + x2.width;
    x.width = x.width  - x2.width;

    x.width = 5;
    assert(x.width % 2  == 1);
    x.width = 1;
    x2.width = 2;
    assert(x2.width > x.width);
    assert(x.width < x2.width);
    x.width <= x2.width;
    x.width >= x2.width;
    x.width != x2.width;

    if (x.text().empty())
    {
    }
    
    x.text().clear(); //ok
    //x2.text2().clear(); // error

    std::cout << x.width;
    std::cout << x.text;
}


```


