
Sample

```cpp
#include "stdafx.h"
#include <iostream>
#include "polymorphic_list.h"
#include <cassert>

using namespace std;

struct Box
{
    int i;
    Box(int x) : i(x)
    {
    }

    void Draw()
    {
        cout << "I am Box class" << endl;
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
        cout << "I am Circle class" << endl;
    }
};



void Sample1()
{
    polymorphic_list list;
    
    emplace_back<Box>(list, 2);
    emplace_back<Circle>(list, 1);
    
    //Option 1
    for (auto& item : list)
    {
        switch (is_index<Box, Circle>(item))
        {
        case 1:
            ref<Box>(item).Draw();
            break;
        case 2:
            ref<Circle>(item).Draw();
            break;
        default:
            assert(false);
        }
    }

    //Option 2
    for (auto& item : list)
    {
        if (auto p = is_ptr<Box>(item))
        {
            p->Draw();
        }
        else if (auto p = is_ptr<Circle>(item))
        {
            p->Draw();
        }
        else
        {
            assert(false);
        }
    }
}

int main()
{
    Sample1();
    return 0;
}
```


Code

```cpp
#pragma once
#include <algorithm>
#include <cassert>
#include <memory>

template<class T>
static size_t type_id()
{
    static size_t id = sizeof(T);
    return (size_t) &id;
}

class type_pointer
{
    size_t m_id = 0;
    void * m_pObject = nullptr;
    const type_info * m_ti;
protected:

    template<class T>
    void set_pointer(T* p)
    {
        m_ti = &typeid(T);
        m_pObject = p;
        m_id = type_id<T>();
    }

public:

    friend size_t id(const type_pointer& tp)
    {
        return tp.m_id;
    }

    friend void* ptr(const type_pointer& tp)
    {
        return tp.m_pObject;
    }
};

template<class T>
T* ptr(const type_pointer& tp)
{
    assert(is<T>(tp));
    return (T*) ptr(tp);
}

template<class T>
T& ref(const type_pointer& tp)
{
    assert(is<T>(tp));
    return *((T*) ptr(tp));
}

template<class T>
T* is_ptr(const type_pointer& tp)
{
    return is<T>(tp) ? ptr<T>(tp) : nullptr;
}

template<class T>
bool is(const type_pointer& tp)
{
    return id(tp) == type_id<T>();
}

template<int N>
int is_index_imp(const type_pointer&)
{
    return -1;
}

template<int N, class T1, typename... TN>
int is_index_imp(const type_pointer& tp)
{
    if (is<T1>(tp))
    {
        return N;
    }

    return is_index_imp<N + 1, TN...>(tp);
}

template<typename... TN>
int is_index(const type_pointer& tp)
{
    return is_index_imp<1, TN...>(tp);
}

struct polymorphic_list_node_base : public type_pointer
{
    polymorphic_list_node_base* m_next;
    polymorphic_list_node_base* m_prev;
    polymorphic_list_node_base(polymorphic_list_node_base* p,
        polymorphic_list_node_base* n)
        : m_next(n)
        , m_prev(p)
    {
    }

    friend polymorphic_list_node_base* next(polymorphic_list_node_base& node)
    {
        return node.m_next;
    }

    friend polymorphic_list_node_base* prev(polymorphic_list_node_base& node)
    {
        return node.m_prev;
    }
};

template<class T>
struct polymorphic_list_node : public polymorphic_list_node_base
{
    T m_data;
    template<class... Args>
    polymorphic_list_node(polymorphic_list_node_base* p,
        polymorphic_list_node_base* n,
        Args&&... args)
        : polymorphic_list_node_base(p, n)
        , m_data(args...)

    {
        set_pointer<T>(&m_data);
    }
};

struct polymorphic_list_iterator
{
    typedef polymorphic_list_iterator iterator;
    typedef polymorphic_list_iterator const_iterator;
    typedef type_pointer              value_type;
    typedef value_type*               pointer;
    typedef value_type&               reference;
    typedef size_t                    size_type;
    typedef ptrdiff_t                 difference_type;

    polymorphic_list_node_base* m_pNode;

    polymorphic_list_iterator(polymorphic_list_node_base* x) : m_pNode(x)
    {
    }

    polymorphic_list_iterator(const iterator& x)
        : m_pNode(x.m_pNode)
    {
    }

    polymorphic_list_iterator()
    {
    }

    void Increment()
    {
        m_pNode = next(*m_pNode);
    }

    void Decrement()
    {
        m_pNode = prev(*m_pNode);
    }

    bool operator==(const polymorphic_list_iterator& x) const
    {
        return m_pNode == x.m_pNode;
    }

    bool operator!=(const polymorphic_list_iterator& x) const
    {
        return m_pNode != x.m_pNode;
    }

    reference operator*() const
    {
        return *(m_pNode);
    }

    pointer operator->() const
    {
        return &(operator*());
    }

    polymorphic_list_iterator& operator++()
    {
        this->Increment();
        return *this;
    }

    polymorphic_list_iterator operator++(int)
    {
        auto tmp = *this;
        this->Increment();
        return tmp;
    }

    polymorphic_list_iterator& operator--()
    {
        this->Decrement();
        return *this;
    }

    polymorphic_list_iterator operator--(int)
    {
        auto tmp = *this;
        this->Decrement();
        return tmp;
    }
};

class polymorphic_list
{
public:
    typedef type_pointer              value_type;
    typedef value_type*               pointer;
    typedef const value_type*         const_pointer;
    typedef value_type&               reference;
    typedef const value_type&         const_reference;
    typedef size_t                    size_type;
    typedef ptrdiff_t                 difference_type;
    typedef polymorphic_list_iterator iterator;
    typedef polymorphic_list_iterator const_iterator;

    explicit polymorphic_list()
    {
        m_pNode = new polymorphic_list_node<Empty>(nullptr, nullptr);
        m_pNode->m_next = m_pNode;
        m_pNode->m_prev = m_pNode;
    }

    ~polymorphic_list()
    {
        clear();
    }

private:
    polymorphic_list_node_base* m_pNode;

    struct Empty
    {
    };

    iterator insert_node(iterator position, polymorphic_list_node_base* tmp)
    {
        tmp->m_next = position.m_pNode;
        tmp->m_prev = prev(*position.m_pNode);
        position.m_pNode->m_prev->m_next = tmp;
        position.m_pNode->m_prev = tmp;
        return tmp;
    }

    std::unique_ptr<polymorphic_list_node_base> remove(iterator position)
    {
        auto* next_node = next(*position.m_pNode);
        auto* prev_node = prev(*position.m_pNode);
        auto* n = position.m_pNode;
        prev_node->m_next = next_node;
        next_node->m_prev = prev_node;

        n->m_next = nullptr;
        n->m_prev = nullptr;
        return std::unique_ptr<polymorphic_list_node_base>(n);
    }

    polymorphic_list& operator=(const polymorphic_list& x) = delete;
    polymorphic_list(polymorphic_list&) = delete;

    void clear()
    {
        auto* cur = next(*m_pNode);
        while (cur != m_pNode)
        {
            auto* tmp = cur;
            cur = next(*cur);
            delete tmp;
        }
        m_pNode->m_next = m_pNode;
        m_pNode->m_prev = m_pNode;
    }

    friend iterator begin(polymorphic_list& lst)
    {
        return next(*lst.m_pNode);
    }

    friend const_iterator cbegin(const polymorphic_list& lst)
    {
        return next(*lst.m_pNode);
    }

    friend iterator end(polymorphic_list& lst)
    {
        return lst.m_pNode;
    }

    friend const_iterator cend(const polymorphic_list& lst)
    {
        return lst.m_pNode;
    }

    friend bool empty(const polymorphic_list& lst)
    {
        return next(*lst.m_pNode) == lst.m_pNode;
    }

    friend void swap(polymorphic_list& a, polymorphic_list& b)
    {
        std::swap(a.m_pNode, b.m_pNode);
    }

    template<class T, class... Args>
    friend iterator emplace_insert(polymorphic_list& list, iterator position, Args&&... args)
    {
        auto* tmp = new polymorphic_list_node<T>(nullptr,
            nullptr,
            std::forward<Args>(args)...);
        return list.insert_node(position, tmp);
    }

    friend void move_to(polymorphic_list& from, iterator position, polymorphic_list& into)
    {
        auto sp = from.remove(position);
        into.insert_node(end(into), sp.release());
    }

    friend polymorphic_list::iterator erase(polymorphic_list& list, polymorphic_list::iterator position)
    {
        auto* next_node = next(*position.m_pNode);
        auto* prev_node = prev(*position.m_pNode);
        auto* n = position.m_pNode;
        prev_node->m_next = next_node;
        next_node->m_prev = prev_node;
        delete n;
        return iterator(next_node);
    }

    friend void clear(polymorphic_list& list)
    {
        list.clear();
    }
};

template<class T, class... Args>
void emplace_back(polymorphic_list& list, Args&&... args)
{
    emplace_insert<T>(list, end(list), std::forward<Args>(args)...);
}

inline polymorphic_list::iterator erase(polymorphic_list& list,
    polymorphic_list::iterator first,
    polymorphic_list::iterator last)
{
    while (first != last)
        erase(list, first++);
    return last;
}

inline polymorphic_list::reference front(polymorphic_list& lst)
{
    return *begin(lst);
}

inline polymorphic_list::const_reference  cfront(const polymorphic_list& lst)
{
    return *cbegin(lst);
}

inline void pop_front(polymorphic_list& list)
{
    erase(list, begin(list));
}

inline void pop_back(polymorphic_list& list)
{
    auto tmp = end(list);
    erase(list, --tmp);
}

inline polymorphic_list::reference back(polymorphic_list& lst)
{
    return *(--end(lst));
}

inline polymorphic_list::const_reference cback(const polymorphic_list& lst)
{
    return *(--cend(lst));
}


```

