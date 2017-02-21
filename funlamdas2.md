##Fun with lambdas - for_each_where

```cpp

template<class IT, class F, class W>
F for_each_where(IT i, IT e, W w, F f)
{
    for (; i != e; ++i)
    {
        if (w(*i))
        {
            f(*i);
        }
    }
    return (f);
}

int main()
{
    std::vector<Point> v;
    v.push_back(Point(1, 1));
    v.push_back(Point(2, 1));
    v.push_back(Point(3, 1));


    for_each_where(v.begin(), v.end(),
                   [](Point& p) { return p.x > 1; }, // condition
                   [](Point& p) { cout << p.x; });   // code
}
```
