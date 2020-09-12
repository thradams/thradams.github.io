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

//#include <stdlib.h>
//#include <string.h>

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

struct Person {
  char* auto name;
};

int main()
{
  //#include <stdlib.h>
   if (struct Person* auto p = new (struct Person); p)
   {

     destroy(p);
   }
}
`;

sample["If with initializer and defer"] =
`

struct Person {
  char* auto name;
};

int main()
{
   if (struct Person* auto p = new (struct Person); p; destroy(p))
   {
     /*at this moment break, return or goto will not call defer*/
   }
}
`;

sample["Polimorphism"] =
    `

  struct Box {
      int id = 1;
  };
  
  void draw(struct Box* pBox) overload {
      printf("Box");
  }
  
  struct Circle {
      int id = 2;
  };
  
  void draw(struct Circle* pCircle) overload
  {
      printf("Circle");
  }
  
  struct <Box | Circle> Shape;
  
  int main()
  {
      struct Shape * auto pShape = new (struct Box);
      draw(pShape);
      destroy(pShape);
  }
  
  
`;


sample["Lambdas"] =
    `
void Run(void (*callback)(void*), void* data);

int main()
{  
  Run([](void* data){
  
    printf("first");
    Run([](void* data){
      printf("second");
    }, 0);     
  }, 0);
}
`;

