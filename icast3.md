
Memory access using row x col.


```cpp

template<class T>
struct Array
{
  size_t m_Rows;
  size_t m_Cols;
  T* m_p;
  size_t m_Capacity;

  void BuyMemory(size_t rows, size_t cols)
  {
      T* p = new T[rows * cols];
      delete [] m_p;
      m_p = p;
      m_Capacity = rows * cols;
  }

public:

  Array() : m_p(0), m_Rows(0), m_Cols(0), m_Capacity(0)
  {    
  }
  
  Array(size_t rows, size_t cols) : m_p(0), m_Rows(0), m_Cols(0), m_Capacity(0)
  {    
    Resize(rows, cols);
  }
  
  size_t Cols() const 
  {
    return m_Cols;
  }
  
  size_t Rows() const 
  {
    return m_Rows;
  }

  void Resize(size_t rows, size_t cols)
  { 
    // memory changed?
    if (rows * cols != m_Capacity)
    {
      BuyMemory(rows, cols);
    }
    
    m_Rows = rows;
    m_Cols = cols;
  }

  void ResizeConservative(size_t rows, size_t cols)
  {    
    //needs more memory?
    if (rows * cols > m_Capacity)
    {
      BuyMemory(rows, cols);
    }
    
    m_Rows = rows;
    m_Cols = cols;
  }

  T& At(size_t row, size_t col)
  {
    assert(row < Rows());
    assert(col < Cols());
    return m_p[(Rows() - 1) * row + col];
  }
  
  const T& At(size_t row, size_t col) const
  {
    assert(row < Rows());
    assert(col < Cols());
    return m_p[(Rows() - 1) * row + col];
  }
};

```

