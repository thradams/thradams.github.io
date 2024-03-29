
[Algorithms](algorithms.md)

Returns the "end" iterator considering only significative digits.


e.g.
```
         {1} 
       ^    base

         {0}
        ^   base

   {0, 0, 0} 
       ^   base

{0, 0, 1, 2} 
    ^       base

   {1, 1, 1} 
^           base
```

----

###Implementation

```cpp
template<class It>
It sig_digit_end(It first, It last)
{
  --last;
  for (; first != last && *last == 0; )
    --last;
  last++;
  return last;
}
```

###Sample

```cpp

void sig_digit_end_test()
{
    using namespace std;

    int a[] = { 0, 0, 0 };
    assert(sig_digit_end(begin(a), end(a)) == begin(a) + 1);

    int b[] = { 1, 0, 0 };
    assert(sig_digit_end(begin(b), end(b)) == begin(b) + 1);
    
    int c[] = { 0, 0, 1 };
    assert(sig_digit_end(begin(c), end(c)) == end(c));

    int d[] = { 0 };
    assert(sig_digit_end(begin(d), end(d)) == end(d));

    int e[] = { 1 };
    assert(sig_digit_end(begin(e), end(e)) ==end(e));        
}


```
