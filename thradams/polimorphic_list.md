==polimorphic_list==


{{{cpp

#include <iostream>
#include "polimorphic_list.h"

using namespace std;

struct Box
{
    int i;
    Box(int x) : i(x)
    {
    }

    void Draw()
    {
        cout << "Box" << endl;
    }
};

struct Circle
{
    int radius;
    Circle(int r) : radius(r)
    {
    }

    void Draw()
    {
        cout << "Circle" << endl;
    }
};

int main()
{
    polimorphic_list list;
    list.emplace_back<Box>(2);
    list.emplace_back<Circle>(1);

    for (auto& item : list)
    {        
        if (auto p = item.is<Circle>())
        {
            p->Draw();
        }        
        else if (auto p = item.is<Box>())
        {
            p->Draw();
        }
    }

    return 0;
}


}}}

===Implementation===

{{{cpp

#pragma once
#include <cstddef>
#include <algorithm>

class PointerType
{
    template<class T>
    static size_t IdOf() 
    {
        static size_t v = 0;
        return (size_t) &v;
    }
    
    size_t m_id;
    void * m_pObject = nullptr;
  
protected:
    template<class T>
    void Set(T* p)
    {
        m_pObject = p;
        m_id = IdOf<T>();
    }

public:

    template<class T>
    T* is()
    {
        return m_id == IdOf<T>() ? (T*) m_pObject : nullptr;
    }   
};

struct ListNodeBase : public PointerType
{
    ListNodeBase* m_next;
    ListNodeBase* m_prev;
};

template<class T>
struct ListNode : public ListNodeBase
{
    T m_data;
    template<class... _Valty>
    ListNode(_Valty&&... _Val) : m_data(_Val...)
    {
        Set(&m_data);
    }
};

struct ListIterator
{
    typedef ListIterator iterator;
    typedef ListIterator const_iterator;
    typedef PointerType value_type;
    typedef value_type* pointer;
    typedef value_type& reference;

    typedef ListNodeBase _Node;

    typedef size_t   size_type;
    typedef ptrdiff_t difference_type;

    ListNodeBase* m_node;

    ListIterator(ListNodeBase* x) : m_node(x)
    {
    }

    ListIterator()
    {
    }

    void Increment()
    {
        m_node = m_node->m_next;
    }
    void Decrement()
    {
        m_node = m_node->m_prev;
    }

    bool operator==(const ListIterator& x) const
    {
        return m_node == x.m_node;
    }

    bool operator!=(const ListIterator& x) const
    {
        return m_node != x.m_node;
    }

    ListIterator(const iterator& x) : ListIterator(x.m_node)
    {
    }

    reference operator*() const
    {
        return *((_Node*) m_node);
    }

    pointer operator->() const
    {
        return &(operator*());
    }

    ListIterator& operator++()
    {
        this->Increment();
        return *this;
    }

    ListIterator operator++(int)
    {
        auto tmp = *this;
        this->Increment();
        return tmp;
    }

    ListIterator& operator--()
    {
        this->Decrement();
        return *this;
    }

    ListIterator operator--(int)
    {
        auto tmp = *this;
        this->Decrement();
        return tmp;
    }
};

class polimorphic_list
{
 public:
    typedef PointerType value_type;
    typedef value_type* pointer;
    typedef const value_type* const_pointer;
    typedef value_type& reference;
    typedef const value_type& const_reference;
    typedef ListNodeBase _Node;
    typedef size_t size_type;
    typedef ptrdiff_t difference_type;
    typedef ListIterator iterator;
    typedef ListIterator const_iterator;

private:    
    ListNodeBase* m_node;
    template<class T, class... _Valty>
    ListNodeBase* CreateNode(_Valty&&... _Val)
    {
        ListNodeBase* p = new ListNode<T>(std::forward<_Valty>(_Val)...);
        return p;
    }

public:
    polimorphic_list& operator=(const polimorphic_list& x) = delete;
    polimorphic_list(polimorphic_list&) = delete;

    explicit polimorphic_list()
    {
        m_node = CreateNode<void*>();
        m_node->m_next = m_node;
        m_node->m_prev = m_node;
    }

    ~polimorphic_list()
    {
        clear();
    }

    iterator begin()
    {
        return (_Node*) (m_node->m_next);
    }

    const_iterator begin() const
    {
        return (_Node*) (m_node->m_next);
    }

    iterator end()
    {
        return m_node;
    }

    const_iterator end() const
    {
        return m_node;
    }

    bool empty() const
    {
        return m_node->m_next == m_node;
    }

    size_type max_size() const
    {
        return size_type(-1);
    }

    reference front()
    {
        return *begin();
    }

    const_reference front() const
    {
        return *begin();
    }

    reference back()
    {
        return *(--end());
    }

    const_reference back() const
    {
        return *(--end());
    }

    void swap(polimorphic_list& x)
    {
        std::swap(m_node, x.m_node);
    }

    template<class T, class... _Valty>
    iterator emplace_insert(iterator position, _Valty&&... _Val)
    {
        _Node* tmp = CreateNode<T>(std::forward<_Valty>(_Val)...);
        tmp->m_next = position.m_node;
        tmp->m_prev = position.m_node->m_prev;
        position.m_node->m_prev->m_next = tmp;
        position.m_node->m_prev = tmp;
        return tmp;
    }

    template<class T, class... _Valty>
    void emplace_back(_Valty&&... _Val)
    {
        emplace_insert<T>(end(), std::forward<_Valty>(_Val)...);
    }

    iterator erase(iterator position)
    {
        ListNodeBase* next_node = position.m_node->m_next;
        ListNodeBase* prev_node = position.m_node->m_prev;
        _Node* n = (_Node*) position.m_node;
        prev_node->m_next = next_node;
        next_node->m_prev = prev_node;
        delete n;
        return iterator((_Node*) next_node);
    }

    iterator erase(iterator first, iterator last)
    {
        while (first != last)
            erase(first++);
        return last;
    }
    
    void pop_front()
    {
        erase(begin());
    }

    void pop_back()
    {
        iterator tmp = end();
        erase(--tmp);
    }
    
    void clear()
    {
        ListNodeBase* cur = (ListNodeBase*) m_node->m_next;
        while (cur != m_node)
        {
            ListNodeBase* tmp = cur;
            cur = (ListNodeBase*) cur->m_next;
            delete tmp;
        }
        m_node->m_next = m_node;
        m_node->m_prev = m_node;
    }    
};

}}}





