
threadpool.h

```cpp


#pragma once
typedef void(*task_func)(void*);

int async_pool_init();
void async_pool_run(task_func f, void* arg);
void async_pool_reset();

```

threadpool.c

```cpp
#include "stdafx.h"
#include "threadpool.h"
#include "tinythread.h"
#include <assert.h>

#define POOL_SIZE 2

struct Task
{
  void* arg;
  task_func f;
};

static mtx_t  s_queue_mutex;
static thrd_t s_threads[POOL_SIZE];
static bool   s_stop = false;
static cnd_t  s_condition;
static size_t s_taskssize = 0;
static Task   s_tasks[100];

int tfunc(void*)
{
  for (;;)
  {
    mtx_lock(&s_queue_mutex);
    while (!s_stop && s_taskssize == 0)
    {
      cnd_wait(&s_condition, &s_queue_mutex);
    }
    if (s_stop && s_taskssize == 0)
    {
      mtx_unlock(&s_queue_mutex);
      break;
    }
    else
    {
      Task *p = &s_tasks[s_taskssize - 1];
      s_taskssize--;
      mtx_unlock(&s_queue_mutex);
      (*p->f)(p->arg);
    }    
  }
  return 0;
}

int async_pool_init()
{
  int r = mtx_init(&s_queue_mutex, mtx_plain);
  if (r == thrd_success)
  {
    r = cnd_init(&s_condition);
    if (r == thrd_success)
    {
      for (int i = 0; i < POOL_SIZE; i++)
      {
        r = thrd_create(&s_threads[i], &tfunc, 0);
        if (r == thrd_success)
        {
        }
      }
    }
  }
  return thrd_success;
}

void async_pool_run(task_func f, void* arg)
{
  mtx_lock(&s_queue_mutex);
  s_tasks[s_taskssize].arg = arg;
  s_tasks[s_taskssize].f = f;
  s_taskssize++;
  mtx_unlock(&s_queue_mutex);
  cnd_broadcast(&s_condition);
}

void async_pool_reset()
{
  bool wasstoped = false;
  mtx_lock(&s_queue_mutex);
  wasstoped = s_stop;
  s_stop = true;
  mtx_unlock(&s_queue_mutex);

  if (wasstoped)
  {
    return;
  }

  cnd_broadcast(&s_condition);

  for (size_t i = 0; i < POOL_SIZE; ++i)
  {
    int res;
    int r = thrd_join(s_threads[i], &res);
    if (r == thrd_success)
    {
    }
  }

}

```

