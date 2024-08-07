
## Timer events

Caracteristics:

* Timer is running and called from a "Timer Thread"
* Insertion uses std::sort
* Uses only C++ 11 libraries

```cpp


//header
#include <thread>
#include <mutex>
#include <condition_variable>
#include <vector>
#include <chrono>
#include <memory>
#include <algorithm>

template<class T>
class TimerThread
{

public:
  typedef std::chrono::high_resolution_clock clock_t;
  struct TimerInfo
  {
    size_t m_id;
    clock_t::time_point m_TimePoint;
    T m_User;

    template<class TArg1>
    TimerInfo(clock_t::time_point tp,
              size_t id,
              TArg1 && arg1)
      : m_TimePoint(tp)
      , m_id(id)
      , m_User(std::forward<TArg1>(arg1))
    {
    }

    TimerInfo(TimerInfo && other)
      : m_TimePoint(other.m_TimePoint)
      , m_id(other.m_id)
      , m_User(std::move(other.m_User))
    {
    }
  };
private:
  std::unique_ptr<std::thread> m_Thread;
  std::vector<TimerInfo>       m_Timers;
  std::mutex                   m_Mutex;
  std::condition_variable      m_Condition;
  bool                         m_Sort;
  bool                         m_Stop;

  void TimerLoop()
  {
    for (;;)
    {
      std::unique_lock<std::mutex>  lock(m_Mutex);

      while (!m_Stop && m_Timers.empty())
      {
        m_Condition.wait(lock);
      }

      if (m_Stop)
      {
        return;
      }

      if (m_Sort)
      {
        //Sort could be done at insert
        //but probabily this thread has time to do
        std::sort(m_Timers.begin(),
                  m_Timers.end(),
                  [](const TimerInfo & ti1, const TimerInfo & ti2)
        {
          return ti1.m_TimePoint > ti2.m_TimePoint;
        });
        m_Sort = false;
      }

      auto now = clock_t::now();
      auto expire = m_Timers.back().m_TimePoint;
      bool callTimer = expire < now;

      if (!callTimer) //can I take a nap?
      {
        auto napTime = expire - now;
        m_Condition.wait_for(lock, napTime);

        if (!m_Timers.empty())
        {
          //check again
          auto expire = m_Timers.back().m_TimePoint;
          auto now = clock_t::now();
          callTimer = expire < now;
        }
      }

      if (callTimer)
      {
        TimerInfo timeInfo(std::move(m_Timers.back()));
        m_Timers.pop_back();
        lock.unlock();
        TimerCall(timeInfo);
      }
    }
  }

public:
  TimerThread()
    : m_Stop(false)
    , m_Sort(false)
  {
    m_Thread.reset(new std::thread(std::bind(&TimerThread::TimerLoop, this)));
  }

  ~TimerThread()
  {
    m_Stop = true;
    m_Condition.notify_all();
    m_Thread->join();
  }

  template<class TArg1>
  void CreateTimer(size_t id, int ms, TArg1 && arg1)
  {
    {
      std::unique_lock<std::mutex> lock(m_Mutex);
      m_Timers.push_back(TimerInfo(clock_t::now() + std::chrono::milliseconds(ms),
                                   id,
                                   std::forward<TArg1>(arg1)));
      m_Sort = true;
    }
    // wake up
    m_Condition.notify_one();
  }

  void CancelTimer(size_t id)
  {
    {
      std::unique_lock<std::mutex> lock(m_Mutex);

      for (auto it = m_Timers.begin(); it != m_Timers.end(); it++)
      {
        if (it->m_id == id)
        {
          m_Timers.erase(it);
          break;
        }
      }
    }
    // wake up
    m_Condition.notify_one();
  }
};


//sample
#include <iostream>
#include <string>

TimerThread<std::string> timers;

void TimerCall(TimerThread<std::string>::TimerInfo& info)
{
  std::cout << info.m_User << std::endl;
  timers.CancelTimer(2);
}

int main()
{
  std::cout << "start" << std::endl;

  timers.CreateTimer(1, 2000, "first");
  timers.CreateTimer(2, 3000, "second");

  std::this_thread::sleep_for(std::chrono::seconds(5));
  std::cout << "end" << std::endl;
}


```