==Test using polimorphic vector of unique_ptr of shapes==




{{{cpp
#include "stdafx.h"

#include <iostream>
#include <vector>
#include <memory>
#include "Stopwatch.h"
using namespace std;

int boxCount = 0;
int circleCount = 0;
int ellipseCount = 0;

struct Shape
{
    virtual void Draw() = 0;
};

struct TBox : public Shape
{
    int m_boxint;
    TBox()
    {
        m_boxint = 1;
    }

    void Draw()
    {
        boxCount += m_boxint;
    }
};

struct TCircle : public Shape
{
    int m_circleint;
    TCircle()
    {
        m_circleint = 1;
    }

    void Draw()
    {
        circleCount += m_circleint;
    }
};

struct TEllipse : public Shape
{
    int m_ellipseint;
    TEllipse()
    {
        m_ellipseint = 1;
    }

    void Draw()
    {
        ellipseCount += m_ellipseint;
    }
};

template<class T>
void CreateShapes(T& shapes)
{
    Stopwatch sw(true);
    for (int i = 0; i < 100000; i++)
    {
        if (i % 2 == 0)
        {
            shapes.emplace_back(std::make_unique<TBox>());
        }
        else if (i % 3 == 0)
        {
            shapes.emplace_back( std::make_unique<TCircle>());
        }
        else if (i % 5 == 0)
        {
            shapes.emplace_back(std::make_unique<TEllipse>());
        }
    }

    sw.Stop();
    std::cout << "create shapes " << sw << std::endl;

}


void PrintCount()
{
    std::cout << "box count = " << boxCount << std::endl;
    std::cout << "circle count = " << circleCount << std::endl;
    std::cout << "ellipse count = " << ellipseCount << std::endl;
    std::cout << "------------------------------------" << std::endl;
    std::cout << std::endl;
}

int main()
{
    std::vector<std::unique_ptr<Shape>> shapes;
    CreateShapes(shapes);

    Stopwatch sw(true);

    for (auto& item : shapes)
    {
         item->Draw();        
    }


    sw.Stop();    
    std::cout << "vector shapes virtual " << sw << std::endl << std::endl;
    PrintCount();

    return 0;
}


}}}


