# New Type Of polimorphism

There is a concept / metric in software that is coupling.
It concerns the ability to isolate between two peaces of code. 
A less coupled code is easier to maintain and less complex because we can solve small problems separately.
Each part of the software will have at least a relationship with other parts, after all if it had no relation it would mean that it is unnecessary.
This relation in the case of functions is given by the function signature. In the case of classes can be by signing their methods by the use of their public data and by relation of inheritance.
Now imagine two pieces of code that are related to each other, but this relationship need not be maintained by the programmer but by the compiler. This opens up opportunities for solutions where we can build relationships and yet we can think and resolve each part separately.
These features are already present in OOP and C ++.

For example,
struct X
{
}

If we change class X and put a std :: String inside this has great influence on all classes that use X because they can go from a state of no need destructor to the state to need and call. Even so, we have been able to make this change in a practically isolated way and this interdence is managed by the compiler.
I propose that this concept be applied to the problem of polymorphism to have an alternative that is better than the traditional model of interfaces in several cases.

- problem interfaces
solution


