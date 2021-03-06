
[Algorithms](algorithms.md)

### add_positive_integers

Sums u and v, returning the result in r.


```

e.g.
         {1, 0}          (u)
               base

+           {1}          (v)
               base
     -------------
       {0, 1, 1}           (r)
                base


```


**Assume same base**

----

### Implementation

```cpp


template <unsigned long long base, 
         class UIt,
         class VIt,
         class RIt>
void add_positive_integers(UIt ufirst,
                           UIt ulast,
                           VIt vfirst,
                           VIt vlast,
                           RIt rfirst,
                           RIt rlast)
{
    
    assert(rlast - rfirst >= (vlast - vfirst) + 1);
    assert(rlast - rfirst >= (ulast - ufirst) + 1);
    assert(ulast - ufirst == sig_digits(ufirst, ulast));
    assert(vlast - vfirst == sig_digits(vfirst, vlast));
    
    unsigned long long k = 0;

    for (; rfirst < rlast; ++rfirst)
    {
        unsigned long long uj = ufirst != ulast ? *ufirst++ : 0;
        unsigned long long vj = vfirst != vlast ? *vfirst++ : 0;
        assert(uj < base);
        assert(vj < base);
        unsigned long long current = uj + vj + k;
        *rfirst = current % base;
        k = current / base;
    }

    assert(k == 0 || k == 1);

    if (k > 0)
    {
        *rfirst = k;
    }
}

```

###Sample:

```cpp

void add_positive_integers_test()
{
  using namespace std;
  
  int a[] = { 0, 0, }; 
  set_digits<10>(99, begin(a), end(a));
  assert(a[1] == 9 && a[0] == 9);

  int b[] = { 0, 0, }; 
  set_digits<10>(1, begin(b), end(b));
  assert(b[1] == 0 && b[0] == 1);
  
  int res[] = {0,0,0};
  add_positive_integers<10>(begin(a), sig_digit_end(begin(a), end(a)),
                            begin(b), sig_digit_end(begin(b), end(b)),
                            begin(res), end(res));

}

```
