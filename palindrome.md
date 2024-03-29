##Palindrome check

A palindrome is a word, phrase, number or other sequence of units that has the property of reading the same in either direction.
Example level, ABA
See more at: http://en.wikipedia.org/wiki/Palindrome

The C++ language is really good to implement this kind of algorithm
* really fast
* generic
* good abstration

And how about your language? :)
```cpp

using namespace std;

template<class Iterator>
bool PalindromeCheckAlgorithm(Iterator begin, Iterator end)
{
    while(begin < end)
    {
        if (*begin != *end)
            return false;
        ++begin;
        --end;
    }
    return true;
}

template<class Container>
bool PalindromeCheck(const Container &container)
{
    if (container.size() == 0)
        return false;

    return PalindromeCheckAlgorithm(container.begin(), container.end() - 1);
}

inline bool PalindromeCheck(const wchar_t * pszText)
{
    const size_t lenght = wcslen(pszText);

    if (lenght == 0)
        return false;

    return PalindromeCheckAlgorithm(pszText, pszText + lenght - 1);
}


void assert2(bool b)
{
    if (!b)
        cout << "error!";
}

int main()
{
    vector<int> numbers;
    lista.push_back(1);
    lista.push_back(2);
    lista.push_back(1);

    Stopwatch stopwatch(true);

    for (int i = 0; i < 10000000; i++)
    {
        assert2(PalindromeCheck(L"") == false);
        assert2(PalindromeCheck(L"1") == true);
        assert2(PalindromeCheck(L"A") == true);
        assert2(PalindromeCheck(L"ABC") == false);
        assert2(PalindromeCheck(L"ABC") == false);
        assert2(PalindromeCheck(L"level") == true);
        assert2(PalindromeCheck(L"level") == true);
        assert2(PalindromeCheck(L"ABBA") == true);
        assert2(PalindromeCheck(L"1221") == true);
        assert2(PalindromeCheck(numbers) == true);
    }

    stopwatch.Stop();

    cout << "elapsed time: " << stopwatch << endl;

    int i;
    cin >> i;
}

```

See also: [Stopwatch.htm](Stopwatch)


