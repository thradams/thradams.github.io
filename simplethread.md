##SimpleThread class

SimpleThread class for windows.
See also:
boost::thread and thread class in C++0x

```cpp

// Copyright (C) 2009, Thiago Adams (thiago.adams@gmail.com)
// http://www.thradams.com/codeblog/simplethread.htm
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.
//
namespace Detail
{
  template<class F>
  class SimpleThreadData0
  {
    F m_f;

  public:
    SimpleThreadData0(const F& f) : m_f(f) { }
    void Run() { m_f(); }
  };

  template<class F, class A1>
  class SimpleThreadData1
  {
    F m_f;
    A1 m_a1;

  public:
    SimpleThreadData1(const F& f, const A1& a1) : m_f(f), m_a1(a1) { }
    void Run() { m_f(m_a1); }
  };
} //namespace Detail

class SimpleThread
{
  HANDLE m_hThread;

  template<class T>
  static DWORD WINAPI ThreadProc(LPVOID lpParameter)
  {
    DWORD r = 0;
    T *p = reinterpret_cast<T*>(lpParameter);
    try
    {
      p->Run();
    }
    catch (...)
    {
      r = 1;
    }
    delete p;
    return r;
  }

  template<class T>
  static HANDLE StartThread(T* p)
  {
    HANDLE hThread = CreateThread(NULL,         // default security attributes
      0,                 // use default stack size
      &ThreadProc<T>,    // thread function
      p,                 // argument to thread function
      0,                 // use default creation flags
      0);                // returns the thread identifier
    if (hThread == 0)
    {
      DWORD dwError = GetLastError();
      delete p;
      throw std::exception("SimpleThread creation failed");
    }
    //release will be made in the other thread.
    return hThread;
  }

public:
  template <class F>
  SimpleThread(const F& f) : m_hThread(NULL)
  {
    m_hThread = StartThread(new Detail::SimpleThreadData0<F>(f));
  }

  template <class F, class A1>
  SimpleThread(const F& f, const A1& a1) : m_hThread(NULL)
  {
    m_hThread = StartThread(new Detail::SimpleThreadData1<F, A1>(f, a1));
  }

  ~SimpleThread()
  {
    Join();
  }

  void Join()
  {
    ::WaitForSingleObject(m_hThread, INFINITE);
    CloseHandle(m_hThread);
    m_hThread = 0;
  }    
};
}}}

Sample
{{{cpp
void f(const std::string& }
{
}

int main()
{
  SimpleThread thread3(&f, std::string("test"));
}
Member functions

class X
{
  std::auto_ptr<SimpleThread> m_pThread;

public:
  X() : m_pThread(nullptr)
  {
  }
  
  void Start()
  {
    m_pThread.reset(new SimpleThread(std::tr1::bind(&X::ThreadProc, this)));
  }

  void ThreadProc()
  {
    cout << "hi!";
  }
};
}}}

Version 2 - Requires tr1::bind avaiable in VC++ 2008

{{{cpp
// Copyright (C) 2009, Thiago Adams (thiago.adams@gmail.com)
// http://www.thradams.com/codeblog/simplethread.htm
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.
//

class SimpleThread
{
  HANDLE m_hThread;

  template<class F>
  struct SimpleThreadData0
  {
    F m_f;
    SimpleThreadData0(const F& f) : m_f(f) { }
  };

  template<class T>
  static DWORD WINAPI ThreadProc(LPVOID lpParameter)
  {
    DWORD r = 0;
    T *p = reinterpret_cast<T*>(lpParameter);
    try
    {
      p->m_f();
    }
    catch (...)
    {
      r = 1;
    }
    delete p;
    return r;
  }

  template <class F>
  HANDLE SimpleThreadInit(const F& f)
  {
    std::auto_ptr<SimpleThreadData0<F> > sp(new SimpleThreadData0<F>(f));

    HANDLE hThread = CreateThread(NULL,         // default security attributes
      0,                 // use default stack size
      &ThreadProc<SimpleThreadData0<F> >,    // thread function
      sp.get(),                 // argument to thread function
      0,                 // use default creation flags
      0);                // returns the thread identifier
    if (hThread == 0)
    {
      DWORD dwError = GetLastError();
      throw std::exception("SimpleThread creation failed");
    }

    sp.release();
    return hThread;

  }

public:
  template <class F>
  SimpleThread(const F& f) : m_hThread(NULL)
  {
    m_hThread = SimpleThreadInit(f);
  }    

  template <class F, class A1>
  SimpleThread(const F& f, const A1& a1) : m_hThread(NULL)
  {
    m_hThread = SimpleThreadInit(std::tr1::bind(f, a1));
  }

  template <class F, class A1, class A2>
  SimpleThread(const F& f, const A1& a1, const A2& a2) : m_hThread(NULL)
  {
    m_hThread = SimpleThreadInit(std::tr1::bind(f, a1, a2));
  }

  ~SimpleThread()
  {
    Join();
  }

  void Join()
  {
    ::WaitForSingleObject(m_hThread, INFINITE);
    CloseHandle(m_hThread);
    m_hThread = 0;
  }
};
```

Sample2

```cpp

class X
{
  std::auto_ptr<SimpleThread> m_pThread;

public:
  X() : m_pThread(nullptr)
  {
  }
  
  void Start()
  {
     //no need for manual bind here
     m_pThread.reset(new SimpleThread(&X::ThreadProc, this, "start"));
  }

  void ThreadProc(const std::string& s)
  {
    std::cout << "hi!" << s;
  }
};

```

