var sample = {};


sample["Default Initialization"] =
`

struct Point {
  int x = 1;
  int y = 2;
};

struct Line {
  struct Point start;
  struct Point start;
};

int main()
{
  struct Point pt = {};
  struct Line ln = {};
}

`;



sample["If with initializer"] =
`

struct Person {
  char* auto name;
};

int main()
{
   if (struct Person* auto p = new  ((struct Person){}); p)
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
   if (struct Person* auto p = new  ((struct Person){}); p; destroy(p))
   {

     
   }
}
`;

sample["Destructor"] =
`

struct Person {
  char* auto name;
};

void destroy(struct Person* p) overload {
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

int main()
{
    struct <Box | Circle> * auto pShape = new ((struct Box){});
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

