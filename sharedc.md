
```cpp


#include <stdlib.h>
#include <Windows.h>

struct shared_object
{
    int counter;
};

struct shared_object* make_shared_object()
{
    struct shared_object* p1 = malloc(sizeof * p1);
    if (p1)
    {
        p1->counter = 1;
    }
    return p1;
}

struct shared_object* share(struct shared_object*p)
{
    InterlockedIncrement(&p->counter);
    return p;
};

int release(struct shared_object* p)
{
    int c = InterlockedDecrement(&p->counter);
    if (0 == c)
    {
        free(p);
    }
    return c;
};


int main()
{
    struct shared_object* p1 = make_shared_object();
    if (p1)
    {
        struct shared_object* p2 = NULL;
        
        p2 = share(p1);

        release(p2);
        release(p1);
    }

}

```

