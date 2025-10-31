[Algorithms](algorithms.md)

###Multiplication

###Declaration
```cpp
template < unsigned long long base,
             class LeftIterator,
             class RightIterator,
             class OutIterator >
    void multiply(LeftIterator left_first,
                  LeftIterator left_last,
                  RightIterator right_first,
                  RightIterator right_last,
                  OutIterator out_first,
                  OutIterator out_last)

```

Multiplies two digit-sequence with represents the number in the same base.

###Sample
```cpp
Input:
      { 1 9 9}
              10
        { 1 2}
              10
{ 5 5 5 5 5 5}
              10
Output:
      { 1 9 9}
              10
        { 1 2}
              10
{ 0 0 2 3 8 8}
              10

```

----
###Sample

```cpp
void multiply_test()
{
    using namespace std;
    int u[] = { 3, 0, 1 , 0 };  // u = 103 base == 10
    int v[] = { 0, 2, 0, 0 };   // v =  20 base == 10
    int r[] = { 0, 0, 0, 0, 0, 0 };
    multiply<10>(begin(u), sig_digit_end(begin(u), end(u)),
                 begin(v), sig_digit_end(begin(v), end(v)),
                 begin(r), end(r));
    assert(r[5] == 0 && r[4] == 0 && r[3] == 2 && r[2] == 0 && r[1] == 6 && r[0] == 0);
}
```
----
###Implementation

```cpp

template < unsigned long long base,
         class LeftIterator,
         class RightIterator,
         class OutIterator >
void multiply(LeftIterator left_first,
              LeftIterator left_last,
              RightIterator right_first,
              RightIterator right_last,
              OutIterator out_first,
              OutIterator out_last)
{
    static_assert(base > 1, "base must be > 1");
    //base sanity check
    assert(check_digits<base>(left_first, left_last));
    assert(check_digits<base>(right_first, right_last));

    assert(out_last - out_first >= (left_last - left_first) + (right_last - right_first));
    assert(left_last - left_first == sig_digits(left_first, left_last));
    assert(right_last - right_first == sig_digits(right_first, right_last));

    const size_t left_digits = left_last - left_first;
    const size_t right_digits = right_last - right_first;

    for (size_t j = 0; j < right_digits; ++j)
    {
        if (right_first[j] == 0)
        {
            continue;
        }

        unsigned long long k = 0;

        for (size_t i = 0; i < left_digits; ++i)
        {
            unsigned long long ui = left_first[i];
            unsigned long long vj = right_first[j];
            unsigned long long rij = j > 0 ? out_first[i + j] : 0;
            unsigned long long current = ui * vj + rij + k;
            out_first[i + j] = current % base;
            k = current / base ;
        }

        out_first[j + left_digits] = k;
    }

    //fills leading zeroes
    out_first += right_digits -1 + left_digits;
    for (;out_first != out_last;++out_first)
    {
      *out_first = 0;
    }
}
```
----
###Multiply in place by a single digit

###Declaration
```cpp
template<unsigned long long base, class It>
    void multiply_in_place(It first,
                           It last,
                           unsigned long long value)

```

Multiples a digit-sequence by a single digit returning the result in a digit-sequence.

Extra leading zero must be reserved.
----
###Sample
```
Input:
    { 0 1 9 9}
              10
           {5}
              10

Output:
    { 0 9 9 5}
              10
           {5}
              10
```
----
```cpp

void multiply_test2()
{
    using namespace std;
    int n[] = { 3, 0, 1 , 0 };  //103
    multiply_in_place<10>(begin(n), end(n), 2); //103 * 2
    assert(n[3] == 0 && n[2] == 2 && n[1] == 0 && n[0] == 6);
    multiply_in_place<10>(begin(n), end(n), 3); //206 * 3
    assert(n[3] == 0 && n[2] == 6 && n[1] == 1 && n[0] == 8);
    multiply_in_place<10>(begin(n), end(n), 1); //618 * 1
    assert(n[3] == 0 && n[2] == 6 && n[1] == 1 && n[0] == 8);
    multiply_in_place<10>(begin(n), end(n), 2); //1236
    assert(n[3] == 1 && n[2] == 2 && n[1] == 3 && n[0] == 6);
    //assert
    //multiply<10>(begin(n), end(n), 2); //1236 * 2
    //assert(n[3] == 1 && n[2] == 2 && n[1] == 3 && n[0] == 6);
    int m[] = { 3, 0, 1 , 0 };  //103
    multiply_in_place<10>(begin(m), end(m), 0); //103 * 0
    assert(m[3] == 0 && m[2] == 0 && m[1] == 0 && m[0] == 0);
}

```
----
###Implementation
```cpp
    template<unsigned long long base, class It>
    void multiply_in_place(It first,
                           It last,
                           unsigned long long value)
    {
        static_assert(base > 1, "base must be > 1");
        //base sanity check
        assert(check_digits<base>(first, last));
        assert(value < base);
        --last;
        //extra non-significant digit zero must be reserved!
        assert(*last == 0);
        unsigned long long carry = 0;

        for (; first != last; ++first)
        {
            unsigned long long temp = *first;
            temp *= value;
            temp += carry;
            *first = temp % base;
            carry = temp / base;
        };

        *first = carry;
    };
```



----
####Multiplies by a single digit

###Declaration
```cpp
template<unsigned long base, class LeftIterator, class OutIterator>
    void multiply(LeftIterator left_first,
                  LeftIterator left_last,
                  unsigned long long value,
                  OutIterator out_first,
                  OutIterator out_last)

```
----
###Sample
```
Input:
    { 0 1 9 9}
              10

           {5}
              10

{ 1 1 1 1 1 1}
              10
Output:
    { 0 1 9 9}
              10
           {5}
              10
------------------
{ 0 0 0 9 9 5}
              10


```
----
###Implementation
```cpp
template<unsigned long base,
         class LeftIterator,
         class OutIterator>
void multiply(LeftIterator left_first,
              LeftIterator left_last,
              unsigned long long value,
              OutIterator out_first,
              OutIterator out_last)
{
    static_assert(base > 1, "base must be > 1");
    //base sanity check
    assert(check_digits<base>(left_first, left_last));
    assert(value < base);
    unsigned long long carry = 0;

    for (; left_first != left_last; ++left_first)
    {
        unsigned long long u = *left_first;
        unsigned long long temp = u * value + carry;
        *out_first++ = temp % base;
        carry = temp / base;
    };

    *out_first = carry;

    ++out_first;

    //fills leading zeroes
    while (out_first != out_last)
    {
        *out_first++ = 0;
    }
};

```


