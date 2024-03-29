
Performance test

```cpp
#include "stdafx.h"
#include <typeinfo>
#include <cassert>
#include <vector>
#include <memory>
#include <iostream>
#include "Stopwatch.h"

int boxCount = 0;
int circleCount = 0;
int ellipseCount = 0;

void ClearCount()
{
  boxCount = 0;
  circleCount = 0;
  ellipseCount = 0;
}

void PrintCount()
{
  std::cout << "box count = " << boxCount << std::endl;
  std::cout << "circle count = " << circleCount << std::endl;
  std::cout << "ellipse count = " << ellipseCount << std::endl;
  std::cout << "------------------------------------" << std::endl;
  std::cout << std::endl;
}

struct TBox;
struct TCircle;
struct TEllipse;

struct ShapeVisitor
{
  virtual void Visit(TBox&) = 0;
  virtual void Visit(TCircle&) = 0;
  virtual void Visit(TEllipse&) = 0;
};


struct Shape
{
  virtual ~Shape() {};
  virtual void Accept(ShapeVisitor&) = 0;
  virtual void VirtualDraw() = 0;
};

struct TBox : public Shape
{
  int m_boxint;
  TBox()
  {
    m_boxint = 1;
  }

  virtual  void Accept(ShapeVisitor& shapeVisitor) override
  {
    shapeVisitor.Visit(*this);
  }
  virtual void VirtualDraw() override
  {
    boxCount++;
  }
};

struct TCircle : public Shape
{
  int m_circleint;
  TCircle()
  {
    m_circleint = 1;
  }

  virtual  void Accept(ShapeVisitor& shapeVisitor) override
  {
    shapeVisitor.Visit(*this);
  }
  virtual void VirtualDraw() override
  {
    circleCount++;
  }
};

struct TEllipse : public Shape
{
  int m_ellipseint;
  TEllipse()
  {
    m_ellipseint = 1;
  }

  virtual void Accept(ShapeVisitor& shapeVisitor) override
  {
    shapeVisitor.Visit(*this);
  }

  virtual void VirtualDraw() override
  {
    ellipseCount++;
  }
};


void Draw(TBox& box)
{
  boxCount += box.m_boxint;
}

void Draw(TCircle& circle)
{
  circleCount += circle.m_circleint;
}

void Draw(TEllipse& ellipse)
{
  ellipseCount += ellipse.m_ellipseint;
}

struct DrawVisitor : public ShapeVisitor
{
  virtual void Visit(TBox& obj) override
  {
    Draw(obj);
  }
  virtual void Visit(TCircle& obj) override
  {
    Draw(obj);
  }
  virtual void Visit(TEllipse& obj) override
  {
    Draw(obj);
  }
};

void DrawTypeId(Shape& shape)
{
  if (typeid(shape) == typeid(TBox))
  {
    Draw(dynamic_cast<TBox&>(shape));
  }
  else if (typeid(shape) == typeid(TCircle))
  {
    Draw(dynamic_cast<TCircle&>(shape));
  }
  else if (typeid(shape) == typeid(TEllipse))
  {
    Draw(dynamic_cast<TEllipse&>(shape));
  }
  else
  {
    assert(false);
  }
}

void DrawDynamicCast(Shape& shape)
{
  if (auto p = dynamic_cast<TBox*>(&shape))
  {
    Draw(*p);
  }
  else if (auto p = dynamic_cast<TCircle*>(&shape))
  {
    Draw(*p);
  }
  else if (auto p = dynamic_cast<TEllipse*>(&shape))
  {
    Draw(*p);
  }
  else
  {
    assert(false);
  }
}

void CreateShapes(std::vector<std::unique_ptr<Shape>>& shapes)
{
  for (int i = 0; i < 1000; i++)
  {
    if (i % 2 == 0)
    {
      shapes.emplace_back(std::unique_ptr<TBox>(new TBox));
    }
    else if (i % 3 == 0)
    {
      shapes.emplace_back(std::unique_ptr<TCircle>(new TCircle));
    }
    else if (i % 5 == 0)
    {
      shapes.emplace_back(std::unique_ptr<TEllipse>(new TEllipse));
    }
  }

}

int main()
{
  std::vector<std::unique_ptr<Shape>> shapes;

  CreateShapes(shapes);
  ClearCount();

  Stopwatch sw(true);

  for (size_t i = 0; i < shapes.size(); i++)
  {
    DrawTypeId(*shapes[i].get());
  }




  sw.Stop();
  std::cout << "Using typeid + dynamic_cast" << std::endl;
  std::cout <<  sw << std::endl;
  PrintCount();

  /////////////////
  ClearCount();
  sw.Start();

  for (size_t i = 0; i < shapes.size(); i++)
  {
    shapes[i]->VirtualDraw();
  }

  sw.Stop();
  std::cout << "Using virtual function" << std::endl;
  std::cout <<  sw << std::endl;
  PrintCount();
  //////////////////////

  /////////////////
  ClearCount();
  sw.Start();

  for (size_t i = 0; i < shapes.size(); i++)
  {
    DrawDynamicCast(*shapes[i].get());
  }

  sw.Stop();
  std::cout << "Using dynamic_cast" << std::endl;
  std::cout <<  sw << std::endl;
  PrintCount();
  //////////////////////
  ClearCount();

  DrawVisitor drawVisitor;
  sw.Start();

  for (size_t i = 0; i < shapes.size(); i++)
  {
    shapes[i]->Accept(drawVisitor);
  }

  sw.Stop();

  std::cout << "Using visitor pattern" << std::endl;
  std::cout <<  sw << std::endl;

  PrintCount();

  return 0;
}


```


Results - Visual  C++ 2012

```
Using typeid + dynamic_cast
397 ticks, 0 ms
box count = 500
circle count = 167
ellipse count = 67
------------------------------------

Using virtual function
90555 ticks, 35 ms
box count = 500
circle count = 167
ellipse count = 67
------------------------------------

Using dynamic_cast
217489 ticks, 85 ms
box count = 500
circle count = 167
ellipse count = 67
------------------------------------

Using visitor pattern
329539 ticks, 129 ms
box count = 500
circle count = 167
ellipse count = 67
------------------------------------
```





