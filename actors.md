

```cpp


#include "stdafx.h"
#include "async.h"
#include "tinycthread.h"
#include <assert.h>
#include <stdlib.h>
#include "actor.h"
#include <stdio.h>

struct A
{
    int i;
};
#define A_INIT { 0 }

struct B
{
    int i;
};
#define B_INIT { 0 }


struct A a = A_INIT;
struct actor actorA;

struct B b = B_INIT;
struct actor actorB;

void pong(struct actor* actor, void* data);

void ping(struct actor* actor, void* data)
{
    /*actor a est� recebendo a mensagem ping */
    struct actor * actorA = (struct actor *)actor;
    
    printf("ping\n");

    /*envia mensagem "pong" para actor B*/
    actor_post(&actorB, &pong, 0);
}

void pong(struct actor* actor, void* data)
{
    /*actor b est� recebendo a mensagem pong */
    struct actor * actorB = (struct actor *)actor;

    printf("pong\n");
    
    /*envia mensagem "ping" para actor A*/
    actor_post(&actorA, &ping, 0);
}


int _tmain(int argc, _TCHAR* argv[])
{
    async_pool_init();

    actor_init(&actorA);
    actorA.object = &a;

    actor_init(&actorB);
    actorB.object = &b;

    /*envia mensagem "ping" para actor A*/
    actor_post(&actorA, &ping, 0);
    
    async_pool_join();

    return 0;
}


```

actor.h
```cpp
#pragma once
#include "tinycthread.h"

enum ACTOR_STATE
{
    ACTOR_STATE_NONE,
    ACTOR_STATE_RUNNING,
    ACTOR_STATE_ONQUEUE
};

typedef void(*actor_callback)(struct actor* actor, void*);
struct actor_closure
{
    actor_callback callback;
    void*    callback_data;
};

struct actor
{
    ACTOR_STATE state;
    mtx_t s_queue_mutex;

    struct actor_closure* current_tasks;
    int tasks_size;
    int taks_max_size;

    void* object;
};


int  actor_init(struct actor* actor);
void actor_destroy(struct actor* actor);

int actor_post(struct actor* actor,
               actor_callback callback,
               void* callback_data);

```

actor.cpp
```cpp
#include "actor.h"


#include <stdlib.h>
#include "async.h"
#include <assert.h>

int actor_init(struct actor* actor)
{
    actor->state = ACTOR_STATE_NONE;
    actor->tasks_size = 0;
    actor->taks_max_size = 100;
    actor->current_tasks = 0;
    int r = mtx_init(&actor->s_queue_mutex, mtx_plain);
    return r;
}

void actor_destroy(struct actor* actor)
{
    mtx_destroy(&actor->s_queue_mutex);
}

static int actor_get_messages(actor* actor, struct actor_closure** current_tasks)
{
    *current_tasks = 0;
    int tasks = 0;
    mtx_lock(&actor->s_queue_mutex);
    tasks = actor->tasks_size;

    if (tasks != 0)
    {
        actor->state = ACTOR_STATE_RUNNING;
        *current_tasks = actor->current_tasks;
        actor->current_tasks = 0;
        actor->tasks_size = 0;
    }
    else
    {
        actor->state = ACTOR_STATE_NONE;
    }

    mtx_unlock(&actor->s_queue_mutex);
    return tasks;
}


static void actor_process_messages(int, void* p)
{
    struct actor* a = (struct actor*)(p);

    for (;;)
    {
        struct actor_closure* current_tasks;
        int tasks = actor_get_messages(a, &current_tasks);

        if (tasks == 0)
        {
            break;
        }

        for (int i = tasks - 1; i >= 0; i--)
        {
            current_tasks[i].callback(a, 0);
        }
    }
}

int actor_post(actor* actor,
               actor_callback callback,
               void* callback_data)
{
    int result = 0;
    mtx_lock(&actor->s_queue_mutex);

    if (actor->current_tasks == 0)
    {
        actor->current_tasks =
            (actor_closure*) malloc(sizeof(actor_closure) * actor->taks_max_size);

        if (actor->current_tasks == 0)
        {
            //out of memory
            result = 1;
        }
    }

    if (result == 0)
    {
        actor->current_tasks[actor->tasks_size].callback = callback;
        actor->current_tasks[actor->tasks_size].callback_data = callback_data;
        actor->tasks_size++;

        switch (actor->state)
        {
        case ACTOR_STATE_NONE:
            actor->state = ACTOR_STATE_ONQUEUE;
            async_pool_run(&actor_process_messages, actor);
            break;

        case ACTOR_STATE_ONQUEUE:
        case ACTOR_STATE_RUNNING:
            break;

        default:
            assert(false);
        }
    }
    else
    {
    }

    mtx_unlock(&actor->s_queue_mutex);
    return result;
}
```

