[Algorithms](algorithms.md)

###mod

Returns the remainder of integer division.

**Assume same base**

----
###Declaration
```cpp
 template < unsigned long long base,
             class LeftIterator >
    unsigned long long mod(LeftIterator left_first,
                           LeftIterator left_last,
                           unsigned long long value)
```
----
###Implementation

```cpp
 template < unsigned long long base,
             class LeftIterator >
    unsigned long long mod(LeftIterator left_first,
                           LeftIterator left_last,
                           unsigned long long value)
    {
        assert(value < base);
        unsigned long long carry = 0;
        --left_last;

        for (;;)
        {
            carry = (carry * base + *left_last) % value;

            if (left_last == left_first)
            {
                break;
            }

            --left_last;
        }

        assert(carry < base);
        return carry;
    }
```
----
###Declaration
```cpp
template < unsigned long long base,
             class LeftIterator,
             class RightIterator,
             class OutIterator >
    void mod(LeftIterator left_first,
             LeftIterator left_last,
             RightIterator right_first,
             RightIterator right_last,
             OutIterator out_first,
             OutIterator out_last)
```
----

###Implementation

```cpp
template < unsigned long long base,
             class LeftIterator,
             class RightIterator,
             class OutIterator >
    void mod(LeftIterator left_first,
             LeftIterator left_last,
             RightIterator right_first,
             RightIterator right_last,
             OutIterator out_first,
             OutIterator out_last)
    {
        if (sig_digits(right_first, right_last) == 1)
        {
            *out_first = mod<base>(left_first, left_last, *right_first);
        }
        else
        {
            longmod<base>(left_first, left_last, right_first, right_last, out_first, out_last);
        }
    }

```

###longmod

----
###Declaration
```cpp
 template < unsigned long long base,
             class LeftIterator,
             class RightIterator,
             class OutIterator >
    void longmod(LeftIterator left_first,
                 LeftIterator left_last,
                 RightIterator right_first,
                 RightIterator right_last,
                 OutIterator out_first,
                 OutIterator out_last)
```

----
###Implementation
```cpp
 template < unsigned long long base,
             class LeftIterator,
             class RightIterator,
             class OutIterator >
    void longmod(LeftIterator left_first,
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

        const size_t n = sig_digits(left_first, left_last);
        const size_t m = sig_digits(right_first , right_last);
        typedef unsigned long  long ulong;

        RightIterator sigvlast = sig_digit_end(right_first, right_last);
        ulong ym_1 = *(sigvlast - 1);
        ulong f = base / (ym_1 + 1);
        multiply_in_place<base>(left_first, left_last, f);
        multiply_in_place<base>(right_first, right_last, f);

        for (int k = n - m; k >= 0; k--)
        {
            ulong qt = trialdigit2<base>(left_first, right_first, (size_t)k, (size_t)m);
            std::vector<unsigned int> dq((right_last - right_first) + 1);
            multiply<base>(right_first, right_last, qt, dq.begin(), dq.end());

            if (compare(left_first + k, left_first + k + m,
                        dq.begin(), dq.begin() + m) == -1)
            {
                qt = qt - 1;
                multiply<base>(left_first, left_last, qt, dq.begin(), dq.end());
            }

            subtract_in_place<base>(left_first + k, left_first + k + m, dq.begin(),  dq.begin() + m);

            //cleaning non used digits
            for (int i = k + m; i < n; i++)
            {
                left_first[i] = 0;
            }

            println2(left_first , left_last);
        }

        assert(is_zero(out_first, out_last));
        divide<base>(left_first , left_last, out_first, out_last, f);
    };

```
###Sample:


```cpp

void mod_test()
{
    using namespace std;
    int u[] = {1, 2, 3, 0};
    assert(mod<10>(begin(u), end(u), 1) == 0);
    assert(mod<10>(begin(u), end(u), 2) == 1);
    assert(mod<10>(begin(u), end(u), 3) == 0);
    assert(mod<10>(begin(u), end(u), 4) == 1);
    assert(mod<10>(begin(u), end(u), 5) == 1);
    assert(mod<10>(begin(u), end(u), 6) == 3);
    assert(mod<10>(begin(u), end(u), 7) == 6);
    assert(mod<10>(begin(u), end(u), 8) == 1);
    assert(mod<10>(begin(u), end(u), 9) == 6);
}

void longmod_test()
{
    using namespace std;
    {
        int u[] = {1, 2, 3, 0};
        int v[] = {1, 2, 0};
        int r[] = {0, 0, 0, 0};
        mod<10>(begin(u), end(u),
                    begin(v), end(v),
                    begin(r), end(r));
        assert(r[0] == 6);        
        assert(r[1] == 0);
    }
    {
        int u[] = {9, 9, 9, 0};
        int v[] = {5, 5, 0};
        int r[] = {0, 0, 0, 0};
        mod<10>(begin(u), end(u),
                    begin(v), end(v),
                    begin(r), end(r));
        assert(r[0] == 9);        
        assert(r[1] == 0);
    }
}


```
