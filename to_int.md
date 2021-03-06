
[Algorithms](algorithms.md)

Returns true and a value inside a unsigned long long if the conversion is possible (usign this algorithm), otherwise returns false.

----
###Declaration
```cpp
template<unsigned long long base, class It>
bool to_int(It first, It last, unsigned long long& r);
```
----
###Sample
```
         {1}     -> 1
            10

         {0}     -> 0
            10

   {0, 0, 0}     -> 0
            10

{0, 0, 1, 2}     -> 12
            10

   {1, 1, 1}     -> 111
            10
```

----
###Sample
```cpp
void to_int_test()
{
  using namespace std;

  int a[] = {0, 1, 0, 0};
  unsigned long long res = 0;
  assert(to_int<10>(begin(a), end(a), res) == true);
  assert(res == 10);

  //18446744073709551615 + 1
  int b[] = {1 + 5, 1, 6, 1, 5, 5, 9, 0, 7, 3, 7, 0, 4, 4, 7, 6, 4, 4, 8 , 1};

  res = 0;
  assert(to_int<10>(begin(b), end(b), res) == false);
  assert(res == 0);

  
  int c[] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
  res = 0;
  assert(to_int<10>(begin(c), end(c), res) == true);
  assert(res == 0);
}
```


----
###Implementation

```cpp

bool UnsignedUnsignedSum(unsigned long long x, unsigned long long y)
{
    return y <= LLONG_MAX  - x;
}

bool UnsignedUnsignedMulti(unsigned long long x, unsigned long long y)
{
    if (x == 0 || x == 1)
    {
        return true;
    }

    return y <= LLONG_MAX / x;
}

template<unsigned long long base, class It>
bool to_int(It first, It last, unsigned long long& r)
{
    static_assert(base > 1, "base must be > 1");

    last = sig_digit_end(first, last);

    unsigned long long rb = 1;
    r = 0; //out

    for (; first != last; first++)
    {
        unsigned long long dig = *first;
        if (!UnsignedUnsignedMulti(rb, dig) || !UnsignedUnsignedSum(r, rb * dig))
        {
            r = 0;//overflow
            return false;
        }

        r = r + rb * dig;

        if (!UnsignedUnsignedMulti(rb, base))
        {
            r = 0;//overflow
            return false;
        }

        rb = rb * base;
    }

    return true;
}
```