{{{
create shapes 6 ms; 12566 ticksS
vector shapes virtual 0 ms; 1774 ticksS

box count = 50000
circle count = 16667
ellipse count = 6667
------------------------------------
}}}

==Test using polimorphic_list==

{{{cpp
#include "stdafx.h"

#include <iostream>
#include "polimorphic_list.h"
#include "Stopwatch.h"
using namespace std;


int boxCount = 0;
int circleCount = 0;
int ellipseCount = 0;


struct TBox 
{
    int m_boxint;
    TBox()
    {
        m_boxint = 1;
    }
    
    void Draw() 
    {
        boxCount += m_boxint;
    }
};

struct TCircle 
{
    int m_circleint;
    TCircle()
    {
        m_circleint = 1;
    }
    
    void Draw() 
    {
        circleCount += m_circleint;
    }
};

struct TEllipse 
{
    int m_ellipseint;
    TEllipse()
    {
        m_ellipseint = 1;
    }
    
    void Draw() 
    {
        ellipseCount += m_ellipseint;
    }
};

template<class T>
void CreateShapes(T& shapes)
{
    Stopwatch sw(true);
    for (int i = 0; i < 100000; i++)
    {
        if (i % 2 == 0)
        {
            shapes.emplace_back<TBox>();
        }
        else if (i % 3 == 0)
        {
            shapes.emplace_back<TCircle>();
        }
        else if (i % 5 == 0)
        {
            shapes.emplace_back<TEllipse>();
        }
    }

    sw.Stop();
    std::cout << "create shapes " << sw << std::endl;

}


void PrintCount()
{
    std::cout << "box count = " << boxCount << std::endl;
    std::cout << "circle count = " << circleCount << std::endl;
    std::cout << "ellipse count = " << ellipseCount << std::endl;
    std::cout << "------------------------------------" << std::endl;
    std::cout << std::endl;
}

int main()
{
    polimorphic_list shapes;
    CreateShapes(shapes);

    Stopwatch sw(true);

    for (auto item : shapes)
    {
        if (auto p = item.is<TCircle>())
        {
            p->Draw();
        }
        else if (auto p = item.is<TBox>())
        {
            p->Draw();
        }
        else if (auto p = item.is<TEllipse>())
        {
            p->Draw();
        }
    }


    sw.Stop();
    
    std::cout << "polimorphic list " << sw << std::endl << std::endl;
    PrintCount();
    return 0;
}


}}}


{{{
create shapes 5 ms; 10839 ticks S
polimorphic list 0 ms; 848 ticks S

box count = 50000
circle count = 16667
ellipse count = 6667
------------------------------------
}}}



Changing

From:

{{{cpp

class PointerType
{
    template<class T>
    static size_t IdOf() 
    {
        static size_t v = 0;
        return (size_t) &v;
    }
    
    size_t m_id;
    void * m_pObject = nullptr;
  
protected:
    template<class T>
    void Set(T* p)
    {
        m_pObject = p;
        m_id = IdOf<T>();
    }

public:

    template<class T>
    T* is()
    {
        return m_id == IdOf<T>() ? (T*) m_pObject : nullptr;
    }   
};
}}}

To:
{{{cpp

class PointerType
{
    const type_info* m_id;
    void * m_pObject = nullptr;
  
protected:
    template<class T>
    void Set(T* p)
    {
        m_pObject = p;
        m_id = &typeid(T);
    }

public:

    template<class T>
    T* is()
    {
        return *m_id == typeid(T) ? (T*) m_pObject : nullptr;
    }   
};
}}}

Output
{{{
create shapes 5 ms; 10713 ticks S
polimorphic list 2 ms; 4572 ticks S

box count = 50000
circle count = 16667
ellipse count = 6667
------------------------------------
}}}

