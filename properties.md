
##C++ Properties using C++ 11 

A property is a "virtual field".
When the virtual field is used as rvalue it calls some get function.
When the virtual field is used as lvalue it calls the best set_ function.

The idea behind this implementation is to detect when the field is used as lvalue using 
operator =, and to detect when the field is used as rvalue overriding operators +,- etc.


###Sample

```cpp
auto result = x.prop;
x.prop = something;
```
will be equivalent of:
```cpp
auto result = x.get_prop();
x.set_prop(something);
```

###Tested with:
 * VC++ 2010
 * VC++ 2011 Preview
 * CLang (Xcode 4.2)


----
##properties.h

```cpp
//
// Copyright (C) 2012, Thiago R. Adams
// http://www.thradams.com
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.
//

#pragma once

#include <type_traits>
#include  <ostream>

struct Property {};

template<class T>
struct is_property : public std::is_base_of<Property, T> {};


template <class T>
auto eval(const T& v)
-> typename std::enable_if < is_property<T>::value, decltype(v.get())>::type
{
    return v.get();
}

template <class T>
auto eval(const T& v)
-> typename std::enable_if < !is_property<T>::value, decltype(v) >::type
{
    return v;
}

#define READ_ONLY_PROPERTY(CLASSTYPE, GETFUNC, GETTYPE, name)\
struct CLASSTYPE_##name : public Property\
{\
  template<class T> operator T()\
  {\
      return get();\
  }\
  GETTYPE operator ()() const \
  {\
      return get();\
  }\
  operator GETTYPE()\
  {\
      return get();\
  }\
  GETTYPE get() const \
  {\
     return reinterpret_cast<const CLASSTYPE*>(this - offsetof(CLASSTYPE, name))->GETFUNC();\
  }\
} name

#define PROPERTY(CLASSTYPE, GETFUNC, SETFUNC,GETTYPE, name)\
struct CLASSTYPE_##name : public Property\
{\
    typedef CLASSTYPE_##name MyType;\
    template<class T> operator T()\
    {\
        return get();\
    }\
    GETTYPE operator ()() const \
    {\
        return get();\
    }\
    operator GETTYPE()\
    {\
        return get();\
    }\
    GETTYPE get() const \
    {\
       return reinterpret_cast<const CLASSTYPE*>(this - offsetof(CLASSTYPE, name))->GETFUNC();\
    }\
    template <class T> typename std::enable_if<is_property<T>::value, MyType&>::type\
    operator =(T&& value)\
    {\
        reinterpret_cast<CLASSTYPE*>(this - offsetof(CLASSTYPE, name))->SETFUNC(std::forward<T>(value.get()));\
        return *this;\
    }\
    template <class T> typename std::enable_if<!is_property<T>::value, MyType&>::type\
    operator =(T&& value)\
    {\
        reinterpret_cast<CLASSTYPE*>(this - offsetof(CLASSTYPE, name))->SETFUNC(std::forward<T>(value));\
        return *this;\
    }\
} name


/// === Arithmetic operators ===

//Addition
template <class TA, class TB>
auto operator +(const TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value ||
is_property<TB>::value,
            decltype(eval(a) + eval(b)) >::type
{
    return eval(a) + eval(b);
}

//Subtraction
template <class TA, class TB>
auto operator -(const TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value ||
is_property<TB>::value,
            decltype(eval(a) - eval(b)) >::type
{
    return eval(a) - eval(b);
}


//Unary plus (integer promotion)
//TODO
//Unary minus (additive inverse)
//TODO

//Multiplication
template <class TA, class TB>
auto operator *(const TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value ||
is_property<TB>::value,
            decltype(eval(a) * eval(b)) >::type
{
    return eval(a) * eval(b);
}

//Division
template <class TA, class TB>
auto operator /(const TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value ||
is_property<TB>::value,
            decltype(eval(a) / eval(b)) >::type
{
    return eval(a) / eval(b);
}

//Modulo (remainder)
template <class TA, class TB>
auto operator %(const TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value ||
is_property<TB>::value,
            decltype(a.get() % b) >::type
{
    return eval(a) % eval(b);
}

//Increment Prefix
template <class TA>
auto operator ++(TA& a)
-> typename std::enable_if < is_property<TA>::value,
decltype(a.get()) >::type
{
    a = (a.get() + 1);
    return a.get();
}

//Increment Suffix
template <class TA>
auto operator ++(TA& a, int)
-> typename std::enable_if < is_property<TA>::value,
decltype(a.get()) >::type
{
    auto temp = a.get();
    a = (a.get() + 1);
    return temp;
}
//Decrement Prefix
template <class TA>
auto operator --(TA& a)
-> typename std::enable_if < is_property<TA>::value ,
decltype(a.get()) >::type
{
    a = (a.get() - 1);
    return a.get();
}

//Decrement Suffix
template <class TA>
auto operator --(TA& a, int)
-> typename std::enable_if < is_property<TA>::value ,
decltype(a.get()) >::type
{
    auto temp = a.get();
    a = (a.get() - 1);
    return temp;
}

// ===Comparison operators/relational operators===

//Equal to
template <class TA, class TB>
auto operator ==(const TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value ||
is_property<TB>::value,
            decltype(eval(a) == eval(b)) >::type
{
    return eval(a) == eval(b);
}


//Not equal to
template <class TA, class TB>
auto operator !=(const TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value ||
is_property<TB>::value,
            decltype(eval(a) != eval(b)) >::type
{
    return eval(a) != eval(b);
}

//Greater than
//bug clang? decltype(eval(a) > eval(b)), bool works
template <class TA, class TB>
auto operator > (const TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value ||
is_property<TB>::value,
            bool >::type
{
    return eval(a) > eval(b);
}

//Less than
template <class TA, class TB>
auto operator <(const TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value ||
is_property<TB>::value,
            decltype(eval(a) < eval(b)) >::type
{
    return eval(a) < eval(b);
}

//Greater than or equal to
template <class TA, class TB>
auto operator >=(const TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value ||
is_property<TB>::value,
            decltype(eval(a) >= eval(b)) >::type
{
    return eval(a) >= eval(b);
}

//Less than or equal to
template <class TA, class TB>
auto operator <=(const TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value ||
is_property<TB>::value,
            decltype(eval(a) <= eval(b)) >::type
{
    return eval(a) <= eval(b);
}

// === Logical operators ===

//Logical negation (NOT)
template <class TA>
auto operator !(const TA& a)
-> typename std::enable_if < is_property<TA>::value ,
decltype(!eval(a)) >::type
{
    return !a.get();
}

//Logical AND
//Logical OR

// ===Bitwise operators===
//Bitwise NOT
template <class TA>
auto operator ~(const TA& a)
-> typename std::enable_if < is_property<TA>::value ,
decltype(~a.get()) >::type
{
    return ~a.get();
}
//Bitwise AND
//Bitwise XOR

template<class Elem,    class Traits, class TB> inline
typename std::enable_if < is_property<TB>::value,
         std::basic_ostream<Elem, Traits>& >::type
         operator << (std::basic_ostream<Elem, Traits>& os, const TB& b)
{
    return os << b.get();
}

//Bitwise right shift
//TODO

//===Compound assignment operators===

//Addition assignment

template <class TA, class TB>
auto operator += (TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value, TA& >::type
{
    a = (a.get() + b);
    return a;
}

//Subtraction assignment
template <class TA, class TB>
auto operator -= (TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value, TA& >::type
{
    a = (a.get() - b);
    return a;
}

//Multiplication assignment
template <class TA, class TB>
auto operator *= (TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value, TA& >::type
{
    a = (a.get() * b);
    return a;
}

//Division assignment
template <class TA, class TB>
auto operator /= (TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value, TA& >::type
{
    a = (a.get() / b);
    return a;
}

//Modulo assignment
template <class TA, class TB>
auto operator %= (TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value, TA&>::type
{
    a = (a.get() % b);
    return a;
}

//Bitwise AND assignment
template <class TA, class TB>
auto operator &= (TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value,
decltype(a.get() &= b) >::type
{
    return a = (a.get() & b);
}

//Bitwise OR assignment
template <class TA, class TB>
auto operator |= (TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value,
decltype(a.get() |= b) >::type
{
    return a = (a.get() | b);
}

//Bitwise XOR assignment
template <class TA, class TB>
auto operator ^= (TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value ,
decltype(a.get() ^= b) >::type
{
    return a = (a.get() ^ b);
}

//Bitwise left shift assignment
template <class TA, class TB>
auto operator <<= (TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value,
decltype(a.get() <<= b) >::type
{
    return a.get() <<= b;
}

//Bitwise right shift assignment
template <class TA, class TB>
auto operator >>= (TA& a, const TB& b)
-> typename std::enable_if < is_property<TA>::value,
decltype(a.get() >>= b) >::type
{
    return a.get() >>= b;
}

//==Member and pointer operators==
//==Other operators==


```
----

