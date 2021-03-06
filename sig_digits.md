
[Algorithms](algorithms.md)

###sig_digits
The algorithm **sig_digits** returns the number of significatives digits.

----

##Declaration
```cpp
template<class It>
size_t sig_digits(It first, It last);
```
----
###Sample
```
         {1}     -> 1
            base

         {0}     -> 1
            base

   {0, 0, 0}     -> 1
            base

{0, 0, 1, 2}     -> 2
            base

   {1, 1, 1}     -> 3
            base
```

----
###Sample

```cpp

void sig_digits_test()
{
    using namespace std;

    int a[] = { 0, 0, 0 };
    assert(sig_digits(begin(a), end(a)) == 1);

    int b[] = { 1, 0, 0 };
    assert(sig_digits(begin(b), end(b)) == 1);
    
    int c[] = { 0, 0, 1 };
    assert(sig_digits(begin(c), end(c)) == 3);

    int d[] = { 0 };
    assert(sig_digits(begin(d), end(d)) == 1);

    int e[] = { 1 };
    assert(sig_digits(begin(e), end(e)) == 1);        
}
```

----
###Implementation
```cpp
template<class It>
size_t sig_digits(It first, It last)
{
  --last;
  for (; first != last && *last == 0; )
    --last;
  last++;
  return (last - first);
}
```

