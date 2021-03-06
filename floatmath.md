

64 bits double representation:

http://en.wikipedia.org/wiki/IEEE_754-1985


###What is the real number represented inside a double type?

The 64 bits double type uses 


* 1 bit (bit 63) for signal; 1 means negative, 0 positive;
* 11 bits for expoent (bit 52-62) (n - 1023)
* 52 bits for mantissa (bit 0-51)



The number normalized represented in base 2 is:

(1 + 0.xxx) * 2 ^ expoent

where 1 is inplicty and xxx are the mantissa digits in binary (base 2).

To convert the fractional binary number in decimal we sum the digits that are 1 plus the implity 1:

```
     1      1
1 + --- + ---- ....
    2^2    2^3
```

###Sample:

The number 0.15625.

```
 0                                                                 63
 |        mantissa                                    | exp         | signal
 0000000000000000000000000000000000000000000000000010 | 00111111110 | 0

double   = 0.15625
mantissa = 1125899906842624
exponent = -3
signal   = 0

```

The second digit of mantissa is 1 then we have to include it in the sum plus the inplicity 1.

```
         1       -3
 ( 1 +  --- ) * 2 
        2^2 

=>
        1      1
 ( 1 + ---) * --- 
        4      8
=>
  1      1  
  -- +  --- 
  8      32 
=>
  4  + 1  
  ------- 
     32

=>
      5  
  ------- = 1.15625 (exactly)
     32

```



