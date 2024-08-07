## Time Value of Money

```
Present Value (PV) : The value of the annuity at time=0 
Future Value (FV) : The value of the annuity at time=nPer 
Payment (PMT) : The value of the individual payments in each compounding period
Rate% (Rate) : The interest rate that would be compounded for each period of time
Period (nPer) : The number of payment periods
```

```cpp

// Copyright (C) 2009, Thiago Adams (thiago.adams@gmail.com)
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.
//

#include <float.h>
#include <math.h>

double calc_fv(double pv, double rate, double nper, double pmt)
{
  double fv = (pmt - pow(rate + 1.0, nper) * (pmt + rate * pv)) / rate;  
  return fv;
}

double calc_pv(double rate, double nper, double pmt, double fv)
{
  double pv = (pow(rate + 1.0, -nper) * (-pmt * pow(rate + 1.0, nper) - fv * rate + pmt)) / rate;
  return pv;
}

double calc_pmt(double pv, double rate, double nper, double fv)
{
  const double pow_rate1 = pow(rate + 1, nper);
  double pmt = -(rate * ( pv * pow_rate1 + fv)) / (pow_rate1 - 1);
  return pmt;
}

double calc_nper(double pv, double rate, double pmt, double fv)
{
  double nper =  log((pmt - rate * fv) / (pmt + rate * pv)) / log(rate + 1);
  return nper;
}

double calc_rate(double fv,
                 double pv,
                 double nper,
                 double pmt,
                 double accuracy = DBL_MIN)
{
  struct RateF
  {
    double fv, pv, nper, pmt;
    RateF(double fv1, double pv1, double nper1, double pmt1)
      : fv(fv1), pv(pv1), nper(nper1), pmt(pmt1) {
    }
    double operator ()(double rate) const {
      return (pmt - pow(rate + 1.0, nper) * (pmt + rate * pv)) / rate - fv;
    }
  };
  
  return Bisection(RateF(fv, pv, nper, pmt), DBL_MIN, 10, 1000, accuracy);
}

double calc_rate_n(double nper, double nom_rate, double accuracy = DBL_MIN)
{
  struct RateFN
  {
    double nper, nom_rate;
    RateFN(double nper1, double nom_rate1)
      : nper(nper1), nom_rate(nom_rate1){
    }
    double operator ()(double rate) const {
      return pow(1 + rate, nper) - (1 + nom_rate);
    }
  };
  return Bisection(RateFN(nper, nom_rate), 0, nom_rate);
}

double SAC(int n, double PV, double rate, double ntotal)
{
  double am = PV / ntotal;
  return rate * (PV - PV / ntotal * (n - 1)) + am;
}
```

See also Bisection Method

C++ 0x
```cpp
double calc_rate(double fv,
                 double pv,
                 double nper,
                 double pmt,
                 double accuracy = DBL_MIN)
{
  auto f = [&](double rate) {
      return (pmt - pow(rate + 1.0, nper) * (pmt + rate * pv)) / rate - fv;
  };
  
  return Bisection(f, DBL_MIN, 10, 1000, accuracy);

}
```

