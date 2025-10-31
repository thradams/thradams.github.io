
[[algorithms.htm| Algorithms]]

Multiplies a sequence of digits by a single digit value returning the result in the input sequence.

**Extra digit zero must be reserved.**


** Assume same base**

{{{

  {0, 1, 0, 3 }      (u)
              10
*          {2}
              10
  ----------------
  
  {0, 2, 0, 6 }   (u)
               10
}}}

----

===Implementation===

{{{cpp
template<unsigned long long base, class It>
void product_in_place(It first,
                      It last,
                      unsigned long long value)
{
    assert(value < base);
    
    --last;

    //extra non-significant digit zero must be reserved!
    assert(*last == 0);
    
    unsigned long long carry = 0;

    for (; first != last; ++first)
    {
        unsigned long long temp = *first;
        temp *= value;
        temp += carry;

        *first = temp % base;
        carry = temp / base;
    };

    *first = carry;
};
}}}

===Sample===

{{{cpp
void product_in_place_test()
{
  using namespace std;
  
  int n[] = { 0, 0, 0 , 0 }; 
  set_digits<10>(103, begin(n), end(n));
  assert(n[2] == 1 && n[1] == 0 && n[0] == 3);
  

  product_in_place<10>(begin(n), end(n), 2);
  assert(n[2] == 2 && n[1] == 0 && n[0] == 6);

  product_in_place<10>(begin(n), end(n), 2);
  assert(n[2] == 4 && n[1] == 1 && n[0] == 2);
  
  product_in_place<10>(begin(n), end(n), 3);
  assert(n[3] == 1 && n[2] == 2 && n[1] == 3 && n[0] == 6);

  //ASSERT!
  //product_in_place<10>(begin(n), end(n), 9);
}
}}}
