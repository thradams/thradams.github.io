## Statistics

Some statistics algorithm

```cpp
struct Min
{
  double m_v;
public:
  Min()
  {
    m_v = (std::numeric_limits<double>::max)();
  }
  void operator() (double v)
  {
    if (v < m_v)
      m_v = v;
  }
  double Minimun() const { return m_v; }
};

struct Max
{
  double m_v;
public:
  Max()
  {
    m_v = -(std::numeric_limits<double>::max)();
  }
  void operator() (double v)
  {
    if (v > m_v)
      m_v = v;
  }
  double Maximun() const { return m_v; }
};

struct Avg
{
  double m_v;
  int   m_count;
public:
  Avg()
  {
    m_count = 0;
    m_v = 0;
  }
  void operator() (double v)
  {
    m_v += v;
    ++m_count;
  }
  double Average() const { return m_v / double(m_count); }
};

template<class T1, class T2>
struct TBind : public T1, public T2 {
  void operator() (double v)
  {
    T1::operator()(v);
    T2::operator()(v);
  }
};

template<class T1, class T2>
TBind<T1, T2> operator && (const T1&, const T2&)
{
  return TBind<T1, T2>();
}

int main()
{
  using namespace std;
  vector<int> v;
  v.push_back(2);
  v.push_back(1);
  v.push_back(3);

  //auto r = 
  cout << for_each(v.begin(),
                   v.end(),
                   Min() && Max() && Avg()).Minimun();

  //cout << r.Maximum();

}

//*c++0x*/

int main()
{
  using namespace std;
  vector<int> v;
  v.push_back(2);
  v.push_back(1);
  v.push_back(3);

  auto r = for_each(v.begin(),
                   v.end(),
                   Min() && Max() && Avg());
  cout <<  r.Minimun() << endl;
  cout << r.Maximun() << endl;
  cout << r.Average() << endl;

}
```
