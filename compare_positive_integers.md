[Algorithms](algorithms.md)

Compares two numbers, assuming they have the same base.


Returns:

* 0  : if u == v
* 1  : if u > v
* -1 : if u < v

----
###Declaration
```cpp
template < class LeftIterator, class RightIterator >
    int compare(LeftIterator left_first,
                LeftIterator left_last,
                RightIterator right_first,
                RightIterator right_last);
```
----
###Sample
```
  { 1, 0 } , { 1 }   -> 0
         10      10
```

----
###Sample

```cpp
void compare_test()
{
    using namespace std;
    int a[] = {0, 1, 0}; //a = 010
    int b[] = {0, 1, 0}; //b = 010
    int c[] = {1, 0, 0}; //c = 001
    int d[] = {0}; //d = 0
    int e[] = {0}; //e = 0

    assert(compare(begin(a), end(a), begin(b), end(b)) == 0);
    assert(compare(begin(a), end(a), begin(c), end(c)) == 1);
    assert(compare(begin(c), end(c), begin(a), end(a)) == -1);
    assert(compare(begin(d), end(d), begin(e), end(e)) == 0);
    
    assert(compare(begin(c), end(c), begin(d), end(d)) == 1);
    assert(compare(begin(d), end(d), begin(c), end(c)) == -1);
}
```
----
###Implementation
```cpp

    template < class LeftIterator, class RightIterator >
    int compare(LeftIterator left_first,
                LeftIterator left_last,
                RightIterator right_first,
                RightIterator right_last)
    {
        const size_t left_digits = left_last - left_first;
        const size_t right_digits = right_last - right_first;
        size_t i = std::max(left_digits, right_digits);

        for (;;)
        {
            auto left_comp = (i < left_digits) ? left_first[i] : 0;
            auto right_comp = (i < right_digits) ? right_first[i] : 0;

            if (left_comp < right_comp)
            {
                return -1;
            }
            else if (left_comp > right_comp)
            {
                return  1;
            }

            if (i == 0)
            {
                break;
            }

            i--;
        }

        return 0;
    }
```