##Testing

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

    PROPERTY(X, get_text,set_text, std::string, text);

    int m_width;

    void set_width(int value)
    {
        m_width = value;
    }

    int get_width() const
    {
        return m_width;
    }

    PROPERTY(X, get_width, set_width, int, width);

    bool m_b;

    void set_b(bool value)
    {
        m_b = value;
    }

    bool get_b() const
    {
        return m_b;
    }

    PROPERTY(X, get_b, set_b,  bool, b);

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

    PROPERTY(X2, get_text2, set_text2, const std::string&, text2);

    int m_width;

    void set_width(int value)
    {
        m_width = value;
    }

    int get_width() const
    {
        return m_width;
    }

    PROPERTY(X, get_width, set_width,int,  width);

    bool m_b;

    bool get_b() const
    {
        return m_b;
    }
    
    READ_ONLY_PROPERTY(X, get_b, bool, b);
};

void f(int) {}
void f1(const int) {}
void f2(int&) {}
void f3(double) {}
void f4(const std::string&) {}


template <typename R, typename C> R get_return_type(R (C::*)(void));


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

##History

* 10/10/2012 New version [[properties2.htm]]
* 28/08/2012 Version using VC++ 2012 ok
* 23/01/2012 Version using VC++ 11 preview
* 22/01/2012 Clang fixes 
* 18/01/2012 published
* 19/01/2012 non const get also suported

