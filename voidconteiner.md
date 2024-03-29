Testing vector unique_ptr x C++ 003 x C

```cpp

#include "stdafx.h"

#include <stdlib.h>

#include <vector>
#include <memory>
#include <time.h>

const size_t TOTAL = 1000;
//#define FRONT
//#define BACK
#define ALL

struct shape
{
    virtual void draw() = 0;
    virtual ~shape() {}
};

struct box : public shape
{
    int w;  int h;
    virtual void draw() override
    {
    }
};

void f03()
{
    for (size_t k = 0; k < TOTAL; k++)
    {
        std::vector<shape*> shapes;
        for (int i = 0; i < TOTAL; i++)
        {
            shapes.emplace_back(new box());
        }

#ifdef ALL
        for (size_t i = 0; i < shapes.size(); i++)
        {
            delete shapes[i];
        }
        shapes.clear();
#else
        while (!shapes.empty())
        {
#ifdef FRONT
            delete shapes.front();
            shapes.erase(shapes.begin());
#endif
#ifdef BACK
            delete shapes.back();
            shapes.erase(shapes.end() - 1);
#endif
        }
#endif    
    }
}

void f11()
{
    for (size_t k = 0; k < TOTAL; k++)
    {
        std::vector<std::unique_ptr<shape>> shapes;
        for (int i = 0; i < TOTAL; i++)
        {
            shapes.emplace_back(std::make_unique<box>());
        }

#ifdef ALL
        shapes.clear();
#else

        while (!shapes.empty())
        {
#ifdef FRONT
            shapes.erase(shapes.begin());
#endif
#ifdef BACK
            shapes.erase(shapes.end() - 1);
#endif
        }
#endif

    }
}


void destroy_shape(void* p)
{
    shape * ps = (shape*)p;
    delete ps;
}

struct vptrs
{
    void ** data;
    size_t size;
    size_t capacity;
};

#define INIT_VPTRS { 0,0,0 }


inline int vptrs_reserve(struct vptrs* p, size_t nelements)
{
    int r = 0;
    if (nelements > p->capacity)
    {
        void** pnew = p->data;
        pnew = (void**)realloc(pnew, nelements * sizeof(void*));
        if (pnew)
        {
            p->data = pnew;
            p->capacity = nelements;
        }
        else
        {
            /*sem memoria*/
            r = 1;
        }
    }
    return r;
}

int vptrs_grow(struct vptrs* p, size_t nelements)
{
    int r = 0;
    if (nelements > p->capacity)
    {
        size_t new_nelements = p->capacity + p->capacity / 2;
        if (new_nelements < nelements)
        {
            new_nelements = nelements;
        }
        r = vptrs_reserve(p, new_nelements);
    }
    return r;
}

inline int vptrs_emplace_back(struct vptrs* p, void* pdata)
{
    int r = vptrs_grow(p, p->size + 1);
    if (r == 0)
    {
        p->data[p->size] = pdata;
        p->size++;
    }
    return r;
}

void vptrs_destroy(struct vptrs* p,
    void(*destroy)(void*))
{
    for (size_t i = 0; i < p->size; i++)
    {
        destroy(p->data[i]);
    }
    free(p->data);
}

inline void* vptrs_remove_back(struct vptrs* p)
{    
    void* pdata = p->data[p->size - 1];
    p->size--;
    return pdata;
}

inline void* vptrs_remove_front(struct vptrs* p)
{
    void* pdata = p->data[0];
    
    memmove(p->data,
            p->data + 1,
            sizeof(void*) * (p->size - 1));

    p->size--;

    return pdata;
}


void fC()
{
    for (size_t k = 0; k < TOTAL; k++)
    {
        struct vptrs shapes = INIT_VPTRS;
        for (int i = 0; i < TOTAL; i++)
        {
            vptrs_emplace_back(&shapes, (void*)new box());
        }

#ifdef ALL
        vptrs_destroy(&shapes, &destroy_shape);
#else
        while (shapes.size > 0)
        {
#ifdef FRONT
            destroy_shape(vptrs_remove_front(&shapes));
#endif
#ifdef BACK
            destroy_shape(vptrs_remove_back(&shapes));
#endif
        }
#endif    
    }
}

void run_test(const char* message, void(*test)(void))
{
    time_t start = clock();
    test();
    printf("%s %d\n", message, (int)clock() - start);

}


int main(int argc, char* argv[])
{

#ifdef ALL
    printf("all\n\n");
#endif
#ifdef FRONT
    printf("front\n\n");
#endif
#ifdef BACK
    printf("back\n\n");
#endif

    //A ordem pode alterar os resultados

    run_test("C     :", &fC);
    run_test("C++ 03 :", &f03);
    run_test("C++ 11:", &f11);
    

    printf("\n");
    

    run_test("C     :", &fC);
    run_test("C++ 03 :", &f03);
    run_test("C++ 11:", &f11);
    

    return 0;
}


```


