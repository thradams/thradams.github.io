
I was wondering why I have to express the interface \\
relationships on the object definition.

I don't have to express in the object type, \\
for instance, if it is allocated on the stack or on \\
the heap then it can be used in both.

The same idea could be applied in polymorphism.\\
I could have the class definition and choose if I\\
want it polymorphic or not. Even more, I want to choose how I will see the object,\\
and it doesn't need to know about that. 

One reason to do that is because the inheritance \\
just complicated design and makes changes hard. 

Static polymorphism and generic algorithms solve \\
this problem in some cases, but they don't solve the problem\\
when dynamic polymorphism is required.

Let's say I have a list with Cars and Dogs.\\
Both have the Color property. To apply an algorithm in this list,\\
which uses the Color property, I need to implement a common Interface\\
in Dogs and Cars. I have to artificially create this common interface\\
just to access the Color. If the base class of Dog is Animal and it\\
already has the Color property, this will not help, because Car is not derived\\
from Animal. The same if the Car is derived from Vehicle and Vehicle\\
has the Color property.

Now let's say I have this Common interface but in another program\\
I will reuse only the Car class. For this software, the Vehicle interface \\
is enough, because I have a polymorphic list of Vehicles. I don't need Animals.

This sample shows that the same object Car can be "viewed" differently\\
in two places. The Car object is exactly the same, it has the Color property.\\
"Beauty is in the eye of the beholder"

Trying to address this question I did some experiment with an "interface_cast"

Sample:

{{{cpp
struct Car {
  int Color() {return 1;}
};

struct Dog {
  int Color() {return 2;}
};
}}}

I need in some software / algorithm see the Color in a polymorphic way.
For this, I will use this "view" or interface.
{{{cpp
struct IColor { virtual int Color() = 0; };
}}}
The use of "interface_cast" is something like: (The final result)
{{{cpp
Car car;
Dog dog;

IColor& rCar = interface_cast<IColor>(car);
cout  << rCar.Color();
IColor& rDog = interface_cast<IColor>(dog);  
cout  << rDog.Color();
}}}

The interface_cast function returns an object derived from the interface (IColor) that makes the call conversion.
{{{cpp

template<class TObject, class TInterface> 
struct InterfaceAdapter; // Not Implemented

template<class TInterface, class TObject>
InterfaceAdapter<TObject, TInterface> interface_cast(TObject& r)
{
    return InterfaceAdapter<TObject, TInterface>(r);
}
}}}

The returned "InterfaceAdapter" object must be created manually.
In this case:
{{{cpp
template<class T>
struct InterfaceAdapter<T, IColor> : public IColor
{
    T& m_r;
    InterfaceAdapter(T& r) : m_r(r) {}

    virtual int Color()
    {
        return m_r.Color(); //call
    }
};
}}}

The color property could have a different syntax, for instance MyColor. In this case, a more specialized version of InterfaceAdapter must be created.
{{{cpp
template<>
struct InterfaceAdapter<Car, IColor> : public IColor
{
    Car& m_r;
    InterfaceAdapter(Car& r) : m_r(r) {}

    virtual int Color()
    {
        return m_r.MyColor(); //call
    }
};
}}}
To keep the object in a polymorphic way we could do something like:
{{{cpp
template<class TObject, class TInterface> 
struct InterfaceAdapterInstance : public InterfaceAdapter<TObject, TInterface>
{
  TObject m_obj;
  InterfaceAdapterInstance() : InterfaceAdapter<TObject, TInterface>(m_obj){}
};

template<class TObject, class TInterface>
InterfaceAdapterInstance<TObject, TInterface>* New()
{
    return new InterfaceAdapterInstance<TObject, TInterface>;   
}

std::vector<IColor*> v;   
v.push_back(New<Car, IColor>());
v.push_back(New<Dog, IColor>());
}}}

I think that there is some relationship with the idea of concepts, but in this case with polymorphic and dynamic behavior.
I would appreciate your comments about this. 

