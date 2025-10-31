##Container Queries

Similar (not equal) functionality of C# LINQ in C++

```cpp
#include "stdafx.h"
#include <vector>
#include <iostream>
#include <functional>

using namespace std;

template<class T> 
struct IEnumerable
{
    typedef T ValueType;
    virtual bool Next() = 0;
    virtual T Current() const = 0;
};

template<class Iterator>
struct EnumerableAll : public IEnumerable<typename Iterator::value_type>
{
    typedef typename Iterator::value_type T;
    typedef T ValueType;

    Iterator it;
    Iterator end;
    bool first;

    EnumerableAll(const Iterator& begin, const Iterator& e)
    {
        first = true;
        it = begin;
        end =  e;
    }

    bool Next()
    {
        if (first)
        {
            first = false;
        }
        else
            it++;

        return it != end;
    }

    T Current() const
    {
        return *it;
    }
};

template<class EnumerateType, class Predicate>
struct EnumerableWhere : public IEnumerable< typename EnumerateType::ValueType >
{
    typedef typename EnumerateType::ValueType ValueType;

    EnumerateType en;
    Predicate m_p;

    EnumerableWhere(EnumerateType e, const Predicate& p) : en(e), m_p(p)
    {
    }

    bool Next()
    {
        bool b;
        for (;;)
        {
            b = en.Next();
            if (!b || m_p(en.Current()))
                break;
        }
        return b;
    }

    ValueType Current() const
    {
        return en.Current();
    }
};

template<class EnumerateType, class ConvertionType>
struct EnumerableSelect : public IEnumerable< typename ConvertionType::To >
{
    typedef typename ConvertionType::To  ValueType;
    EnumerateType en;
    ConvertionType convert;

    EnumerableSelect(const EnumerateType& e,
                     const ConvertionType& ss)
            : en(e),
            convert(ss)
    {
    }

    bool Next() { return en.Next(); }

    ValueType Current() const {
        return convert(en.Current());
    }
};

template<class T>
EnumerableAll<typename T::iterator> From(T& v) {
    return EnumerableAll<typename T::iterator>(v.begin(), v.end());
}

template<class Predicate>
struct WhereType
{
    typedef Predicate PredicateType;
    const Predicate &p;
    WhereType(const Predicate& pp) : p(pp) { }
};

template<class Predicate>
WhereType<Predicate> Where(const Predicate& pp) {
    return WhereType<Predicate>(pp);
}

template<class EnumerableType, class Predicate>
EnumerableWhere<EnumerableType, Predicate>
operator >> (const EnumerableType& en, const WhereType<Predicate>& were)
{
    return EnumerableWhere<EnumerableType, Predicate>(en, were.p);
}

//primary
template<class From, class To> struct ConvertType;


template<class ClassType, class DataType>
struct ConvertDataMemberType
{
    typedef ClassType From;
    typedef DataType To;

    DataType ClassType::*m_p;

    ConvertDataMemberType(DataType ClassType::*p) : m_p(p) {}

    To operator()(const From& from) const {
        return from.*m_p;
    }
};

template <class AnyConverter>
AnyConverter Select(const AnyConverter& c) { return c; }

template <class ClassType, class DataType>
ConvertDataMemberType<ClassType, DataType> Select(DataType ClassType::*p)
{
    return ConvertDataMemberType<ClassType, DataType>(p);
}

template<class EnumerableType, class ConvertType>
EnumerableSelect<EnumerableType, ConvertType>
operator >> (const ConvertType& converter, const EnumerableType& en)
{
    return EnumerableSelect<EnumerableType, ConvertType>(en, converter);
}

struct Point
{
    int x;
    int y;
    Point(int xx, int yy) : x(xx), y(yy) {}
};


int main()
{
    std::vector<Point> v;
    v.push_back(Point(1, 1));
    v.push_back(Point(2, 1));
    v.push_back(Point(3, 1));

    IEnumerable<Point> & en1 = From(v);
    while (en1.Next())
        cout << en1.Current().x << ", ";

    cout << endl;

    IEnumerable<int>& en = Select(&Point::x) >> 
                           From(v) >>
                           Where(std::bind2nd(std::less<int>(), 3));

    while (en.Next())
        cout << en.Current() << ", ";

    return 0;
}
}}}
Using auto from C++ 0x

{{{cpp

#include <vector>
#include <iostream>
#include <functional>

using namespace std;

template<class Iterator>
struct EnumerableAll
{
    typedef typename Iterator::value_type T;
    typedef T ValueType;

    Iterator it;
    Iterator end;
    bool first;

    EnumerableAll(const Iterator& begin, const Iterator& e)
    {
        first = true;
        it = begin;
        end =  e;
    }

    bool Next()
    {
        if (first)
        {
            first = false;
        }
        else
            it++;

        return it != end;
    }

    T Current() const
    {
        return *it;
    }
};

template<class EnumerateType, class Predicate>
struct EnumerableWhere
{
    typedef typename EnumerateType::ValueType ValueType;

    EnumerateType en;
    Predicate m_p;

    EnumerableWhere(EnumerateType e, const Predicate& p) : en(e), m_p(p)
    {
    }

    bool Next()
    {
        bool b;
        for (;;)
        {
            b = en.Next();
            if (!b || m_p(en.Current()))
                break;
        }
        return b;
    }

    ValueType Current() const
    {
        return en.Current();
    }
};

template<class EnumerateType, class ConvertionType>
struct EnumerableSelect
{
    typedef typename ConvertionType::To  ValueType;
    EnumerateType en;
    ConvertionType convert;

    EnumerableSelect(const EnumerateType& e,
                     const ConvertionType& ss)
            : en(e),
            convert(ss)
    {
    }

    bool Next() { return en.Next(); }

    ValueType Current() const {
        return convert(en.Current());
    }
};

template<class T>
EnumerableAll<typename T::iterator> From(T& v) {
    return EnumerableAll<typename T::iterator>(v.begin(), v.end());
}

template<class Predicate>
struct WhereType
{
    typedef Predicate PredicateType;
    const Predicate &p;
    WhereType(const Predicate& pp) : p(pp) { }
};

template<class Predicate>
WhereType<Predicate> Where(const Predicate& pp) {
    return WhereType<Predicate>(pp);
}

template<class EnumerableType, class Predicate>
EnumerableWhere<EnumerableType, Predicate>
operator >> (const EnumerableType& en, const WhereType<Predicate>& were)
{
    return EnumerableWhere<EnumerableType, Predicate>(en, were.p);
}

//primary
template<class From, class To> struct ConvertType;


template<class ClassType, class DataType>
struct ConvertDataMemberType
{
    typedef ClassType From;
    typedef DataType To;

    DataType ClassType::*m_p;

    ConvertDataMemberType(DataType ClassType::*p) : m_p(p) {}

    To operator()(const From& from) const {
        return from.*m_p;
    }
};

template <class AnyConverter>
AnyConverter Select(const AnyConverter& c) { return c; }

template <class ClassType, class DataType>
ConvertDataMemberType<ClassType, DataType> Select(DataType ClassType::*p)
{
    return ConvertDataMemberType<ClassType, DataType>(p);
}

template<class EnumerableType, class ConvertType>
EnumerableSelect<EnumerableType, ConvertType>
operator >> (const ConvertType& converter, const EnumerableType& en)
{
    return EnumerableSelect<EnumerableType, ConvertType>(en, converter);
}

struct Point
{
    int x;
    int y;
    Point(int xx, int yy) : x(xx), y(yy) {}
};


int main()
{
    std::vector<Point> v;
    v.push_back(Point(1, 1));
    v.push_back(Point(2, 1));
    v.push_back(Point(3, 1));

    auto en1 = From(v);
    while (en1.Next())
        cout << en1.Current().x << ", ";

    cout << endl;

    auto en = Select(&Point::x) >> 
                        From(v) >>
                        Where([](int i){ return i < 3; });

    while (en.Next())
        cout << en.Current() << ", ";

    return 0;
}

```