##Limitations of this implementation

 * Some operators are misssing
 * Code like this one will not compile
```cpp
  bool b = x.prop.empty();
  where prop is std::string
```
  This is because there is no overload for operator dot.

The workaround is to use operator ()
```
  bool b = x.prop().empty();
```

##See also
http://msdn.microsoft.com/en-us/library/yhfk0thd(v=vs.80).aspx



----


##Compiling using Visual C++ 11 Preview

Using VC++ 11 preview or Clang is possible to find out the "get" return type.

```cpp
#include <type_traits>
#include  <ostream>

struct Property {};

template<class T>
struct is_property : public std::is_base_of<Property, T> {};


template <class T>
auto eval(const T& v)
-> typename std::enable_if < is_property<T>::value, decltype(v.get())>::type
{
    return v.get();
}

template <class T>
auto eval(const T& v)
-> typename std::enable_if < !is_property<T>::value, decltype(v) >::type
{
    return v;
}

template <typename R, typename O>
R ReturnType(R (O::*)(void) const) 
{ 
  return R();
}

#define READ_ONLY_PROPERTY(CLASSTYPE, GETFUNC, name)\
struct CLASSTYPE_##name : public Property\
{\
  typedef decltype(ReturnType(&CLASSTYPE::GETFUNC)) GETTYPE;\
  template<class T> operator T()\
  {\
      return get();\
  }\
  GETTYPE operator ()() const \
  {\
      return get();\
  }\
  operator GETTYPE()\
  {\
      return get();\
  }\
  GETTYPE get() const \
  {\
     return reinterpret_cast<const CLASSTYPE*>(this - offsetof(CLASSTYPE, name))->GETFUNC();\
  }\
} name

#define PROPERTY(CLASSTYPE, GETFUNC, SETFUNC, name)\
struct CLASSTYPE_##name : public Property\
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
    operator GETTYPE()\
    {\
        return get();\
    }\
    GETTYPE get() const \
    {\
       return reinterpret_cast<const CLASSTYPE*>(this - offsetof(CLASSTYPE, name))->GETFUNC();\
    }\
    template <class T> typename std::enable_if<is_property<T>::value, MyType&>::type\
    operator =(T&& value)\
    {\
        reinterpret_cast<CLASSTYPE*>(this - offsetof(CLASSTYPE, name))->SETFUNC(std::forward<T>(value.get()));\
        return *this;\
    }\
    template <class T> typename std::enable_if<!is_property<T>::value, MyType&>::type\
    operator =(T&& value)\
    {\
        reinterpret_cast<CLASSTYPE*>(this - offsetof(CLASSTYPE, name))->SETFUNC(std::forward<T>(value));\
        return *this;\
    }\
} name



...

```

Sample of use:
```
...
    PROPERTY(X, get_width, set_width, width);
...
    READ_ONLY_PROPERTY(X, get_b, b);
...
```
