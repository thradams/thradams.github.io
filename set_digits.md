
[Algorithms](algorithms.md)

###set_digits
Fills digits to represent a value using base.

----
###Declaration
```cpp
template<unsigned long long base, class It>
int set_digits(unsigned long long value,
               It first,
               It last);
```
----
###Sample
```
       1 -> {0, 0, 1} 
                    base = 10

       10 -> {0, 1, 0} 
                      base = 10

       100 -> {0, 0, 100} 
                         base = 256
```

----
###Sample
```cpp
void set_digits_test()
{
    using namespace std;
    int n[] = { 0, 0, 0 , 0 }; 
    assert(set_digits<10>(103, begin(n), end(n)) == 3);
    assert(n[3] == 0 && n[2] == 1 && n[1] == 0 && n[0] == 3);

    std::fill(begin(n), end(n), 0);
    assert(set_digits<256>(103, begin(n), end(n)) == 1);
    assert(n[3] == 0 && n[2] == 0 && n[1] == 0 && n[0] == 103);
}
```

----
###Implementation
```cpp
template<unsigned long long base, class It>
int set_digits(unsigned long long value,
               It first,
               It last)
{
    static_assert(base > 1, "base must be > 1");
    int d = 0;
    for (; first != last; ++first)
    {
        ++d;
        *first = value % base;
        value = value / base;

        if (value == 0)
        {
            return d;   //ok
        }
    };

    assert(false);

    return 0; //more digits are necessary
}
```

