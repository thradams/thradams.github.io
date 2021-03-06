## Polymorphism in C style


```cpp
#include <stdlib.h>

//Public handles
typedef struct THShape {} * HShape;
typedef struct THBox {} * HBox;
typedef struct THCircle {} * HCircle;

//--------------------------------------------------
// Implementation

//Private vtable for TShape
struct TShapeVTable
{
  void (*Print)(void*);
  void (*Delete)(void*);  
};

//Has the vtable pointer
struct TShape
{
  TShapeVTable *pvtable;
};

//Private
struct TBox
{
  TShape base;
  /////////
  int i;
};

//Private
struct TCircle
{
  TShape base;
  /////////
  double d;
};

//Private: Print implementation of Box
void Print_Box(void* p)
{
    TBox *pthis = (TBox*)p;
    printf("Box %d\n", pthis->i);
}

//Private: Delete implementation of Box
void Delete_Box(void* p)
{
}

//Only one
TShapeVTable s_TShapeBox = { &Print_Box , &Delete_Box};


//Public
HBox CreateBox()
{
  TBox* pBox = (TBox*) malloc(sizeof(TBox));
  pBox->i = 1;
  pBox->base.pvtable = &s_TShapeBox;
  return (HBox)pBox;
}

//Private
void Print_Circle(void* p)
{
    TCircle *pthis = (TCircle*)p;
    printf("Circle %g\n", pthis->d);
}

//Private
void Delete_Circle(void* p)
{
}

//Only one
TShapeVTable s_TShapeCircle = { &Print_Circle ,  &Delete_Circle};

//Public
void Delete(HShape h)
{    
    if (h)
    {
        //h points to TBox or TCircle
        //TBox and TCircle can be used as TShape
        TShape *pShape = (TShape*)h;
        (pShape->pvtable->Delete)(h);    

        free((TShape*)h);
    }
}
//Public
HCircle CreateCircle()
{
  TCircle* pCircle = (TCircle*) malloc(sizeof(TCircle));
  pCircle->d = 2.1;
  pCircle->base.pvtable = &s_TShapeCircle;
  return (HCircle)pCircle;
}

//Public
void Print(HShape h)
{
    //h points to TBox or TCircle
    //TBox and TCircle can be used as TShape
    TShape *pShape = (TShape*)h;
    (pShape->pvtable->Print)(h);    
}

//Test
int main()
{
    HShape h = (HShape)CreateBox();
    Print(h);
    Delete(h);

    h = (HShape)CreateCircle();
    Print(h);
    Delete(h);
}
```

Using C++ to compile, a "hidrid" style could be:

```cpp
typedef struct THShape {} * HShape;
typedef struct THBox : public THShape {} * HBox;
typedef struct THCircle : public THShape {} * HCircle;
```


