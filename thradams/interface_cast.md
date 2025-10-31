##Interface cast


"Beauty is in the eye of the beholder"


What's the idea?

The ideia is to have an object not derived from interface (abstract class) behaving like it was.

For instance, lets say I have the object //Box// and the interface //IShape//:

```cpp
struct Box
{
    void Draw() {}
};

struct IShape
{
    virtual void Draw() = 0;
};

```

//Box// is not derived from //IShape//, however it has the methods necessary to implement the //IShape// interface.

I want to use the //Box// object like it was derived from //IShape//.

For this job I have created the **interface_cast**, that does the conversion.

```cpp
int main()
{
    Box box;
    IShape& r = interface_cast<IShape>(box);
    r.Draw();
}
```

How does it works?

The **interface_cast** function returns an object derived from the interface (TInterface) that makes the call conversion.

```cpp
template<class TObject, class TInterface> 
struct InterfaceAdapter; // Not Implemented

template<class TInterface, class TObject>
InterfaceAdapter<TObject, TInterface> interface_cast(TObject& r)
{
    return InterfaceAdapter<TObject, TInterface>(r);
}
```

The returned object is a template especialization of InterfaceAdapter.

For any object that has the same functions signatures and names of IShape is possible to use this adapter:

```cpp

template<class T>
struct InterfaceAdapter<T, IShape> : public IShape
{
    T& m_r;
    InterfaceAdapter(T& r) : m_r(r) {}

    virtual void Draw()
    {
        m_r.Draw(); //call
    }
};
```

This adapter is created manually for the interface we want to use with **interface_cast**.

----
###Diferent names
If the function name is diferent, it is necessary a more especialized implementation.

For instance, lets say that the //Box// class has function name called //draw2// instead of //Draw//.
```cpp
template<> struct InterfaceAdapter<Box, IShape> : public IShape
{
    typedef Box T;
    T& m_r;
    InterfaceAdapter(T& r) : m_r(r) {}
    
    virtual void Draw()
    {
        m_r.draw2();
    }
};
```

----
###Keeping the interfaces===

If you need to keep the interface pointer:

Usage:
```cpp
   IShape* p = New<Box, IShape>();
   p->Draw();
   delete p;
```

```cpp
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

```
**Obs:** In this case the "New" should have 0..N arguments to forward arguments to the object constructor.
###Sample
```cpp
////////////////////////////////////////////////////////////////////
// interface_cast

template<class TObject, class TInterface> 
struct InterfaceAdapter; // Not Implemented

template<class TInterface, class TObject>
InterfaceAdapter<TObject, TInterface> interface_cast(TObject& r)
{
    return InterfaceAdapter<TObject, TInterface>(r);
}

/////////////////////////////////////////////////////////////
//IShape interface
struct IShape
{
    virtual void Draw() = 0;
};

//Adaptor for the IShape
template<class T>
struct InterfaceAdapter<T, IShape> : public IShape
{
    T& m_r;
    InterfaceAdapter(T& r) : m_r(r) {}

    virtual void Draw()
    {
        m_r.Draw();
    }
};
/////////////////////////////////////////////////////////////

//Some class
struct Box
{
    void Draw() {}
};

int main()
{
    Box box;
    IShape& r = interface_cast<IShape>(box);
    r.Draw();
}

```

### History
* 3/10/2010 Updated
* 18/11/2010 InterfaceAdapterInstance Added
* 22/11/2010 [[ http://www.thradams.com/codeblog/icast3.htm|new approach]]