###Some numbers
See [Limits on Floating-Point Constants](http://msdn.microsoft.com/en-us/library/6bs3y5ya.aspx)

----

Maximum representable floating-point number.

DBL_MAX == 1.7976931348623158e+308 
```

bits =
1111111111111111111111111111111111111111111111111111011111111110

binary number =
1.1111111111111111111111111111111111111111111111111111 * 2 ^ 1023

double   = 1.79769e+308
mantissa = 4503599627370495
exponent = 1023
signal   = 0
representation :
(2 ^ 1023 + 2 ^ 1022 + 2 ^ 1021 + 2 ^ 1020 + 2 ^ 1019 + 2 ^ 1018 + 2 ^ 1017 + 2
^ 1016 + 2 ^ 1015 + 2 ^ 1014 + 2 ^ 1013 + 2 ^ 1012 + 2 ^ 1011 + 2 ^ 1010 + 2 ^ 1
009 + 2 ^ 1008 + 2 ^ 1007 + 2 ^ 1006 + 2 ^ 1005 + 2 ^ 1004 + 2 ^ 1003 + 2 ^ 1002
 + 2 ^ 1001 + 2 ^ 1000 + 2 ^ 999 + 2 ^ 998 + 2 ^ 997 + 2 ^ 996 + 2 ^ 995 + 2 ^ 9
94 + 2 ^ 993 + 2 ^ 992 + 2 ^ 991 + 2 ^ 990 + 2 ^ 989 + 2 ^ 988 + 2 ^ 987 + 2 ^ 9
86 + 2 ^ 985 + 2 ^ 984 + 2 ^ 983 + 2 ^ 982 + 2 ^ 981 + 2 ^ 980 + 2 ^ 979 + 2 ^ 9
78 + 2 ^ 977 + 2 ^ 976 + 2 ^ 975 + 2 ^ 974 + 2 ^ 973 + 2 ^ 972 + 2 ^ 971)


Decimal:

179769313486231570814527423731704356798070567525844996598917476803157260 ...
780028538760589558632766878171540458953514382464234321326889464182768467 ...
546703537516986049910576551282076245490090389328944075868508455133942304 ...
583236903222948165808559332123348274797826204144723168738177180919299881 ...
250404026184124858368

```

----

Smallest positive number x, such that x + 1.0 is not equal to 1.0.

DBL_EPSILON = 2.2204460492503131e-016 

```
bits =
0000000000000000000000000000000000000000000000000000110100111100

binary number =
1.0000000000000000000000000000000000000000000000000000 * 2 ^ -52

double   = 2.22045e-016
mantissa = 0
exponent = -52
signal   = 0
representation :
(2 ^ -52)


       1
----------------
4503599627370496

```

----

Minimum positive value.

DBL_MIN == 2.2250738585072014e-308 

```
bits =
0000000000000000000000000000000000000000000000000000100000000000

binary number =
1.0000000000000000000000000000000000000000000000000000 * 2 ^ -1022

double   = 2.22507e-308
mantissa = 0
exponent = -1022
signal   = 0
representation :
(2 ^ -1022)


1/4494232837155789769323262976972561834044942447355766431835752028943316...
895137524078317711933060188400528002846996784833941469744220360415562321...
185765986853109444197335621637131907555490031152352986327073802125144220...
953767058561572036847827763520680929083762767114657455998681148461992907...
6208839082406056034304

```

----

NaN
```
bits =
0000000000000000000000000000000000000000000000000000111111111110

binary number =
1.0000000000000000000000000000000000000000000000000000 * 2 ^ 1024

double   = 1.#INF
mantissa = 0
exponent = 1024
signal   = 0
representation :
(2 ^ 1024)

This is reserved for NAN


```

----

Second biggest number:

```
bits =
0111111111111111111111111111111111111111111111111111011111111110

binary number =
1.1111111111111111111111111111111111111111111111111110 * 2 ^ 1023

double   = 1.79769e+308
mantissa = 4503599627370494
exponent = 1023
signal   = 0
representation :
(2 ^ 1023 + 2 ^ 1022 + 2 ^ 1021 + 2 ^ 1020 + 2 ^ 1019 + 2 ^ 1018 + 2 ^ 1017 + 2
^ 1016 + 2 ^ 1015 + 2 ^ 1014 + 2 ^ 1013 + 2 ^ 1012 + 2 ^ 1011 + 2 ^ 1010 + 2 ^ 1
009 + 2 ^ 1008 + 2 ^ 1007 + 2 ^ 1006 + 2 ^ 1005 + 2 ^ 1004 + 2 ^ 1003 + 2 ^ 1002
 + 2 ^ 1001 + 2 ^ 1000 + 2 ^ 999 + 2 ^ 998 + 2 ^ 997 + 2 ^ 996 + 2 ^ 995 + 2 ^ 9
94 + 2 ^ 993 + 2 ^ 992 + 2 ^ 991 + 2 ^ 990 + 2 ^ 989 + 2 ^ 988 + 2 ^ 987 + 2 ^ 9
86 + 2 ^ 985 + 2 ^ 984 + 2 ^ 983 + 2 ^ 982 + 2 ^ 981 + 2 ^ 980 + 2 ^ 979 + 2 ^ 9
78 + 2 ^ 977 + 2 ^ 976 + 2 ^ 975 + 2 ^ 974 + 2 ^ 973 + 2 ^ 972)


1797693134862315508561243283845062402343434371574593359244048724485818...
457545561143884706399431262203219608040271573715708098528849645117430...
440876627676009095943319277282370788761887605795325637686986540648252...
621157710157914639830148577040081234194593862451417237031480975291084...
23358883457665451722744025579520

```

Distance between first and second biggest numbers:
```
1995840309534719811656372713036838566067451260435457541502547242437211...
8918689640657849579654926357010893424468441924952439724379883935936607...
3917179828483142032000567295108567651753772144436298718265335674454392...
3993330810455120870388888855268448044157507120906875756041642358495230...
3440099278848
```
----

###Source code

Include

[memory](memory.md)

limits
```cpp
template<class T>
void PrintBitsLn(T v)
{
    std::cout << "bits = " << std::endl;

    for (int i = 0; i < sizeof(T) * CHAR_BIT ; i++)
    {
        std::cout << (memory::is_bit_on(v, i) ? '1' : '0');
    }

    std::cout << std::endl;
}


void PrintBinary(unsigned long long u)
{
    std::cout << "binary number = " << std::endl;
    long long exponent = memory::getbits(u, 52, 11) - 1023;
    unsigned long long signal = memory::getbits(u, 64 - 1, 1);
    if (signal == -1)
      std::cout << "-";

    std::cout << "1.";
    for (int i = 51; i >= 0; i--)
    {
        std::cout << (memory::is_bit_on(u, i) ? '1' : '0');
    }

    std::cout << " * 2 ^ " << exponent << std::endl;
    std::cout << std::endl;
}


void Frac(double d)
{
    //http://en.wikipedia.org/wiki/IEEE_754-1985

    static_assert(sizeof(d) * CHAR_BIT == 64, "expected double with 64 bits");
    unsigned long long u = *((unsigned long long*)(&d));

    unsigned long long mantissa = memory::getbits(u, 0, 52);
    long long exponent = memory::getbits(u, 52, 11) - 1023;
    unsigned long long signal = memory::getbits(u, 64 - 1, 1);
  
    PrintBitsLn(u);
    std::cout << std::endl;
    PrintBinary(u);

    std::cout << "double   = " << d << endl;
    std::cout << "mantissa = " << mantissa << endl;
    std::cout << "exponent = " << exponent << endl;
    std::cout << "signal   = " << signal << endl;

    if (exponent == -1023)
    {
        cout << "0" << endl;
        return;
    }

    if (signal == 1)
    {
        cout << " -1 * " ;
    }

    std::cout << "representation :" << std::endl;
    cout << "(2 ^ " << exponent << "";

    for (int i = 51; i >= 0 ; i--)
    {
        if (memory::is_bit_on(u, i))
        {
            cout << " + 2 ^ " << (exponent  - (52 - i));
        }
    }

    cout << ")" << endl;
}
```


