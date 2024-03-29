[Algorithms](algorithms.md)

###Subtraction 
----

###Declaration
```cpp
template < unsigned long long base,
             class LeftIterator,
             class RightIterator,
             class OutIterator >
    void subtract(LeftIterator left_first,
                  LeftIterator left_last,
                  RightIterator right_first,
                  RightIterator right_last,
                  OutIterator out_first,
                  OutIterator out_last)

```


Subtract two positive integers assuming same base.
----
###Sample
```
Input:
      { 1 9 9}
              10
-       { 1 2}
              10
{ 5 5 5 5 5 5}
              10
Output:
      { 1 9 9}
              10
        { 1 2}
              10
{ 0 0 0 1 8 7}
              10


```

----
###Sample

```cpp
void subtract_test()
{
    using namespace std;
    int u[] = { 9, 9, 0 };
    int v[] = { 0, 0 };
    int r[] = { 0, 0, 0, 0 };
    subtract<10>(begin(u), end(u),
                 begin(v), end(v),
                 begin(r), end(r));
    assert(r[3] == 0 && r[2] == 0 && r[1] == 9 && r[0] == 9);
    v[1] = 0;
    v[0] = 1;
    subtract<10>(begin(u), end(u),
                 begin(v), end(v),
                 begin(r), end(r));
    assert(r[3] == 0 && r[2] == 0 && r[1] == 9 && r[0] == 8);
}
```
----
###Implementation
```cpp
template < unsigned long long base,
         class LeftIterator,
         class RightIterator,
         class OutIterator >
void subtract(LeftIterator left_first,
              LeftIterator left_last,
              RightIterator right_first,
              RightIterator right_last,
              OutIterator out_first,
              OutIterator out_last)
{
    static_assert(base > 1 , "base must be > 1");
    //base sanity check
    assert(check_digits<base>(left_first, left_last));
    assert(check_digits<base>(right_first, right_last));

    assert(left_last - left_first >= right_last - right_first);
    assert(out_last - out_first >= left_last - left_first);

    //u >= v ?
    assert(compare(left_first, left_last, right_first, right_last) != -1);

    long long borrow = 0;

    while (left_first != left_last || right_first != right_last)
    {
        long long  ri_k = left_first != left_last ? *left_first++ : 0;
        long long  dqi = right_first != right_last ? *right_first++ : 0;
        long long  diff = ri_k - dqi;
        diff = diff - borrow + base;
        *out_first = diff % base;
        borrow = 1 - diff / base;
        ++out_first;
    }

    assert(borrow == 0);

    //fills remaning
    for (; out_first != out_last; ++out_first)
    {
        *out_first = 0;
    }
}

```



----
###Declaration
```cpp
 template < unsigned long long base,
             class LeftIterator,
             class RightIterator >
    void subtract_in_place(LeftIterator left_first,
                           LeftIterator left_last,
                           RightIterator right_first,
                           RightIterator right_last)

```
----
###Sample
```
Input:
    { 5 4 3 1}
              10
      { 5 4 3}
              10
Ouput:
    { 4 8 8 8}
              10
      { 5 4 3}
              10
```
----
###Sample:
```cpp

void subtract_in_place_test()
{
    using namespace std;
    int i [] =    {1, 3, 4, 5};
    int j [] =    {1, 2, 4, 5};
    int r [] =  {0, 1, 0, 0};
    subtract_in_place<10>(begin(i), end(i), begin(j), end(j));
    assert(compare(begin(i), end(i), begin(r), end(r)) == 0);
}
```

----
###Implementation
```cpp
template < unsigned long long base,
         class LeftIterator,
         class RightIterator >
void subtract_in_place(LeftIterator left_first,
              LeftIterator left_last,
              RightIterator right_first,
              RightIterator right_last)
{
    static_assert(base > 1 , "base must be > 1");
    //base sanity check
    assert(check_digits<base>(left_first, left_last));
    assert(check_digits<base>(right_first, right_last));

    assert(left_last - left_first >= right_last - right_first);

    //left >= right ?
    assert(compare(left_first, left_last, right_first, right_last) != -1);

    long long borrow = 0;

    while (left_first != left_last)
    {
        long long  ri_k = *left_first;
        long long  dqi = right_first != right_last ? *right_first++ : 0;
        long long  diff = ri_k - dqi;
        diff = diff - borrow + base;
        *left_first = diff % base;
        borrow = 1 - diff / base;
        *left_first++;
    }

    assert(borrow == 0);    
}

```
