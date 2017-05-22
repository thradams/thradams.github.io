
```cpp
#include <stdio.h>
#include <stdlib.h>


typedef struct Box {
  int BoxId;
  int w, h;
} Box;

typedef struct Circle {
  int CircleId;
  int r;
} Circle;

typedef union Shape {
  
  int ShapeId;
  Box;
  Circle;

} Shape;


void Circle_Print(Circle* pCircle)
{
  printf("r = %d\n", pCircle->r);
}

int main(int argc, char** argv)
{
  Box* pBox = malloc(sizeof(Box));
  *pBox = (Box) { .BoxId = 1, .w = 1, .h = 2 };

  Circle* pCircle = malloc(sizeof(Box));
  *pCircle = (Circle) { .CircleId = 2, .r = 3 };

  Shape* p[2] = { (Shape*)pBox, (Shape*)pCircle };

  for (int i = 0; i < 2; i++) {
    switch (p[i]->ShapeId) {
    case 1:
      printf("w = %d, h = %d\n", p[i]->w, p[i]->h);
      break;
    case 2:
      Circle_Print((Circle*)p[i]);
      printf("r = %d\n", p[i]->r);
      break;
    }
  }

  return 0;
}
```
