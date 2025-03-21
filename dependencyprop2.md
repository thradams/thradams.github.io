##Dependency properties (2)

The dependency property, in the way I am using in 
this text, is a property that depends on someone 
else to be evaluated.

I came across of this necessity of dependency properties because I am implementing a HTML render including the CSS (Cascading Style Sheets) that is very suitable for this kind of implementation.

For instance:
```
<p style="font-size: large;">
<span style="color:blue;">i'm blue and large font</span> 
i'm large</p>
```
Here, the span element is child of p. If you ask the span element for its FontSize, it will have to ask for its parents until someone returns a value, otherwise a default one will be returned.
The implementation is based on a static map for each property which associates object address to the property value.

This idea is an evolution of the first version of this implementation, and it was suggested by Cesar Mello who also has his own implementation.
Source code:

```cpp
// Copyright (C) 2009, Thiago Adams (thiago.adams@gmail.com)
// Acknoledgements. Cesar Mello
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.
//

template <class PropertyType, class ObjectType>
class Property
{
  typedef std::map<const ObjectType*, PropertyType> Map;
  Map m_values;

public:

  ~Property()
  {
    // objects must clear the property values before they are deleted
    assert(m_values.empty());
  }

  void SetValueOf(const ObjectType& object,
                  const PropertyType& value)
  {
    m_values.insert(Map::value_type(&object, value));
  }

  const PropertyType* FindValueOf(const ObjectType& object) const
  {
    Map::const_iterator it = m_values.find(&object);
    if (it != m_values.end())
      return &it->second;
    return 0;
  }
  
  bool HasValueFor(const ObjectType& object) const
  {
    return FindValueOf(object) != 0;
  }

  bool ClearValueOf(const ObjectType& object)
  {
    return m_values.erase(&object) != 0;
  }
};
```

###Sample of use

```cpp
Header:

class X
{
  X * m_Parent;
public:

  ~X();
  X * GetParent() { return m_Parent; }
  const X * GetParent() const { return m_Parent; }

  COLORREF GetColor() const;
  void SetColor(COLORREF);
}

Implementation:

namespace 
{
   Property<COLORREF, X> ColorProperty;
}

template<class PropertyType, class ClassType>
const PropertyType* InheritedFind(Property<PropertyType, ClassType >& p,
                                         const ClassType& object)
{
  const ClassType* pObject = &object;
  while (pObject != 0)
  {
    const PropertyType * pVal = p.FindValueOf(*pObject);
    if (pVal)
      return pVal;
    pObject = pObject->GetParent();
  }
  return 0;
}

template<class PropertyType, class ClassType>
const PropertyType& InheritedFind(Property<PropertyType, ClassType >& p,
                                         const ClassType& object,
                                         const PropertyType& def)
{
  const PropertyType * pVal = RecursiveFindValueOf(p, object);
  return pVal ? *pVal : def;
}

X::~X()
{
  ColorProperty.ClearValueOf(*this);
}

COLORREF X::GetColor() const
{
   return InheritedFind(ColorProperty, *this, RGB(0,0,0));
}

void X::SetColor(COLORREF)
{
    ColorProperty.SetValueOf(*this, c);
}
```

