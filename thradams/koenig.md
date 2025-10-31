#Using the Koenig lookup - Argument dependent name lookup (ADL)
1 August 2005

The Koenig lookup or Argument dependent name lookup (ADL), can be used in many situations.

I am going to show one example that I think in quite useful. 
Imagine one class where you want to declare the operator << to use with streams. If you are using templates, you should provide the operator << for each type that you instantiate. 
Using the ADL this is not necessary, because the declaration of the function can be done inline inside a class type.

```cpp
template<class T>
class X
{
    T m_value;

    friend std::ostream & operator << (std::ostream &os, const X & x)
    {
        os << x.m_value;
        return os;
    }

    friend void swap(X &a, X & b)
    {
        X temp(b);
        a = b;
        b = temp;
    }

public:
    X(const T& v) : m_value(v){}
};

int main()
{
    X<double> x(2.3);
    cout << x;

    X<double> y(1);
    swap(x, y);

    std::swap(x,y); // compare with this one.
}
```
