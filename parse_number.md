
[Algorithms](algorithms.md)

----
###Declaration
```cpp
template<unsigned long long base, class It>
bool parse_number(const char* psz, It first, It last);
```
----
###Sample
```cpp
Input:

         "489"
         {0 0 0 0 0}    (must be zero, in/out)
                    10

Ouput:
         "489"
         {0 0 4 8 9}
                    10
         
Input:
    "489"
    {000 000 000 000 000}
                         256


Ouput:
    "489"
    {000 000 000 001 233}
                         256
```

----
###Sample
```cpp
using namespace std;
int a[] = { 0, 0, 0 };
parse_number<10>("98", begin(a), end(a));
assert(a[1] == 9 && a[0] == 8);
```
----
###Implementation
```cpp
template<unsigned long long base, class It>
bool parse_number(const char* psz, It first, It last)
{
    assert(is_zero(first, last));

    while ((*psz >= '0') && (*psz <= '9'))
    {
        if (*(last - 1)  != 0)
        {
            return false; //need more digits
        }

        multiply_in_place<base>(first, last, 10);
        int d  = *psz - '0';
        add<base>(first, sig_digit_end(first, last), &d, &d + 1, first, last);
        psz++;
    }

    return true;
}
```
