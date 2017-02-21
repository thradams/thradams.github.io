##Virtual iterator

How to iterate in any kind of STL container with using the same iterator?

```cpp

using namespace std;

int main()
{
    vector<int> vec;
    vec.push_back(1);
    vec.push_back(2);

    list<int> lst;
    lst.push_back(3);
    lst.push_back(4);

    for (v_iterator<int> it(vec); it.next() ; )
    {
      cout << *it << endl;
    }

    v_iterator<int> it(vec, true); // true arg means "reverse"
    while(it.next())
    {
        cout << it.get() << endl;
    }

    it.reset();
    while(it.next())
    {
        cout << it.get() << endl;
    }

    it.reset(lst);
    while(it.next())
    {
        cout << *it << endl;
    }

    it.reset();
    if (it.next())
    {
        v_iterator<int> it2(it);
        cout << *it2 << endl;
        v_iterator<int> it3;
        it3 = it2;
        cout << *it3 << endl;
    }
}
Source code for the iterator

template<class T>
struct virtual_iterator
{
    virtual void start() = 0;
    virtual bool end() const = 0;
    virtual void next() = 0;
    virtual const T & get() const = 0;
    virtual virtual_iterator * clone() const = 0;
    virtual ~virtual_iterator() {}
};

template<class T>
class virtual_iterator_imp : public virtual_iterator< typename T::value_type >
{
    const typename T::const_iterator m_begin;
    const typename T::const_iterator m_end;
    typename T::const_iterator m_it;

    void start() { m_it = m_begin;  }

    void next()  { ++m_it; }

    bool end() const { return m_it != m_end; }

    typename const T::value_type & get() const { return *m_it; }

    virtual_iterator_imp * clone() const { return new virtual_iterator_imp(*this); }

    bool operator == (const virtual_iterator_imp &); //not imp
    bool operator != (const virtual_iterator_imp &); //not imp

public:
    virtual_iterator_imp(const T & container) :
      m_begin(container.begin()),
          m_end(container.end()),
          m_it()
      {
      }

      virtual_iterator_imp(const virtual_iterator_imp & it) :
      m_begin(it.m_begin),
          m_end(it.m_end),
          m_it(it.m_it)
      {
      }

      virtual_iterator_imp & operator = (const virtual_iterator_imp & it)
      {
          m_begin = it.m_begin;
          m_end = it.end;
          m_it = it.m_it;
          return *this;
      }
};



template<class T>
class virtual_rev_iterator_imp : public virtual_iterator< typename T::value_type >
{
    const typename T::const_reverse_iterator m_rbegin;
    const typename T::const_reverse_iterator m_rend;
    typename T::const_reverse_iterator m_it;

    void start() { m_it = m_rbegin;  }

    void next()  { ++m_it; }

    bool end() const { return m_it != m_rend; }

    typename const T::value_type & get() const { return *m_it; }

    virtual_rev_iterator_imp * clone() const { return new virtual_rev_iterator_imp(*this); }

    bool operator == (const virtual_rev_iterator_imp &); //not imp
    bool operator != (const virtual_rev_iterator_imp &); //not imp

public:
    virtual_rev_iterator_imp(const T & container) :
      m_rbegin(container.rbegin()),
          m_rend(container.rend()),
          m_it()
      {
      }

      virtual_rev_iterator_imp(const virtual_rev_iterator_imp & it) :
      m_rbegin(it.m_rbegin),
          m_rend(it.m_rend),
          m_it(it.m_it)
      {
      }

      virtual_rev_iterator_imp & operator = (const virtual_rev_iterator_imp & it)
      {
          m_rbegin = it.m_rbegin;
          m_rend = it.rend;
          m_it = it.m_it;
          return *this;
      }
};

template<class T>
class v_iterator
{
    virtual_iterator<T> * m_pIt;
    bool m_first;

public:

    template<class ContainerType>
    v_iterator(const ContainerType & container, bool bReverse = false) :
    m_first(true)
    {
        if (bReverse)
            m_pIt = new virtual_rev_iterator_imp<ContainerType>(container);
        else
            m_pIt = new virtual_iterator_imp<ContainerType>(container);
    }

    v_iterator() : m_first(true), m_pIt(0)
    {
    }

    v_iterator(const v_iterator &it) :
    m_first(it.m_first),
        m_pIt(it.m_pIt->clone())
    {
    }

    void swap(v_iterator &it)
    {
        std::swap(it.m_first, m_first);
        std::swap(it.m_pIt, m_pIt);
    }

    ~v_iterator() { delete m_pIt;  }
    void reset() {  m_first = true;  }

    template<class ContainerType>
    void reset(const ContainerType & container, bool reverse = false)
    {
        v_iterator(container, reverse).swap(*this);
    }

    v_iterator& operator =(const v_iterator & it)
    {
        v_iterator(it).swap(*this);
        return *this;
    }

    bool next()
    {
        if (!m_pIt)
            return false;

        if (m_first)
        {
            m_pIt->start();
            m_first = false;
        }
        else
        {
            m_pIt->next();
        }

        return m_pIt->end();
    }

    const T & get() const
    {
        return m_pIt->get();
    }

    const T & operator *() const
    {
        return get();
    }
};
```
