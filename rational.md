##Rational Number class

Rational class (scratch).

When using rational classes is not uncommon to have overflows. In this case is interesting to use a Safe int type to catch errors.

You can find a safe int class in:http://safeint.codeplex.com/

```cpp
// Copyright (C) 2009, Thiago Adams (thiago.adams@gmail.com)
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.

template<class T>
T GreatestCommonDivisor(T a, T b)
{
  if (a < 0)
    a = -a;
  
  if (b < 0) 
    b = -b;

  if (a == 0 && b == 0) 
    return 0;

  T temp;
  while (b)
  {
    temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

template<class T>
class Rational
{
    T m_d;
    T m_n;

public:
    Rational() : m_n(0) , m_d(1) { }
    Rational(T n) : m_n(n) , m_d(1) { }
    Rational(T n,T d) : m_n(n), m_d(d) { }
    
    Rational& operator = (const Rational& other)
    {
        m_n = other.N();
        m_d = other.D();;
        return *this;
    }
    
    const T& D() const
    {
        return m_d;
    }

    const T& N() const
    {
        return m_n;
    }

    const T& Denominator() const
    {
        return D();
    }

    const T& Numerator() const
    {
        return N();
    }

    T IntegerPart() const
    {
      return Numerator() / Denominator();
    }
    
    T Remain() const
    {
        return Numerator() % Denominator();
    }

    bool IsInteger() const
    {
        return  Remain() == 0;
    }

    void Simplify()
    {
        T n = GreatestCommonDivisor(Numerator(), Denominator());

        if (n != 0)
        {
            m_n = Numerator() / n;
            m_d = Denominator() / n;
        }
    }
};
typedef Rational<int> RationalInt;
typedef Rational<long long> Rational64;

template<class T>
Rational<T> operator - (const Rational<T>& left, const Rational<T>& other)
{
  return Rational<T>(left.N() * other.D() - left.D() * other.N(), left.D() * other.D());
}

template<class T>
Rational<T> operator - (const T& left, const Rational<T>& other)
{
  return Rational<T>(left * other.D() - 1 * other.N(),  other.D());
}

template<class T>
Rational<T> operator + (const Rational<T>& left,const Rational<T>& other)
{
  return Rational<T>(left.N() * other.D() + left.D() * other.N(), left.D() * other.D());
}

template<class T>
Rational<T> operator * (const Rational<T>& left,const Rational<T>& other)
{
  return Rational<T>(left.N() * other.N(), left.D() * other.D());
}

template<class T>
Rational<T> operator * (const T& v, const Rational<T>& other)
{
  return Rational<T>(v * other.N(), other.D());
}

template<class T>
Rational<T> operator * (const Rational<T>& left,const T& other)
{
  return Rational<T>(left.N() * other, left.D());
}

template<class T>
Rational<T> operator / (const Rational<T>& left,const Rational<T>& other)
{
  return Rational<T>(left.N() * other.D(), left.D() * other.N());
}

template<class T>
Rational<T> operator / (const Rational<T>& left, const T& v)
{
  return Rational<T>(left.N(), left.D() * v);
}

template<class T>
bool operator == (const Rational<T>& left,const Rational<T>& other)
{
  return Rational<T>(other - left).N() == 0;
}

template<class T>
bool operator == (const Rational<T>& left,const T& other)
{
  return Rational<T>(other - left).N() == 0;
}

template<class T>
bool operator != (const Rational<T>& left,const Rational<T>& other)
{
  return !operator ==(other);
}

//Add more operators here...

template<class _Elem, class _Tr, class T>
std::basic_ostream<_Elem, _Tr> &
operator << (std::basic_ostream<_Elem, _Tr> & stream,
             const Rational<T> & r)
{
    stream << r.Numerator() << (_Elem)'\\' << r.Denominator();    
    return stream;
}

typedef Rational<int> RationalInt;
typedef Rational<long long> Rational64;

Tests


using namespace UnitTest;

TEST_FUNCTION(Test1)()
{
    AreEqual(RationalInt(), 0);
}

TEST_FUNCTION(Test2)()
{
    AreEqual(RationalInt(1), 1);
}

TEST_FUNCTION(Test3)()
{
    AreEqual(RationalInt(2, 1), RationalInt(10, 5));
}
TEST_FUNCTION(Test4)()
{
    RationalInt r1(1, 3);
    r1 = r1 + r1 + r1;
    RationalInt r2(1);
    AreEqual(r1, r2);
}
TEST_FUNCTION(Test5)()
{
    RationalInt r1(1, 3);
    r1 = r1 + r1 + r1;
    RationalInt r2 = r1 / 3;
    AreEqual(r2, RationalInt(1, 3));
}

TEST_FUNCTION(Test6)()
{
    IsTrue(RationalInt(1).IsInteger());
    IsTrue(RationalInt().IsInteger());
    IsTrue(RationalInt(3, 1).IsInteger());    
}

TEST_FUNCTION(Test7)()
{
    RationalInt r1(200);
    r1 = r1 / 3;
    r1 = r1 * 3;
    AreEqual(r1, 200);
}

int main()
{
    ConsoleReport rep;
    RunAll(rep);
    return rep.GetFailedCount();
}

```
