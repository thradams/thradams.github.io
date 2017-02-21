##Disabling constructors that you are not using


If you are not implementing the default constructor, copy constructor or the assignment operator, it is a good idea to declare them but do not implement then. Doing this, you prevent that they are called automatically leaving uninitialized variables.

```cpp
class X {

  X(); // not use
  X(const X &); // not use

  Object * m_p;

public:

  X(Object * p) : m_p(p) {}
};
```
