This is a kind of concept check.

We have a type predicate for the type T that says
if the type T is a concept X.

It will be, if the type T is derived from X, or if 
we explicitly say that.

```cpp

#include <type_traits>
#include <iostream>


struct shape_concept {};
struct circle_concept : public shape_concept {};
struct square_concept : public shape_concept {};



//By default check if Concept is base of T
template<class T, class Concept>
struct is_concept_model : public std::is_base_of<Concept, T> {};


//Formula for circle_concept
template<class T>
typename std::enable_if<is_concept_model<T, circle_concept>::value, double>::type
Area(const T& o)
{
    const double pi = 3.14;
    return pi * o.radius() * o.radius();
}

//Formula for square_concept
template<class T>
typename std::enable_if<is_concept_model<T, square_concept>::value, double>::type
Area(const T& o)
{
    return o.side() * o.side();
}

//Error if T is not a shape_concept model
template<class T>
typename std::enable_if<!is_concept_model<T, shape_concept>::value, double>::type
Area(const T& o)
{
    static_assert(false, "type T must map shape_concept");
    return 0;
}

struct MyCircle1 : public circle_concept
{
    double radius() const
    {
        return 1.5;
    }
};

struct MyCircle2
{
    double radius() const
    {
        return 2.0;
    }
};

//We explicitly will say that MyCircle2 is a model of circle_concept 
//and that MyCircle2 is a model of shape_concept should be automatic!
template<> struct is_concept_model<MyCircle2, circle_concept> : public std::true_type {};
template<> struct is_concept_model<MyCircle2, shape_concept> : public std::true_type{};

struct MySquare1 : public square_concept
{
    double side() const
    {
        return 2.0;
    }
};

struct MySquare2
{    
};

int main()
{
    MySquare1 s1;
    MySquare2 s2;
    MyCircle1 c1;
    MyCircle2 c2;
    std::cout << Area(s1) << std::endl;
    std::cout << Area(c1) << std::endl;
    std::cout << Area(c2) << std::endl;
    // std::cout << Area(s2) << std::endl;
}



```

