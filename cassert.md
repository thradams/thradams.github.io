##Assertions in compile time

See:
http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2004/n1720.html 

And:

http://www.boost.org/doc/libs/1_37_0/doc/html/boost_staticassert.html

For simple cases we can use today:

```cpp
#include <cassert>
namespace private_assertion_namespace
{
    template<bool assertion> struct assertion_class;
    template<> struct assertion_class<true>
    {
        static const bool value = true;
    };
}

#define static_assert(x)  assert(private_assertion_namespace::assertion_class<(x)>::value);

```

