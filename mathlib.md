

## Math library

### Introduction

What does this library?

At start, the library will focus in the oldest and most elementary branch of mathematics - arithmetic.

Basic operations are implemented to operate on integers and natural numbers.

Integers: 
```
Z = {.. , -2, -1, 0, 1, 2, ...}
```
Natural numbers
```
N = {0, 1, 2, ...}
```
### How the library sees the numbers?

The library uses the [positional notation](http://en.wikipedia.org/wiki/Positional_notation)
```
{ d[n], ... d[1], d[0] }       (d[0] is less significative)
                        base
```

base is the number of unique digits including zero.

e.g. The number 15 in decimal notation (base 10) is represented as:
```
                    1         0
{ 1, 5 }    = 1 * 10  + 5 * 10      
        10
```

### What is the number interface?
Algorithms have access to the number representation using iterators.

```
  { !?!?  , d[n], ... d[1], d[0]  } 
     ^                       ^
    end                     begin        (iterators, pointers)

```

Basic math lib algorithms will use this abstraction. 

[Algorithms](algorithms.md)

### References

* [http://en.cppreference.com/w/cpp/iterator](http://en.cppreference.com/w/cpp/iterator)
* [http://en.wikipedia.org/wiki/Integer](http://en.wikipedia.org/wiki/Integer)
* [http://en.wikipedia.org/wiki/Positional_notation](http://en.wikipedia.org/wiki/Positional_notation)
* [http://en.wikipedia.org/wiki/Arithmetic](http://en.wikipedia.org/wiki/Arithmetic)
* [http://en.wikipedia.org/wiki/Natural_numbers](http://en.wikipedia.org/wiki/Natural_numbers)
