##Pattern matching

Generic algorithms to find patterns similar to regular expressions 

Operators:
```
(Expression) * OneOrMore : 
(Expression) * ZeroOrMore : 
(Expression) * Optional : 
! (Expression) : Not 
(Left)&(Right) : And 
(Left)|(Right) : Or 
Val(iterator::value_type) : Matches this value
Range(begin, end) : Matches if the value is in the interval begin end
```

Sample

```cpp
int main()
{
    std::string s = "a 123 b 45.67 c" ;
    using namespace PatternMatching;

    find_replace(s,
                 Range('0', '9') * OneOrMore & ('.' & Range('0', '9') * OneOrMore) * Optional,
                 std::string("NUMBER"));



    using namespace PatternMatching;
    std::wstring ss = L"121.54";

    Result r;
    //number :  digit+ ('.' digit+)?
    std::wstring::iterator it = Match(ss.begin(), ss.end(),
                                      Range(L'0', L'9') * OneOrMore & (L'.' & Range(L'0', L'9') * OneOrMore) * Optional, r);
    if (r)
    {
//        std::wcout << *it;
    }

    std::vector<int> v;
    v.push_back(1);
    v.push_back(2);
    v.push_back(2);
    v.push_back(4);

    //while not 2 walk...
    std::vector<int>::iterator it2 = Match(v.begin(), v.end(), ! Val(2) * ZeroOrMore, r);
    if (it2 != v.begin())
    {
        std::cout << *it2;
    }

    std::vector<int>::iterator it3 =  Find(v.begin(), v.end(), (Val(2) | Val(3)) * OneOrMore);

    return 0;
}

```