async.h
```cpp
#pragma once


typedef void(*execute_task)(int, void*);

int async_pool_init();

int async_pool_run(execute_task exectask,void* arg);

void async_pool_join();

```


async.cpp
```cpp
#include "async.h"


#include "stdafx.h"
#include "async.h"
#include "tinycthread.h"
#include <assert.h>

#define POOL_SIZE 2
#define MAX_TASKS 100

struct task
{
    execute_task exectask;
    void*        arg;
};

static void task_init(struct task* task,
    execute_task exectask,
    void* arg)
{
    task->arg = arg;
    task->exectask = exectask;
}



struct task_queue
{
    struct task  buffer[MAX_TASKS];
    size_t       count;
    struct task* head;
    struct task* tail;
};

static mtx_t             s_queue_mutex;
static thrd_t            s_threads[POOL_SIZE];
static BOOL              s_stop = FALSE;
static cnd_t             s_condition;
static struct task_queue s_queue;

static void task_queue_init(struct task_queue *q)
{
    q->count = 0;
    q->head = q->buffer;
    q->tail = q->buffer;
}

static int task_queue_push(struct task_queue * q,
    execute_task exectask,
    void* arg)
{
    int result = 1;
    if (q->count < MAX_TASKS)
    {
        task_init(q->head,
            exectask,
            arg);

        q->head++;

        if (q->head == (q->buffer + MAX_TASKS))
        {
            q->head = q->buffer;
        }
        q->count++;
        result = 0;
    }

    return 1;
}

static struct task* task_queue_pop(struct task_queue *q)
{
    struct task* task = NULL;
    if (q->count >= 0)
    {
        task = q->tail;
        q->tail++;
        if (q->tail == (q->buffer + MAX_TASKS))
        {
            q->tail = q->buffer;
        }
        q->count--;
    }
    return task;
}

static void task_queue_clear(struct task_queue *q)
{
    while (s_queue.count > 0)
    {
        struct task *p = task_queue_pop(q);
        p->exectask(0, p->arg);
    }
}

int main_loop(void* pData)
{
    for (;;)
    {
        mtx_lock(&s_queue_mutex);

        while (!s_stop &&
            s_queue.count == 0)
        {
            cnd_wait(&s_condition, &s_queue_mutex);
        }

        if (s_stop &&
            s_queue.count == 0)
        {
            mtx_unlock(&s_queue_mutex);
            break;
        }
        else
        {
            struct task *p = task_queue_pop(&s_queue);
            mtx_unlock(&s_queue_mutex);
            (*p->exectask)(1, p->arg);          
        }
    }
    return 0;
}

int async_pool_init()
{
    task_queue_init(&s_queue);

    int r = mtx_init(&s_queue_mutex, mtx_plain);
    if (r == thrd_success)
    {
        r = cnd_init(&s_condition);
        if (r == thrd_success)
        {
            for (int i = 0; i < POOL_SIZE; i++)
            {
                r = thrd_create(&s_threads[i], &main_loop, 0);
                if (r != thrd_success)
                {
                    break;
                }
            }
        }
    }
    return r == thrd_success ? 0 : 1;
}

int async_pool_run(execute_task exectask,
    void* arg)
{
    int result = 0;
    mtx_lock(&s_queue_mutex);

    result = task_queue_push(&s_queue, exectask, arg);

    mtx_unlock(&s_queue_mutex);

    if (result == 0)
    {
        cnd_broadcast(&s_condition);
    }

    return result;
}

void async_pool_join()
{
    BOOL wasstoped = FALSE;
    mtx_lock(&s_queue_mutex);
    wasstoped = s_stop;
    s_stop = TRUE;
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
        assert(r == thrd_success);
    }

    mtx_lock(&s_queue_mutex);
    task_queue_clear(&s_queue);
    mtx_unlock(&s_queue_mutex);
}


```


tinycthread.h e tinycthread.cpp from
https://github.com/tinycthread/tinycthread

