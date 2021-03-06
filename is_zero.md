
[Algorithms](algorithms.md)

###is_zero

Returns true if all digits are zero. Otherwise return false

----

###Declaration
```cpp
template <class It>
bool is_zero(It first, It last);
```

----
###Sample
```
         {1}     -> false
            base

         {0}     -> true
            base

   {0, 0, 0}     -> true
            base

{0, 0, 1, 2}     -> false
            base

   {1, 1, 1}     -> false
            base
```
----

###Sample
```cpp
void is_zero_test()
{
    using namespace std;

    int a[] = { 0, 0, 0 };
    assert(is_zero(begin(a), end(a)) == true);

    int b[] = { 1, 0, 0 };
    assert(is_zero(begin(b), end(b)) == false);
    
    int c[] = { 0, 0, 1 };
    assert(is_zero(begin(c), end(c)) == false);

    int d[] = { 0 };
    assert(is_zero(begin(d), end(d)) == true);

    int e[] = { 1 };
    assert(is_zero(begin(e), end(e)) == false);        
}
```
----
###Implementation
```cpp
template <class It>
bool is_zero(It first, It last)
{	
  for (; first != last; ++first)
    if (*first != 0)
      return false;
  return true;
}
```
