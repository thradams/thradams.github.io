var sample = {};


sample["Default Initialization"] =
`

struct Point {
  int x = 1;
  int y = 2;
};

struct Line {
  struct Point start;
  struct Point end;
};

struct Point global = {};

int main()
{
  struct Point pt = {};
  struct Line ln = {};
}

`;


sample["Destructor"] =
`
#include <stdlib.h>
#include <stdio.h>

struct Person {
  char* auto name;
};

void destroy(struct Person* p) overload {
    /*
      this is a user defined function to receive an event
      just before the object destruction.
      This function is called indirectly by the destroy.
    */
    printf("person destructor called");
}

struct House {
   struct Person person;
};

int main()
{
   struct House house = {};

   destroy(house);
}
`;


sample["new operator"] =
`
/*
   New operator allocates the memory using malloc and initializes the
   object using the compound literal.

   There is no constructor. Apart of malloc it never fails. 
   (no need for exceptions)
   
*/

#include <stdlib.h>

struct Point {
  int x = 1;
  int y = 2;
};

int main()
{

   struct Point * auto p1 = new (struct Point);
   destroy(p1);

   struct Point * auto p2 = new (struct Point) {};
   destroy(p2);
   
   struct Point * auto p3 = new (struct Point) {.x = 3, .y = 4};
   destroy(p3);
}

`;

sample["If with initializer"] =
`
#include <stdlib.h>

struct Person {
  char* auto name;
};

int main()
{
   if (struct Person* auto p = new (struct Person); p)
   {
     destroy(p);
   }
}
`;

sample["If with initializer and defer"] =
`
#include <stdlib.h>

struct Person {
  char* auto name;
};

int main()
{
   if (struct Person* auto p = new (struct Person); p; destroy(p))
   {
     
   }
}
`;


sample["If defer and jumps"] =
`

#include <stdlib.h>

int main()
{
   if (void* p0 = malloc(1) ; p0; free(p0))
   {
     for (;;)
     {
       if (void* p1 = malloc(1) ; p1; free(p1))
       {     
         if (void* p2 = malloc(1) ; p2; free(p2))
         {
           break;
         }       
         while (1)
         {
           break;
         }
         return 1;
       }
     }
   }
}
`;

sample["If+defer and return"] =
`
/*
 *  This sample shows why we need a temporary copy before return
 */

#include <stdlib.h>

inline void* move(void** p) {
  void* t = *p;
  *p = 0;
  return t;
}

void * F() {
  if (void* p = malloc(1); p; free(p)) 
  {
    if (void* p2 = malloc(2); p2; free(p2)) 
    {
      return move(&p2); /*p2 is moved and not destroyed anymore*/
    }
  }
}
`
sample["If + defer"] =
`
#include  <stdlib.h>

struct allocator {
    int dummy;
};

void* allocator_alloc(struct allocator* allocator, int bytes) {
    return malloc(bytes);
}

void* allocator_free(struct allocator* allocator, void* p) {
    free(p);
}

void* allocator_destroy(struct allocator* allocator){
}

int main() {
    struct allocator allocator = { 0 };

    if (void* p = allocator_alloc(&allocator, 1);
        p;
        allocator_free(&allocator, p)
        ) 
    {        
    }
    allocator_destroy(&allocator);
}
`


sample["Polimorphism"] =
`

#include <stdio.h>
#include <stdlib.h>


struct Box {
    int id = 1;
};

void destroy(struct Box* pBox) overload {
      printf("dtor Box");
}

void draw(struct Box* pBox) overload {
    printf("draw Box\\n");
}

struct Circle {
    int id = 2;
};

void draw(struct Circle* pCircle) overload
{
    printf("draw Circle\\n");
}

struct <Box | Circle> Shape;

int main()
{
    struct Shape * auto pShape = new (struct Box);
    draw(pShape);
    destroy(pShape);
}

`;


sample["Polimorphism 2"] =
`
#include <stdio.h>
#include <stdlib.h>

struct Box {
  int id = 1;
};

void draw(struct Box* pBox) overload {
  printf("Box");
}

void box_serialize(struct Box* pBox) {
  printf("Box");
}

struct Circle {
  int id = 2;
};

void draw(struct Circle* pCircle) overload
{
  printf("Circle");
}

void circle_serialize(struct Circle* pBox) {
  printf("Box");
}

struct Data {
  int id = 3;
};

void data_serialize(struct Data* pData)
{
  printf("Data");
}


struct <Box | Circle> Shape;


void serialize(struct Circle* pCircle) overload {
  circle_serialize(pCircle);
}

void serialize(struct Box* pCircle) overload {
  box_serialize(pCircle);
}

void serialize(struct Data* pData) overload {
  data_serialize(pData);
}

struct <Shape | Data> Serializable;


int main()
{
  struct Serializable* auto pSerializable = new (struct Box);
  serialize(pSerializable);
  destroy(pSerializable);
}

`;


sample["Lambdas"] =
`
#include <stdio.h>

void Run(void (*callback)(void*), void* data) {
  callback(data);
}

int main()
{  
  Run([](void* data){
    printf("first\\n");
    Run([](void* data){
      printf("second\\n");
    }, 0);     
  }, 0);
}
`;

