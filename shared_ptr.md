##shared_ptr
 
This is my implementation of the TR1::shared_ptr, tr1::weak_ptr 

See more details in:

http://www.open-std.org/JTC1/SC22/WG21/docs/papers/2005/n1745.pdf

http://www.boost.org
http://www.boost.org/libs/smart_ptr/smart_ptr.htm


```cpp

/*-
 * Thiago Rosso Adams <thiago.adams@gmail.com>
 * This is the implementation of shared_ptr and weak_ptr proposed in tr1.
 * See details in: http://www.open-std.org/JTC1/SC22/WG21/docs/papers/2005/n1745.pdf

 Permission to copy, use, modify, sell and distribute this software
 is granted provided this copyright notice appears in all copies.
 This software is provided "as is" without express or implied
 warranty, and with no claim as to its suitability for any purpose.
*/
#pragma once
#ifndef _MEMORYTR1_
#define _MEMORYTR1_

#include <memory>
#include <cassert>

namespace std {
    namespace tr1 {

        namespace detail
        {
            struct shared_count
            {
                long use_count;
                long weak_count;
                shared_count(long use, long weak) : use_count(use), weak_count(weak)
                {
                }
                virtual void call_deleter(void *) = 0;
                virtual void * get_deleter(const type_info &) {  return 0; }
            };

            template<class T, class D>
            struct shared_count_imp : public shared_count
            {
                D deleter;
                shared_count_imp(long use, long weak, const D & d) :  shared_count(use, weak), deleter(d)
                {
                }

                void call_deleter(void *pv)
                {
                    T * p = reinterpret_cast<T*>(pv);
                    deleter(p);
                }

                void * get_deleter(const type_info &inf)
                {
                    return inf == typeid(D) ? &deleter : 0;
                };

            };

            template<class T>
            struct shared_count_imp_default : public shared_count
            {
                shared_count_imp_default(long use, long weak) :  shared_count(use, weak)
                {
                }

                void call_deleter(void *pv)
                {
                    T * p = reinterpret_cast<T*>(pv);
                    delete p;
                }
            };

        };

        template<class T> class shared_ptr;

        class bad_weak_ptr: public std::exception
        {
        public:
            bad_weak_ptr() : std::exception(""){}
            const char * what()
            {
                return "tr1::bad_weak_ptr";
            }
        };

        template<class T> class weak_ptr
        {
            T *m_p;
            detail::shared_count* m_pCount;

        public:
            typedef T element_type;

            // constructors
            weak_ptr() : m_p(0) , m_pCount(0)
            {
                assert(use_count() == 0);
            }

            template<class Y> weak_ptr(shared_ptr<Y> const& r) : m_pCount(r.m_pCount), m_p(r.m_p)
            {
                if (m_pCount)
                {
                    m_pCount->weak_count++;
                }

                assert(use_count() == r.use_count());
            }

            weak_ptr(weak_ptr const& r): m_pCount(r.m_pCount), m_p(r.m_p)
            {
                if (m_pCount)
                {
                    m_pCount->weak_count++;
                }
                assert(use_count() == r.use_count());
            }

            template<class Y> weak_ptr(weak_ptr<Y> const& r) : m_pCount(r.m_pCount), m_p(r.m_p)
            {
                if (m_pCount)
                {
                    m_pCount->weak_count++;
                }
                assert(use_count() == r.use_count());
            }

            // destructor
            ~weak_ptr()
            {
                if (m_pCount)
                {
                    m_pCount->weak_count--;
                    if (m_pCount->weak_count == 0 && m_pCount->use_count == 0)
                        delete m_pCount;
                }
            }

            // assignment
            weak_ptr& operator=(weak_ptr const& r)
            {
                weak_ptr(r).swap(*this);
                return *this;
            }

            template<class Y> weak_ptr& operator=(weak_ptr<Y> const& r)
            {
                weak_ptr(r).swap(*this);
                return *this;
            }

            template<class Y> weak_ptr& operator=(shared_ptr<Y> const& r)
            {
                weak_ptr(r).swap(*this);
                return *this;
            }

            // modifiers
            void swap(weak_ptr& r)
            {
                std::swap(m_p, r.m_p);
                std::swap(m_pCount, r.m_pCount);
            }

            void reset()
            {
                weak_ptr().swap(*this);
            }

            // observers
            long use_count() const
            {
                if (m_pCount)
                    return m_pCount->use_count;
                return 0;
            }

            bool expired() const
            {
                return use_count() == 0;
            }

            shared_ptr<T> lock() const
            {
                return expired() ? shared_ptr<T>() : shared_ptr<T>(*this);
            }
        };

        // comparison
        template<class T, class U> bool operator<(weak_ptr<T> const& a, weak_ptr<U> const& b)
        {
            return a.get() < b.get();
        }

        // specialized algorithms
        template<class T> void swap(weak_ptr<T>& a, weak_ptr<T>& b)
        {
            a.swap(b);
        }

        template<class T> class shared_ptr {

            friend class weak_ptr<T>;

            T *m_p;
            detail::shared_count* m_pCount;

        public:
            typedef T element_type;

            // [2.2.3.1] constructors
            shared_ptr() : m_p(0), m_pCount(0)
            {
                assert(use_count() == 0 && get() == 0);
            }

            template<class Y> explicit shared_ptr(Y * p)
            {
                try
                {
                    //Throws: bad_alloc, or an implementation-defined exception when a resource other
                    // than memory could not be obtained.
                    m_pCount = new detail::shared_count_imp_default<Y>(1, 0);
                    m_p = p;
                }
                catch(...)
                {
                    delete p; //Exception safety: If an exception is thrown, delete p is called.
                    throw;
                }
                assert(use_count() == 1 && get() == p);
            }

            //The copy constructor and destructor of D shall
            // not throw exceptions. The expression d(p) shall be well-formed,
            // shall have well defined behavior, and shall not throw exceptions.
            template<class Y, class D> shared_ptr(Y * p, D d)
            {
                try
                {
                    m_pCount = new detail::shared_count_imp<T,D>(1,0, d);
                    m_p = p;
                }
                catch(...)
                {
                    d(p); //If an exception is thrown, d(p) is called.
                    throw;
                }
                assert(use_count() == 1 && get() == p);
            }

            shared_ptr(shared_ptr const& r)
            {
                m_pCount = r.m_pCount;
                m_p = r.m_p;
                if (m_pCount)
                    m_pCount->use_count++;
                assert(get() == r.get() && use_count() == r.use_count());
            }

            template<class Y> shared_ptr(shared_ptr<Y> const& r)
            {
                m_pCount = r.m_pCount;
                m_p = r.m_p;
                if (m_pCount)
                    (*m_pCount)++;
                assert(get() == r.get() && use_count() == r.use_count());
            }

            template<class Y> explicit shared_ptr(weak_ptr<Y> const& r)
            {
                if (r.expired())
                    throw bad_weak_ptr();

                m_pCount = r.m_pCount;
                m_p = r.m_p;
                if (m_pCount)
                    (*m_pCount)++;
                assert(get() == r.get() && use_count() == r.use_count());
            }

            template<class Y> explicit shared_ptr(auto_ptr<Y>& r)
            {
                m_pCount = new detail::shared_count_imp_default(1, 0);
                m_p = r.release();
                assert(use_count() == 1 && r.get() == 0);
            }

            // [2.2.3.2] destructor
            ~shared_ptr()
            {
                if (m_pCount)
                {
                    m_pCount->use_count--;
                    if (m_pCount->use_count == 0)
                    {
                        m_pCount->call_deleter(m_p);

                        // has m_pCount being used by weak_ptrs?
                        if (m_pCount->weak_count == 0)
                          delete m_pCount; //delete if not
                    }

                }
            }

            // [2.2.3.3] assignment
            shared_ptr& operator=(shared_ptr const& r)
            {
                shared_ptr(r).swap(this);
                return *this;
            }

            template<class Y> shared_ptr& operator=(shared_ptr<Y> const& r)
            {
                shared_ptr(r).swap(this);
                return *this;
            }

            template<class Y> shared_ptr& operator=(auto_ptr<Y>& r)
            {
                shared_ptr(r).swap(this);
                return *this;
            }


            // [2.2.3.4] modifiers
            void swap(shared_ptr& r)
            {
                std::swap(m_p, r.m_p);
                std::swap(m_pCount, r.m_pCount);
            }

            void reset()
            {
                shared_ptr().swap(this);
            }

            template<class Y> void reset(Y * p)
            {
                shared_ptr(p).swap(this);
            }

            template<class Y, class D> void reset(Y * p, D d)
            {
                shared_ptr(p, d).swap(*this);
                return *this;
            }


            // [2.2.3.5] observers
            T* get() const
            {
                return m_p;
            }

            T& operator*() const
            {
                return *m_p;
            }

            T* operator->() const
            {
                return m_p;
            }

            long use_count() const
            {
                if (m_pCount)
                    return m_pCount->use_count;
                return 0;
            }

            bool unique() const
            {
                return use_count() == 0;
            }

            operator bool() const
            {
                return get() != 0;
            }

            // [2.2.3.10] shared_ptr get_deleter
            template<class D, class T2> friend D * get_deleter(shared_ptr<T2> const& p)
            {
                if (!p.m_pCount)
                    return 0;

                return reinterpret_cast<D*>(p.m_pCount->get_deleter(typeid(D)));
            }
        };

        // [2.2.3.6] shared_ptr comparisons
        template<class T, class U> bool operator==(shared_ptr<T> const& a, shared_ptr<U> const& b)
        {
            return a.get() == b.get();
        }

        template<class T, class U> bool operator!=(shared_ptr<T> const& a, shared_ptr<U> const& b)
        {
            return a.get() != b.get();
        }

        template<class T, class U> bool operator<(shared_ptr<T> const& a, shared_ptr<U> const& b)
        {
            return a.get() < b.get();
        }

        // [2.2.3.7] shared_ptr I/O
        template<class E, class T, class Y>
        basic_ostream<E, T>& operator<< (basic_ostream<E, T>& os, shared_ptr<Y> const& p)
        {
            return os << p.get();
        }

        // [2.2.3.8] shared_ptr specialized algorithms
        template<class T> void swap(shared_ptr<T>& a, shared_ptr<T>& b)
        {
            a.swap(b);
        }

        // [2.2.3.9] shared_ptr casts
        template<class T, class U> shared_ptr<T> static_pointer_cast(shared_ptr<U> const& r)
        {
            return shared_ptr<T>( static_cast<T*>(r.get()) );
        }

        template<class T, class U> shared_ptr<T> dynamic_pointer_cast(shared_ptr<U> const& r)
        {
            return shared_ptr<T>( dynamic_cast<T*>(r.get()) );
        }

        template<class T, class U> shared_ptr<T> const_pointer_cast(shared_ptr<U> const& r)
        {
            return shared_ptr<T>( const_cast<T*>(r.get()) );
        }


        template<class T> class enable_shared_from_this
        {
        protected:

            enable_shared_from_this()
            {
            }

            enable_shared_from_this(enable_shared_from_this const &)
            {
            }

            enable_shared_from_this & operator=(enable_shared_from_this const &)
            {
                return *this;
            }

            ~enable_shared_from_this()
            {
            }

        public:

            shared_ptr<T> shared_from_this()
            {
                shared_ptr<T> p(_internal_weak_this);
                assert(p.get() == this);
                return p;
            }

            shared_ptr<T const> shared_from_this() const
            {
                shared_ptr<T const> p(_internal_weak_this);
                assert(p.get() == this);
                return p;
            }

            mutable weak_ptr< T > _internal_weak_this;
        };

    } // namespace tr1
} // namespace std


#endif
```


