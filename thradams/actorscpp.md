Actors using C++

```cpp
#include "stdafx.h"
#include <stdlib.h>
#include "ThreadPool.h"
#include <mutex>
#include <memory>
#include <iostream>



template<class T>
class Actor : public std::enable_shared_from_this<Actor<T>>
{    
    enum ACTOR_STATE
    {
        ACTOR_STATE_NONE,
        ACTOR_STATE_RUNNING,
        ACTOR_STATE_ONQUEUE
    };

    typedef std::function<void(T&)> Message;
    typedef  std::vector < Message > Messages;
    std::mutex m_mutex;
    Messages m_messages;
    ACTOR_STATE m_State;

    T m_object;

public:

    Messages GetMessages()
    {
        Messages messages;
        std::lock_guard<std::mutex> lock(m_mutex);

        if (m_messages.empty())
        {
            m_State = ACTOR_STATE_NONE;
        }
        else
        {
            m_State = ACTOR_STATE_RUNNING;
            messages.swap(m_messages);
        }
        return messages;
    }

    void ProcessMessages()
    {
        for (;;)
        {
            auto messages = GetMessages();

            if (messages.empty())
            {
                break;
            }

            for (auto & item : messages)
            {
                item(m_object);
            }
        }
    }

public:
    Actor() : m_State(ACTOR_STATE_NONE)
    {        
    }

    void Post(Message f)
    {
        std::lock_guard<std::mutex> lock(m_mutex);
        m_messages.push_back(f);

        switch (m_State)
        {
        case ACTOR_STATE_NONE:
        {
            m_State = ACTOR_STATE_ONQUEUE;
            std::weak_ptr<Actor> weak = shared_from_this();
            ThreadPool::RunAsync([weak, f]
            {
                std::shared_ptr<Actor> sp = weak.lock();
                if (sp.get())
                {
                    sp->ProcessMessages();
                }
            });
        }
        break;

        case ACTOR_STATE_ONQUEUE:
        case ACTOR_STATE_RUNNING:
            break;

        default:
            assert(false);
        }
    }

};

class MyObject  
{
public:
    
};


int _tmain(int argc, _TCHAR* argv[])
{
    ThreadPool pool(10);


    auto actor = std::make_shared<Actor<MyObject>>();
    
    actor->Post([](MyObject& obj)
    {     
        std::this_thread::sleep_for(std::chrono::seconds(2));
        std::cout << "1" << std::endl;
    });

    actor->Post([](MyObject&)
    {
        std::cout << "2" << std::endl;
    });


    pool.StopAndJoin();

    return 0;
}

```

Thread pool
```cpp
#pragma once
#ifndef THREAD_POOL_H
#define THREAD_POOL_H

#include <vector>
#include <queue>
#include <memory>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <future>
#include <functional>
#include <stdexcept>
#include <Windows.h>
#include <string>


class ThreadPool
{
    static ThreadPool* s_OutthreadPool;

public:
    ThreadPool(size_t);
    template<class F>
    void enqueue(F&& f);
    ~ThreadPool();
    void StopAndJoin();

    template<class T>
    static void RunAsync(T&& f)
    {
        assert(s_OutthreadPool);
        s_OutthreadPool->enqueue(std::forward<T>(f));
    }

private:


    std::vector< std::thread > m_workers;
    std::queue< std::function<void()> > m_tasks;

    std::mutex m_queue_mutex;
    std::condition_variable m_condition;
    bool m_stop;
};


inline ThreadPool::ThreadPool(size_t threads)
    : m_stop(false)
{
    s_OutthreadPool = this;

    for (size_t i = 0; i<threads; ++i)
        m_workers.emplace_back(
        [this, threads]
    {
        for (;;)
        {
            std::unique_lock<std::mutex> lock(this->m_queue_mutex);
            while (!this->m_stop && this->m_tasks.empty())
            {
                this->m_condition.wait(lock);
            }
            if (this->m_stop && this->m_tasks.empty())
            {
                return;
            }

            std::function<void()> task(this->m_tasks.front());
            this->m_tasks.pop();

            lock.unlock();

            task();
        }
    }
    );
}

template<class F>
void ThreadPool::enqueue(F&& f)
{
    {
        std::unique_lock<std::mutex> lock(m_queue_mutex);
        if (m_stop)
        {
            assert(false);
            return;
        }
        m_tasks.emplace(f);
    }

    m_condition.notify_one();
}

inline void ThreadPool::StopAndJoin()
{
    {
        std::unique_lock<std::mutex> lock(m_queue_mutex);

        if (m_stop)
        {
            return;
        }
        else
        {
            m_stop = true;
        }
    }

    m_condition.notify_all();
    for (size_t i = 0; i < m_workers.size(); ++i)
    {
        m_workers[i].join();
    }
}

inline ThreadPool::~ThreadPool()
{
    StopAndJoin();
}

#endif

```

```cpp
#include "stdafx.h"
#include "ThreadPool.h"

ThreadPool* ThreadPool::s_OutthreadPool = nullptr;
```

