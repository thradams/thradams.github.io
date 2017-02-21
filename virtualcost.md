##Measuring virtual function call cost

C++ version 
See stopwatch 

C++, _SECURE_SCL 0, vector of function pointers, __fastcall

```cpp
//#define FCALLTYPE 
//#define FCALLTYPESTR "__cdecl"

#define FCALLTYPE __fastcall
#define FCALLTYPESTR "__fastcall"

typedef void  (FCALLTYPE *SumPF)(int &);
void FCALLTYPE OddSum(int &s) { s += 1; }
void FCALLTYPE EvenSum(int &s) { s += 2; }

int main()
{
    using namespace std;
    
    vector<SumPF> v;
    v.push_back(&OddSum);
    v.push_back(&EvenSum);

    Stopwatch sw;
    sw.Start();

    int sum = 0;
    const int maxit = 100000000;
    for (int i = 0; i < maxit; ++i)
    {
        vector<SumPF>::iterator it = v.begin();
        for (; it != v.end(); ++it)
        {
            (*it)(sum);
        }
    }
    
    sw.Stop();
 
    cout << "/**C++, _SECURE_SCL 0, vector of function pointers, " << FCALLTYPESTR << "*/" << endl;
    cout << "iterations =" << maxit << endl;
    cout << "sum        =" << sum << endl;
    cout << "Elapsed    =" << sw << endl;    
    cout << "Average    ="  << sw.GetElapsedMilliseconds() / double(maxit) << " milliseconds/call";    
    cin.get();
}
```

C++, _SECURE_SCL 0, direct base class call

```cpp

#define FCALLTYPE 
#define FCALLTYPESTR "__cdecl"

//#define FCALLTYPE __fastcall
//#define FCALLTYPESTR "__fastcall"


struct Base {
  virtual void FCALLTYPE Sum(int &s) = 0;
  virtual ~Base(){}
};

struct Odd : public Base {
  void FCALLTYPE Sum(int &s) { s += 1; }
};

struct Even : public Base {
  void FCALLTYPE Sum(int &s) { s += 2; }
};


int main()
{
    using namespace std;
    Base* podd(new Odd());
    Base* peven(new Even());
    
    Stopwatch sw;
    sw.Start();

    int sum = 0;
    const int maxit = 100000000;
    for (int i = 0; i < maxit; ++i)
    {
      podd->Sum(sum);
      peven->Sum(sum);
    }
    
    sw.Stop();
    
    cout << "/**C++, _SECURE_SCL 0, direct base class call, " << FCALLTYPESTR << "*/" << endl;
    cout << "iterations =" << maxit << endl;
    cout << "sum        =" << sum << endl;
    cout << "Elapsed    =" << sw << endl;    
    cout << "Average    ="  << sw.GetElapsedMilliseconds() / double(maxit) << " milliseconds/call";

    cin.get();

    delete podd;
    delete peven;
}
```

C++, _SECURE_SCL 0, vector base class call

```cpp

//#define FCALLTYPE 
//#define FCALLTYPESTR "__cdecl"

#define FCALLTYPE __fastcall
#define FCALLTYPESTR "__fastcall"


struct Base {
  virtual void FCALLTYPE Sum(int &s) = 0;
  virtual ~Base(){}
};

struct Odd : public Base {
  void FCALLTYPE Sum(int &s) { s += 1; }
};

struct Even : public Base {
  void FCALLTYPE Sum(int &s) { s += 2; }
};


int main()
{
    using namespace std;
    
    vector<Base*> v;
    v.push_back(new Odd());
    v.push_back(new Even());

    Stopwatch sw;
    sw.Start();

    int sum = 0;
    const int maxit = 100000000;
    for (int i = 0; i < maxit; ++i)
    {
        vector<Base*>::iterator it = v.begin();
        for (; it != v.end(); ++it)
        {
            (*it)->Sum(sum);
        }
    }
    
    sw.Stop();
    
    cout << "/**C++, _SECURE_SCL 0, vector base class call, " << FCALLTYPESTR << "*/" << endl;
    cout << "iterations =" << maxit << endl;
    cout << "sum        =" << sum << endl;
    cout << "Elapsed    =" << sw << endl;    
    cout << "Average    ="  << sw.GetElapsedMilliseconds() / double(maxit) << " milliseconds/call";

    
    for (vector<Base*>::iterator it = v.begin(); it != v.end(); ++it)
    {
        delete *it;
    }
    cin.get();
}
```

