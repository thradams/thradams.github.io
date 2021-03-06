
[Algorithms](algorithms.md)

----
###Declaration
```cpp
template<class It>
std::string to_string(It first, It last)
```



----
###Sample

```cpp

int main()
{
    using namespace std;
    int u[] = {9, 8, 4, 0};
    std::cout << std::setw(20) << to_string(begin(u), end(u)) << std::endl;
    std::cout << std::setw(20 + 2) << 10 << std::endl;
}

Output:
           {0 4 8 9}
                    10

```

----
###Implementation

```cpp
template<class It>
std::string to_string(It first, It last)
{
    std::string result;
    result += "{";

    size_t digits = last -  first ;
    for (int i = digits - 1; i >= 0; i--)
    {
        if (i != digits - 1)
        {
            result += " ";
        }

        result += std::to_string((unsigned long long)first[i]);
    }

    result += "}";
    return result;
}
```