----

Updated : 29/9/2011


```cpp

/*-

 * Thiago Rosso Adams <thiago.adams@gmail.com>

 * This is the implementation of shared_ptr and weak_ptr proposed in tra.

 * See details in: http://www.open-std.org/JTC1/SC22/WG21/docs/papers/2005/n1745.pdf



 Permission to copy, use, modify, sell and distribute this software

 is granted provided this copyright notice appears in all copies.

 This software is provided "as is" without express or implied

 warranty, and with no claim as to its suitability for any purpose.

*/
#pragma once
#ifndef _MEMORYTR1_
#define _MEMORYTR1_

#include <memory>
#include <cassert>

namespace std {
    namespace tra {

        namespace detail
        {
            struct shared_count
            {
                long use_count;
                long weak_count;
                shared_count(long use, long weak) : use_count(use), weak_count(weak)
                {
                }
                virtual void call_deleter(void *) = 0;
                virtual void * get_deleter(const type_info &) {  return 0; }
            };

            template<class T, class D>
            struct shared_count_imp : public shared_count
            {
                D deleter;
                shared_count_imp(long use, long weak, const D & d) :  shared_count(use, weak), deleter(d)
                {
                }

                void call_deleter(void *pv)
                {
                    T * p = reinterpret_cast<T*>(pv);
                    deleter(p);
                }

                void * get_deleter(const type_info &inf)
                {
                    return inf == typeid(D) ? &deleter : 0;
                };

            };

            template<class T>
            struct shared_count_imp_default : public shared_count
            {
                shared_count_imp_default(long use, long weak) :  shared_count(use, weak)
                {
                }

                void call_deleter(void *pv)
                {
                    T * p = reinterpret_cast<T*>(pv);
                    delete p;
                }
            };

        };

        template<class T> class shared_ptr;

        class bad_weak_ptr: public std::exception
        {
        public:
            bad_weak_ptr() : std::exception(""){}
            const char * what()
            {
                return "tra::bad_weak_ptr";
            }
        };

        template<class T> class weak_ptr
        {
            T *m_p;
            detail::shared_count* m_pCount;

        public:
            typedef T element_type;

            // constructors
            weak_ptr() : m_p(0) , m_pCount(0)
            {
                assert(use_count() == 0);
            }

            template<class Y> weak_ptr(shared_ptr<Y> const& r) : m_pCount(r.m_pCount), m_p(r.m_p)
            {
                if (m_pCount)
                {
                    m_pCount->weak_count++;
                }

                assert(use_count() == r.use_count());
            }

            weak_ptr(weak_ptr const& r): m_pCount(r.m_pCount), m_p(r.m_p)
            {
                if (m_pCount)
                {
                    m_pCount->weak_count++;
                }
                assert(use_count() == r.use_count());
            }

            template<class Y> weak_ptr(weak_ptr<Y> const& r) : m_pCount(r.m_pCount), m_p(r.m_p)
            {
                if (m_pCount)
                {
                    m_pCount->weak_count++;
                }
                assert(use_count() == r.use_count());
            }

            // destructor
            ~weak_ptr()
            {
                if (m_pCount)
                {
                    m_pCount->weak_count--;
                    if (m_pCount->weak_count == 0 && m_pCount->use_count == 0)
                        delete m_pCount;
                }
            }

            // assignment
            weak_ptr& operator=(weak_ptr const& r)
            {
                weak_ptr(r).swap(*this);
                return *this;
            }

            template<class Y> weak_ptr& operator=(weak_ptr<Y> const& r)
            {
                weak_ptr(r).swap(*this);
                return *this;
            }

            template<class Y> weak_ptr& operator=(shared_ptr<Y> const& r)
            {
                weak_ptr(r).swap(*this);
                return *this;
            }

            // modifiers
            void swap(weak_ptr& r)
            {
                std::swap(m_p, r.m_p);
                std::swap(m_pCount, r.m_pCount);
            }

            void reset()
            {
                weak_ptr().swap(*this);
            }

            // observers
            long use_count() const
            {
                if (m_pCount)
                    return m_pCount->use_count;
                return 0;
            }

            bool expired() const
            {
                return use_count() == 0;
            }

            shared_ptr<T> lock() const
            {
                return expired() ? shared_ptr<T>() : shared_ptr<T>(*this);
            }
        };

        // comparison
        template<class T, class U> bool operator<(weak_ptr<T> const& a, weak_ptr<U> const& b)
        {
            return a.get() < b.get();
        }

        // specialized algorithms
        template<class T> void swap(weak_ptr<T>& a, weak_ptr<T>& b)
        {
            a.swap(b);
        }

        template<class T> class shared_ptr {

            friend class weak_ptr<T>;

          
         

        public:  
          T *m_p;
           detail::shared_count* m_pCount;

            typedef T element_type;

            // [2.2.3.1] constructors
            shared_ptr() : m_p(0), m_pCount(0)
            {
                assert(use_count() == 0 && get() == 0);
            }

            template<class Y> explicit shared_ptr(Y * p)
            {
                try
                {
                    //Throws: bad_alloc, or an implementation-defined exception when a resource other
                    // than memory could not be obtained.
                    m_pCount = new detail::shared_count_imp_default<Y>(1, 0);
                    m_p = p;
                }
                catch(...)
                {
                    delete p; //Exception safety: If an exception is thrown, delete p is called.
                    throw;
                }
                assert(use_count() == 1 && get() == p);
            }

            //The copy constructor and destructor of D shall
            // not throw exceptions. The expression d(p) shall be well-formed,
            // shall have well defined behavior, and shall not throw exceptions.
            template<class Y, class D> shared_ptr(Y * p, D d)
            {
                try
                {
                    m_pCount = new detail::shared_count_imp<T,D>(1,0, d);
                    m_p = p;
                }
                catch(...)
                {
                    d(p); //If an exception is thrown, d(p) is called.
                    throw;
                }
                assert(use_count() == 1 && get() == p);
            }

            shared_ptr(shared_ptr const& r)
            {
                m_pCount = r.m_pCount;
                m_p = r.m_p;
                if (m_pCount)
                    m_pCount->use_count++;
                assert(get() == r.get() && use_count() == r.use_count());
            }

            template<class Y> shared_ptr(shared_ptr<Y> const& r)
            {
                m_pCount = r.m_pCount;
                m_p = r.m_p;
                if (m_pCount)
                {
                  m_pCount->use_count++;
                }
                assert(get() == r.get() && use_count() == r.use_count());
            }

            template<class Y> explicit shared_ptr(weak_ptr<Y> const& r)
            {
                if (r.expired())
                    throw bad_weak_ptr();

                m_pCount = r.m_pCount;
                m_p = r.m_p;
                if (m_pCount)
                    (*m_pCount)++;
                assert(get() == r.get() && use_count() == r.use_count());
            }

            template<class Y> explicit shared_ptr(auto_ptr<Y>& r)

            {
                m_pCount = new detail::shared_count_imp_default(1, 0);
                m_p = r.release();
                assert(use_count() == 1 && r.get() == 0);
            }

            // [2.2.3.2] destructor
            ~shared_ptr()
            {
                if (m_pCount)
                {
                    m_pCount->use_count--;
                    if (m_pCount->use_count == 0)
                    {
                        m_pCount->call_deleter((void*)m_p);

                        // has m_pCount being used by weak_ptrs?
                        if (m_pCount->weak_count == 0)
                          delete m_pCount; //delete if not
                    }

                }
            }

            // [2.2.3.3] assignment
            shared_ptr& operator=(shared_ptr const& r)
            {
                shared_ptr(r).swap(this);
                return *this;
            }

            template<class Y> shared_ptr& operator=(shared_ptr<Y> const& r)
            {
                shared_ptr(r).swap(this);
                return *this;
            }

            template<class Y> shared_ptr& operator=(auto_ptr<Y>& r)
            {
                shared_ptr(r).swap(this);
                return *this;
            }


            // [2.2.3.4] modifiers
            void swap(shared_ptr& r)
            {
                std::swap(m_p, r.m_p);
                std::swap(m_pCount, r.m_pCount);
            }

            void reset()
            {
                shared_ptr().swap(this);
            }

            template<class Y> void reset(Y * p)
            {
                shared_ptr(p).swap(this);
            }

            template<class Y, class D> void reset(Y * p, D d)
            {
                shared_ptr(p, d).swap(*this);
                return *this;
            }


            // [2.2.3.5] observers
            T* get() const
            {
                return m_p;
            }

            T& operator*() const
            {
                return *m_p;
            }

            T* operator->() const
            {
                return m_p;
            }

            long use_count() const
            {
                if (m_pCount)
                    return m_pCount->use_count;
                return 0;
            }

            bool unique() const
            {
                return use_count() == 0;
            }

            operator bool() const
            {
                return get() != 0;
            }

           template<class D, class T2> friend D * get_deleter(shared_ptr<T2> const& p);
        };

         // [2.2.3.10] shared_ptr get_deleter
            template<class D, class T2>  D * get_deleter(shared_ptr<T2> const& p)
            {
                if (!p.m_pCount)
                    return 0;

                return reinterpret_cast<D*>(p.m_pCount->get_deleter(typeid(D)));
            }

        // [2.2.3.6] shared_ptr comparisons
        template<class T, class U> bool operator==(shared_ptr<T> const& a, shared_ptr<U> const& b)
        {
            return a.get() == b.get();
        }

        template<class T, class U> bool operator!=(shared_ptr<T> const& a, shared_ptr<U> const& b)
        {
            return a.get() != b.get();
        }

        template<class T, class U> bool operator<(shared_ptr<T> const& a, shared_ptr<U> const& b)
        {
            return a.get() < b.get();
        }

        // [2.2.3.7] shared_ptr I/O
        template<class E, class T, class Y>
        basic_ostream<E, T>& operator<< (basic_ostream<E, T>& os, shared_ptr<Y> const& p)
        {
            return os << p.get();
        }

        // [2.2.3.8] shared_ptr specialized algorithms
        template<class T> void swap(shared_ptr<T>& a, shared_ptr<T>& b)
        {
            a.swap(b);
        }

        // [2.2.3.9] shared_ptr casts
        template<class T, class U> shared_ptr<T> static_pointer_cast(shared_ptr<U> const& r)
        {
            return shared_ptr<T>( static_cast<T*>(r.get()) );
        }

        template<class T, class U> shared_ptr<T> dynamic_pointer_cast(shared_ptr<U> const& r)
        {
            return shared_ptr<T>( dynamic_cast<T*>(r.get()) );
        }

        template<class T, class U> shared_ptr<T> const_pointer_cast(shared_ptr<U> const& r)
        {
            return shared_ptr<T>( const_cast<T*>(r.get()) );
        }


        template<class T> class enable_shared_from_this
        {
        protected:

            enable_shared_from_this()
            {
            }

            enable_shared_from_this(enable_shared_from_this const &)
            {
            }

            enable_shared_from_this & operator=(enable_shared_from_this const &)
            {
                return *this;
            }

            ~enable_shared_from_this()
            {
            }

        public:

            shared_ptr<T> shared_from_this()
            {
                shared_ptr<T> p(_internal_weak_this);
                assert(p.get() == this);
                return p;
            }

            shared_ptr<T const> shared_from_this() const
            {
                shared_ptr<T const> p(_internal_weak_this);
                assert(p.get() == this);
                return p;
            }

            mutable weak_ptr< T > _internal_weak_this;
        };

    } // namespace tra
} // namespace std


#endif

```
