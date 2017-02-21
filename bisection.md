## Bisection Method

The bisection method is a root-finding algorithm which repeatedly divides an interval in half and then selects the subinterval in which a root exists.

```cpp

// Copyright (C) 2009, Thiago Adams (thiago.adams@gmail.com)
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.
//

inline double Sign(double x)
{
  return x > 0 ? 1.0 : -1.0;
}

template<class F>
double Bisection(const F& func,
                 double xmin, 
                 double xmax, 
                 int maxIterations = 10000,
                 double accuracy = DBL_MIN)
{
  double fxmin = func(xmin);
  double fmid = func(xmax);

  if (xmin >= xmax || Sign(fxmin) == Sign(fmid))
    throw std::runtime_error("invalid range");
  
  double dx;
  double x;

  if (fxmin < 0.0)
  {
    dx = xmax - xmin; 
    x = xmin; 
  }
  else 
  { 
    dx = xmin - xmax;
    x = xmax; 
  };
  
  for (int i = 0; i < maxIterations; ++i)
  {
    dx = dx * 0.5;
    double xmid = x + dx;
    fmid = func(xmid);
    if (fmid <= 0.0) 
    {
      x = xmid;
    }

    if (fabs(dx) < accuracy || fmid == 0.0)
    {
      return x;
    }
  }  
  throw std::runtime_error("number of iterations exceeded");
}

```
