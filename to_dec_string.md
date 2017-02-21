
[Algorithms](algorithms.md)

----
###Declaration
```cpp
template<unsigned long long base, class It>
std::string to_dec_string(It first, It last);
```



----
###Sample

```cpp

int main()
{
    using namespace std;
    int u[] = {9, 8, 4, 0};
    std::cout << to_dec_string<10>(begin(u), end(u));
}

Output:
 489

```

----
###Implementation

```cpp
template<unsigned long long base, class It>
std::string to_dec_string(It first, It last)
{
    std::string result;

    while (!is_zero(first, last))
    {
        result += char(mod<base>(first, last, 10) + '0');
        divide_in_place<base>(first, last, 10);
    }

    std::reverse(result.begin(), result.end());
    return result;
}
```


