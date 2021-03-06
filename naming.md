##My naming conventions

###General conventions

* Do favour readability over brevity.
* Don't use underscores, hyphens, or any non alphanumeric char.

###Capitalization conventions

* Use PascalCasing for namespace, types, and member names 
* Use camelCasing for parameter names, local variables
* SCREAMING_CAPS for macros (if you can not avoid them)

###Names of classes, structs and interfaces

* Use PascalCasing.
* Do not use prefixes like "C" or "T" for class types
* Use the "I" prefix for interfaces
* Consider end the names of derived class with the name of base class
* For exception classes use the suffix "Exception"
* Try not to use the name or suffix "Manager"
* Don't use the name or suffix "Singleton"
E.g.
```cpp
// interfaces
struct ISerialize {};

//derived classes
class Dialog {};
class FontDialog : public Dialog{};

// exception classes
class SocketException : public std::exception {};

```

###Data Members

*Use the prefix "m_" for data members and "s_" for static data members.

###Naming Enumerations

* Use the enumeration name as a prefix of the enumerations items
```cpp
enum FontStyle
{
   FontStyleNormal,
   FontStyleBold,
   FontStyleItalic
};
```
Use "EnumNameNone" when appropriated for the 0 value
Namespaces

* Use PascalCasing.
* Avoid names like "Utils", "Utilities", "Management", "Common", "Misc", "Tools" (This rule is valid for libs and classes as well)
* Use anonymous namespaces inside cpp files
* Use "Detail" namespace in header files to create sub-namespaces that are useful only for the implementation

###Functions

* Use PascalCasing.
* The name for functions should be a verb like:
```cpp
Remove();
Create();
```

###Member functions

*Use the prefix "Get" for data member inquiries - Use "Set" to modify values.
```
CString Class::GetName() const;
void Class::SetName(const CString &);
```
* For Boolean inquires use: "Is", "Can", "Has"
E.g.
```cpp
bool Class::CanSearch() const;
bool Class::IsActive() const;
bool Class::HasChild() const;
```
Use only affirmative phrases. Don't use IsNotActive, or CannotSearch

###Function arguments

* Use camelCasing. 
* Describe the argument meaning

In header files is not always necessary to have an argument name
For instance, I prefer to declare copy constructors without naming the argument
E.g.
```cpp
class X
{
    X(const X&);
    X & operator = (const X&);
    void DrawLine(const Pen &); // is possible to understand, isn't it?
};
```

* Consider the suffix "Name", "Text" for string types or anything that reminds text
```cpp
Open(const string &fileName);
Alert(const string &alertText);
Alert(const string &alertMessage);
```
Some people like to use the prefix "str" for strings. I don't like because choosing the correct name the prefix "str" is redundant.
```cpp
Open(const string &strFileName);
//is not better than
Open(const string &fileName);
```
The "Name" suffix for me means text; Otherwise I will specify different like:
Open(int fileId);
* Consider the suffix "Count", "Index" for integer types.
* Consider the prefix "num" for integer types
E.g.
```cpp
void Array::GetAt(int index);
void Allocator::Allocate(int numElements);
```

###Variables

* Use camelCasing

If choosing the type name to use as the variable name is enough to understand the variable meaning then use it.
E.g.
```cpp
class Airplane
{
    Propeller m_Propeller;
};

Airplane airplane;
```

If the type name is not enough to understand the variable then explain what makes it different
```
Airplane bigAirplane(100);
Airplane smallAirplane(1);
```
###Name for containers

If plural name of the item is enough to understand the meaning do like this:
E.g.
```
std::vector<Control> m_Controls;
```
if you need to specify a name don't do this
```
std::vector<Control> m_Controls1;
```
Do something like:
```
std::vector<Control> m_StaticControls;
std::vector<Control> m_DynamicControls;
```
This tip is valid for arguments and variables as well
E.g.
```
//Don't do this
Paint(const Pen & pen1, const Pen & pen2);
//Do
Paint(const Pen & backgroundPen, const Pen & borderPen);
```

###Important variable prefixes

* Use the "sp" for smart pointers and use "p" for pointers
* Use the prefix "h" or the suffix "Handle" for handles E.g.
```cpp
class File
{
  FILE m_hFile; // or m_FileHandle;
  shared_ptr<Item> m_spItem;
  Item * m_pSelectedItem;
};
```
