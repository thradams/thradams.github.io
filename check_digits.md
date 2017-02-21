
[Algorithms](algorithms.md)

##check_digits
Returns true if all digits are compatible with de base.

0 <= digit <= base - 1

### Implementation

```cpp
template<unsigned long long base, class It>
bool check_digits(It first, It last)
{
    static_assert(base > 1, "base must be > 1");
    for (; first != last; first++)
    {
        if (*first < 0 || *first >= base)
          return false;
    }
    return true;
}

```

(Used in debug)
### Sample

```cpp

void check_digits_test()
{
  using namespace std;
  int a[] = {0, 1, 0, 0};  
  assert(check_digits<10>(begin(a), end(a)) == true);
  assert(check_digits<256>(begin(a), end(a)) == true);
  
  int b[] = {0, 1, 0, 255};  
  assert(check_digits<10>(begin(b), end(b)) == false);
  assert(check_digits<256>(begin(b), end(b)) == true);
}

```