C# base call

```cpp

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;

namespace ConsoleApplication1
{

    abstract class Base
    {
        public abstract void Sum(ref int s);
    };

    class Odd : Base
    {
        public override void Sum(ref int s) { s += 1; }
    };

    class Even : Base
    {
        public override void Sum(ref int s) { s += 2; }
    };

    class Program
    {
        static void Main(string[] args)
        {

            List<Base> list = new List<Base>();
            list.Add(new Odd());
            list.Add(new Even());

            Stopwatch sw = new Stopwatch();
            sw.Start();

            int sum = 0;
            const int maxit = 100000000;
            for (int i = 0; i < maxit; ++i)
            {
                for (int k = 0; k < list.Count; k++)
                {
                    list[k].Sum(ref sum);
                }
            }

            sw.Stop();

            Console.WriteLine("iterations : {0}", maxit);
            Console.WriteLine("sum        : {0}", sum);
            Console.WriteLine("Elapsed    : {0}", sw.ElapsedMilliseconds);
            Console.WriteLine("Average    : {0}", sw.ElapsedMilliseconds / (double)maxit);
            Console.Read();
        }
    }
}
```

C# list
```cpp

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;

namespace ConsoleApplication1
{

    abstract class Base
    {
        public abstract void Sum(ref int s);
    };

    class Odd : Base
    {
        public override void Sum(ref int s) { s += 1; }
    };

    class Even : Base
    {
        public override void Sum(ref int s) { s += 2; }
    };

    class Program
    {
        static void Main(string[] args)
        {
            Base odd = new Odd();
            Base even = new Even();

            Stopwatch sw = new Stopwatch();
            sw.Start();

            int sum = 0;
            const int maxit = 100000000;
            for (int i = 0; i < maxit; ++i)
            {
                odd.Sum(ref sum);
                even.Sum(ref sum);
            }

            sw.Stop();

            Console.WriteLine("iterations : {0}", maxit);
            Console.WriteLine("sum        : {0}", sum);
            Console.WriteLine("Elapsed    : {0}", sw.ElapsedMilliseconds);
            Console.WriteLine("Average    : {0}", sw.ElapsedMilliseconds / (double)maxit);
            Console.Read();
        }
    }
}
```

C++, _SECURE_SCL 0, direct base class call, __cdecl
```
iterations =100000000
sum        =300000000
Elapsed    =1695 ms (stopped)
Average    =1.695e-005 milliseconds/call
```
C++, _SECURE_SCL 0, direct base class call, __fastcall
```
iterations =100000000
sum        =300000000
Elapsed    =769 ms (stopped)
Average    =7.69e-006 milliseconds/call
```
C++, _SECURE_SCL 0, vector of function pointers, __cdecl
```
iterations =100000000
sum        =300000000
Elapsed    =2653 ms (stopped)
Average    =2.653e-005 milliseconds/call
```
C++, _SECURE_SCL 0, vector of function pointers, __fastcall
```
iterations =100000000
sum        =300000000
Elapsed    =2549 ms (stopped)
Average    =2.549e-005 milliseconds/call
```

C++, _SECURE_SCL 0, vector base class call, __cdecl
```
iterations =100000000
sum        =300000000
Elapsed    =3424 ms (stopped)
Average    =3.424e-005 milliseconds/call
```
C++, _SECURE_SCL 0, vector base class call, __fastcall
```
iterations =100000000
sum        =300000000
Elapsed    =3320 ms (stopped)
Average    =3.32e-005 milliseconds/call
```
C++, _SECURE_SCL 0, vector base class call, __fastcall, __fastcall in project config
```
iterations =100000000
sum        =300000000
Elapsed    =3078 ms (stopped)
Average    =3.078e-005 milliseconds/call
```


C# base call
```
iterations : 100000000
sum        : 300000000
Elapsed    : 984
Average    : 9,84E-06
```
C# list
```
iterations : 100000000
sum        : 300000000
Elapsed    : 3293
Average    : 3,293E-05
```
Brief
```
C++ vector function ptr 2549
C++ vector              3078
C# list                 3293  ~  +6%

C++ base call 769 
c#  base call 984 ~ +27%
```

Thanks Felipe Farion to point out the use of __fastcall 
VC++ 2008, uses __cdecl by default.
