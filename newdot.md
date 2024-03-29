
Some ideas about dot operator overloding.


###Sample 1:
```cpp
class C { 
public:
 int get() { return 1; }
};

int operator . square(const C& r) 
{
     return r.get() * r.get();   
}

int main()
{
  C c;
  c.square(); //ok
  square(c);  //ok
}
```

###Sample 2:
What happens if C::square exists?
```cpp
class C { 
public:
 int get() { return 1; }

  int square() const
  {
     return r.get() * r.get();   
  }
};

//Error, ambiguous C already have C::square
int operator . square(const C& r) 
{
     return r.get() * r.get();   
}
```


###Sample 3:
Enabling uniform call.

```cpp
class C { 
public:
 int get() { return 1; }

  int square() const
  {
     return r.get() * r.get();   
  }
};

using int operator . square(const C& r);

int main()
{
  C c;
  c.square(); //ok
  square(c);  //ok
}
```

###Sample 3:
Uniform call not enabled.

```cpp
class C { 
public:
 int get() { return 1; }

  int square() const
  {
     return r.get() * r.get();   
  }
};

int main()
{
  C c;
  c.square(); //ok
  square(c);  //error
}
```

###Sample 4:

For non-class types.

```cpp
std::string operator . tostring(int i)
{
...
}

int main()
{
  int i = 1;
  std::string s = i.tostring();
}

```


###Sample 5:
Syntax alternatives

```cpp
class C { 
public:
 int get() { return 1; }
};

int operator C::square() const
{
     return this.get() * this.get();   
}
```



##References

[How Non-Member Functions Improve Encapsulation - Scott Meyers](http://drdobbs.com/184401197)

[Uniform Function Call Syntax - Walter Bright](http://drdobbs.com/blogs/cpp/232700394)

[comp.lang.c++.moderated](https://groups.google.com/group/comp.lang.c++.moderated/browse_frm/thread/70bee02fdf74fb81/cb54bcba598c4a12?hl=pt&lnk=gst&q=dot+overloding#cb54bcba598c4a12)

[FAQ Stroustrup](http://www2.research.att.com/~bs/bs_faq2.html)


