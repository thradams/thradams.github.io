##VC++ Warning tips

###How to disable warnings?
```cpp

#pragma warning( push )
#pragma warning( disable : 4705 )
#pragma warning( disable : 4706 )
#pragma warning( disable : 4707 )
// Some code
#pragma warning( pop ) 
```

Useful warnings that are off by default can be enabled

My favorites are:
```cpp
//class' : class has virtual functions, but destructor is not virtual
// C4265.cpp
// compile with: /W3 /c
#pragma warning(default : 4265)
class B
{
public:
   virtual void vmf();

   ~B();
   // try the following line instead
   // virtual ~B();
};   // C4265

int main()
{
   B b;
}
```

Sample 2:

```cpp
//enumerator 'identifier' in switch of enum 'enumeration' is not explicitly handled by a case label
// C4061.cpp
// compile with: /W4
#pragma warning(default : 4061)

enum E { a, b, c };
void func ( E e )
{
   switch(e)
   {
      case a:
      case b:
      default:
         break;
   }   // C4061 c' not handled
}

int main()
{
}
```

See the complete list at: ["http://msdn.microsoft.com/en-us/library/23k5d385.aspx](Compiler Warnings That Are Off by Default)