Code
```cpp


// Copyright (C) 2009, Thiago Adams (thiago.adams@gmail.com)
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.

namespace PatternMatching
{
    enum Result
    {
        ResultFalse = 0,
        ResultTrue,
        ResultTrueOptional,
        ResultFalseOptional
    };

    template<class Iterator, class Expression>
    Iterator Match(const Iterator& begin,
                   const Iterator& end,
                   const Expression& expr,
                   Result& result)
    {
        return expr.Match(begin, end, result);
    }

//especialization
    template<class Iterator>
    Iterator Match(const Iterator& begin,
                   const Iterator& end,
                   const typename Iterator::value_type& value,
                   Result& result)
    {
        result = ResultFalse;
        std::cout << "Val" << std::endl;
        if (begin == end)
            return begin;
        result = (*begin == value) ? ResultTrue : ResultFalse;
        if (result)
        {
            return begin;// + 1;
        }
        return begin;
    }


    template<class T>
    struct ValT
    {
        T ch;
        ValT(const T& c) : ch(c) {}

        template<class Iterator>
        Iterator Match(const Iterator& begin,
                       const Iterator& end,
                       Result& result) const
        {
            std::cout << "ValT" << std::endl;
            result = ResultFalse;
            if (begin == end)
                return begin;

            result = (*begin == ch) ? ResultTrue : ResultFalse;
            //if (result)
            //{
            //  return begin;// + 1;
            //}
            return begin;
        }
    };
    template <class T>
    ValT<T> Val(const T& v)
    {
        return v;
    }


    template<class T>
    struct RangeT
    {
        T m_begin;
        T m_end;
        RangeT(T b, T e) : m_begin(b), m_end(e) {}

        template<class Iterator>
        Iterator Match(const Iterator& begin,
                       const Iterator& end,
                       Result& result) const
        {
            std::cout << "Range" << std::endl;
            result = ResultFalse;
            if (begin == end)
                return begin;
            if ((*begin >= m_begin) && (*begin <= m_end))
                result = ResultTrue;
            else
                result = ResultFalse;
            //if (result)
            //{
            //  return begin ;//+ 1;
            //}
            return begin;
        }
    };
    template <class T>
    RangeT<T> Range(const T& begin, const T& end)
    {
        return RangeT<T>(begin, end);
    }


    template<class Expr>
    struct NotExpression
    {
        Expr exp;
        NotExpression(const Expr& ll) : exp(ll) {}
        template<class Iterator>
        Iterator Match(const Iterator& begin,
                       const Iterator& end,
                       Result& result) const
        {
            std::cout << "Not" << std::endl;
            if (begin == end)
                return begin;
            Iterator it = PatternMatching::Match(begin, end, exp, result);
            if (result == ResultFalse)
            {
                result = ResultTrue;
                return begin;
            }
            else
            {
              result = ResultFalse;
            }
            return it;
        }
    };

    template<class Expr>
    NotExpression<Expr> operator!(const Expr& a)
    {
        return NotExpression<Expr>(a);
    }


    enum ZeroOrMoreT {ZeroOrMore};
    template <class Expr>
    struct ZeroOrMoreExpression
    {
        Expr exp;
        ZeroOrMoreExpression(const Expr& e) : exp(e) {}

        template<class Iterator>
        Iterator Match(const Iterator& begin,
                       const Iterator& end,
                       Result& result) const
        {
            std::cout << "ZeroOrMore" << std::endl;
            result = ResultFalse;
            if (begin == end)
                return begin;
            Iterator it(begin);
            result = ResultTrue;
            while (result == ResultTrue)
            {
                Result r;
                Iterator it2 = PatternMatching::Match(it, end, exp, r);
                if (r == ResultFalse)
                    break;
                it++;//passa p frente
                it = it2;
            }
            return it;
        }
    };


    enum OneOrMoreT {OneOrMore};
    template <class Expr>
    struct OneOrMoreExpression
    {
        Expr exp;
        OneOrMoreExpression(const Expr& e) : exp(e) {}

        template<class Iterator>
        Iterator Match(const Iterator& begin,
                       const Iterator& end,
                       Result& result) const
        {
            std::cout << "OneOrMore" << std::endl;

            result = ResultFalse;
            if (begin == end)
                return begin;
            Iterator it(begin);

            it = PatternMatching::Match(begin, end, exp, result);
            if (result == ResultFalse)
                return begin;
            result = ResultTrue;

            Iterator it2 = it;
            it2++;//passa p frente

            for (;it2 != end;)
            {
                Result r2;
                it2 = PatternMatching::Match(it2, end, exp, r2);
                if (r2 == ResultFalse)
                    break;
                result = ResultTrue;
                it = it2;
                if (it2 == end)
                  break;
                it2++;//passa p frente
            }
            return it;
        }
    };

    struct OptionalExpressionType {};

    enum OptionalT {Optional};
    template <class Expr>
    struct OptionalExpression : public OptionalExpressionType
    {
        Expr exp;
        OptionalExpression(const Expr& e) : exp(e) {}

        template<class Iterator>
        Iterator Match(const Iterator& begin,
                       const Iterator& end,
                       Result& result) const
        {
            std::cout << "Optional" << std::endl;
            result = ResultFalse;

            if (begin == end)
                return begin;

            Iterator it = PatternMatching::Match(begin, end, exp, result);
            if (result == ResultFalse)
                result = ResultFalseOptional;
            else
                result = ResultTrueOptional;

            return it;
        }
    };

    template<class left, class right>
    struct AndExpression
    {
        left l;
        right r;
        AndExpression(const left& ll,
                      const right& rr) : r(rr), l(ll)
        {
        }

        template<class Iterator>
        Iterator Match(const Iterator& begin,
                       const Iterator& end,
                       Result& result) const
        {
          result = ResultFalse;
           if (begin == end)
             return begin;

            std::cout << "And" << std::endl;
            
            Iterator it = PatternMatching::Match(begin, end, l, result);
            if (result == ResultFalse)
                return begin;

            Iterator it2 = it;
            it2++; //passar 1 p frente

            it2 = PatternMatching::Match(it2, end, r, result);
            if (result == ResultFalse)
                return begin;

            if (result == ResultFalseOptional)
            {
                result = ResultTrue;
                //fica parado
                it = it;
            }
            else if (result == ResultTrueOptional)
            {
                result = ResultTrue;
                it = it2; //commit
            }
            else
            {
                it = it2; //commit
            }

            return it;
        }
    };
    template<class left, class right>
    struct OrExpression
    {
        left l;
        right r;
        OrExpression(const left& ll,
                     const right& rr) : r(rr), l(ll)
        {
        }

        template<class Iterator>
        Iterator Match(const Iterator& begin,
                       const Iterator& end,
                       Result& result) const
        {
            std::cout << "Or" << std::endl;
            Iterator it = PatternMatching::Match(begin, end, l, result);
            if (result)
                return it;
            Iterator it2(it);
            it2++;

            it2 = PatternMatching::Match(it2, end, r, result);
            if (result != ResultFalse)
            {
                it = it2; //comit
            }
            return it;
        }
    };

    template<class Iterator>
    struct FunctionExpression
    {
        typedef Iterator(*MatchFunction)(const Iterator& begin,
                                         const Iterator& end,
                                         Result& result);
        MatchFunction m_f;

        FunctionExpression(MatchFunction f): m_f(f) {}

        template<class Iterator>
        Iterator Match(const Iterator& begin,
                       const Iterator& end,
                       Result& result) const
        {
            std::cout << "F" << std::endl;
            return (*m_f)(begin, end, result);
        }
    };

    template<class Iterator>
    FunctionExpression<Iterator> F(Iterator(*f)(const Iterator& begin,
                                                const Iterator& end,
                                                Result& result))
    {
        return FunctionExpression<Iterator>(f);
    }

    template<class Expr>
    OptionalExpression<Expr> operator *(const Expr& a,  OptionalT)
    {
        return OptionalExpression<Expr>(a);
    }

    template<class Expr>
    OneOrMoreExpression<Expr> operator *(const Expr& a,  OneOrMoreT)
    {
        return OneOrMoreExpression<Expr>(a);
    }

    template<class Expr>
    ZeroOrMoreExpression<Expr> operator *(const Expr& a,  ZeroOrMoreT)
    {
        return ZeroOrMoreExpression<Expr>(a);
    }

    template<class left, class right>
    AndExpression<left, right> operator & (const left& l, const right& r)
    {
        return AndExpression<left, right>(l, r);
    }

    template<class left, class right>
    OrExpression<left, right> operator | (const left& l, const right& r)
    {
        return OrExpression<left, right>(l, r);
    }
} //namespace PatternMatching


template<class  Exp>
inline void find_replace(std::string& in_this_string,
                         const Exp& e,
                         const std::string& replace)
{
    using namespace PatternMatching;

    std::string::iterator itbegin = in_this_string.begin();

    for (; itbegin != in_this_string.end();)
    {
        Result r;
        std::string::iterator it = PatternMatching::Match(itbegin, in_this_string.end(), e, r);
        if (r == ResultTrue || r == ResultTrueOptional)
        {
            size_t pos = itbegin - in_this_string.begin();
            in_this_string.replace(itbegin, it + 1, replace);

            itbegin = in_this_string.begin() + pos + replace.length();
        }
        else
        {
            itbegin++;
        }
    }
}


template<class Iterator, class  Exp>
inline Iterator Find(const Iterator& begin,
                     const Iterator& end,
                     const Exp& e)
{
    Iterator itbegin = begin;

    for (; itbegin != end; itbegin++)
    {
        PatternMatching::Result r;
        Iterator it = PatternMatching::Match(itbegin, end, e, r);
        if (r != PatternMatching::ResultFalse)
        {
            return it;
        }
    }
}

```
