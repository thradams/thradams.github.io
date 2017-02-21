

Property-like syntax.


(The sample is not complete yet.)


{{{cpp
struct X
{
    int m_prop;

    void set_prop(int value)
    {
        m_prop = value;
    }

    int get_prop() const
    {
        return m_prop;
    }

    struct TProp
    {
        X& r()
        {
            return *reinterpret_cast<X*>(this - offsetof(X, prop));
        }

        const X& r() const
        {
            return *reinterpret_cast<const X*>(this - offsetof(X, prop));
        }

        template<class T> operator T()
        {
            return r().get_prop();
        }

        template<class T> void operator=(const T& value)
        {
            r().set_prop(value);
        }

        //Comparison operators/relational operators

        template<class T> bool operator==(const T& value) const
        {
            return r().get_prop() == value;
        }

        template<class T> bool operator!=(const T& value) const
        {
            return r().get_prop() != value;
        }

        template<class T> bool operator >(const T& value) const
        {
            return r().get_prop() > value;
        }

        template<class T> bool operator <(const T& value) const
        {
            return r().get_prop() < value;
        }

        template<class T> bool operator >=(const T& value) const
        {
            return r().get_prop() >= value;
        }

        template<class T> bool operator <=(const T& value) const
        {
            return r().get_prop() <= value;
        }

        //Logical operators

        template<class T>
        bool operator !() const
        {
            return !r().get_prop();
        }

        template<class T>
        bool operator &&(const T& value) const
        {
            return r().get_prop() && value;
        }

        template<class T>
        bool operator ||(const T& value) const
        {
            return r().get_prop() || value;
        }

        /*template <class T>
        friend auto operator +(const TProp& a, const T& value) -> decltype( a.ptr()->get_prop() + value)
        {
          return a.ptr()->get_prop() + value;
        }*/

    } prop;
};


void f(int) {}
void f1(const int) {}
void f2(int&) {}
void f3(double) {}

int main()
{
    int i = 0;
    X x;
    x.prop = 1;
    f(x.prop);
    f1(x.prop);
    f3(x.prop);
    //f2(x.prop);
    assert(x.prop == 1);
    assert(x.prop != 2);
    assert(x.prop < 2);
    assert(x.prop > 0);
    assert(x.prop >= 1);
    assert(x.prop <= 1);
}

}}}


