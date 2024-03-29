##Immutable math vector class

How many times have you written a vector class? I have many times. 

However this is the first time I wrote an immutable vector class where all data members are const.

```cpp

#pragma once

#include <math.h>
#include <iostream>

namespace Math
{
  const double M_PI = 3.14159265358979323846;

  inline double RadToDeg(double rad)
  {
    return rad * 180.0 / M_PI;
  }

  inline double DegToRad(double deg)
  {
    return deg * M_PI / 180.0;
  }

  class Vector
  {
  public:
    const double x;
    const double y;

    Vector() : x(0), y(0) {}

    Vector(double i, double j) : x(i), y(j) {}

    inline bool operator==(const Vector& v2) const
    {
      return v2.x == x && v2.y == y;
    }

    inline bool operator!=(const Vector& v2) const
    {
      return ! operator==(v2);
    }

    inline bool IsNull() const
    {
      return x == 0 && y == 0;
    }

    inline double ScalarProduct(const Vector& v2) const
    {
       const Vector v1u(Unit());
       const Vector v2u(v2.Unit());
       return (v1u.x * v2u.x) + (v1u.y * v2u.y);      
    }

    inline double Length() const
    {
      return sqrt(x * x + y * y);
    }

    inline Vector Unit() const
    {
      const double r = Length();
      if (r == 0)
        return Vector();
      return Vector(x / r, y / r);
    }

    inline double ClockwiseAngle(const Vector& v2) const
    {
      return -atan2(x * v2.y - y * v2.x, x * v2.x + y * v2.y);
    }

    inline Vector ClockwiseRotated90() const
    {
      const double cos_a = 0;
      const double sin_a = 1;
      return Vector(x * cos_a + y * sin_a, y * cos_a - x * sin_a);           
    }

    inline Vector ClockwiseRotatedRad(double rad) const
    {
      const double cos_a = cos(rad);
      const double sin_a = sin(rad);
      return Vector(x * cos_a + y * sin_a, y * cos_a - x * sin_a);           
    }        

    inline bool ArePerpendicular(const Vector& v2) const
    {
      return ScalarProduct(v2) == 0.0;
    }

    inline Vector Perpendicular()const
    {
      return Vector(-y, x);   
    }
  }; //Vector


  inline Vector operator * (const Vector& v1, double v) 
  {
    return Vector(v1.x * v, v1.y * v);
  }

  inline Vector operator * (double v, const Vector& v1) 
  {
    return Vector(v1.x * v, v1.y * v);
  }

  inline Vector operator / (const Vector& v1, double v) 
  {
    return Vector(v1.x / v, v1.y / v);
  }

  inline Vector operator + (const Vector& v1, const Vector& v2)
  {
    return Vector(v1.x + v2.x, v1.y + v2.y);
  }

  inline Vector operator - (const Vector& v1, const Vector& v2)
  {
    return Vector(v1.x - v2.x, v1.y - v2.y);
  }

  inline Vector operator - (const Vector& v1)
  {
    return  Vector(-v1.x, -v1.y);
  }

  inline Vector MakeVector(double x1, double y1, double x2, double y2)
  {
    return Vector(x2 - x1, y2 - y1);
  }

  std::ostream& operator << (std::ostream& os, const Vector& v)
  {
    os << "(" << v.x << ", " << v.y << ")";
    return os;
  }
} // namespace math
```
