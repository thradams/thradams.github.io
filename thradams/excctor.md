##Exceptions in constructors

Everything you need to know about exceptions in the class constructor is:

**If you throw an exception in your constructor, your destructor will never be called.**

Everything else is done automatically for you.

So:

```cpp

class X
{
    Object * m_p1;
    Object * m_p2;

    //don't do this
    X()
    {
        m_p1 = new Object;
        m_p2 = new Object; // LineB
    }

    //do this!
    X()
    {
        std::auto_ptr<Object> sp1(new Object);
        std::auto_ptr<Object> sp2(new Object);
        m_p1 = sp1.release();
        m_p2 = sp2.release();
    }

    ~X()
    {
        delete m_p1;
        delete m_p2;
    }
};
```
Why the first one is wrong?\\
Because if some exception occurs in the 'LineB' in the Object constructor or in the new operator the ~X destructor will never be called.
So we will have a memory leak in m_p1.

Is it a good idea to throw in constructor?
Yes. Because you will have a simpler class invariant
