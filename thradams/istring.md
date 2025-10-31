
==Almost immutable string==

(scratch)

{{{cpp

class string
{
  const char* m_psz;

  string & operator = (const string&);
  string & operator = (string&& s);

public:

  typedef const char* const_iterator;

  string();    

  //copy from
  string(const string& s);    
  explicit string(const char* psz);

  //To move from
  explicit string(char*&&);
  explicit string(const char*&&);
  string(string&&);

  ~string();

  const_iterator cbegin() const;
  const_iterator cend() const;
  size_t lenght() const;
  
  const char at(size_t) const;
  bool empty() const;
  operator const char*() const;
};


inline char* duplicate(const char* source)
{
  if (source == nullptr)
    return nullptr;

  char* temp = (char*)malloc(strlen(source) + 1);

  if (temp == nullptr)
    throw std::bad_alloc();

  strcpy(temp, source);
  return temp;
}


string::string() : m_psz(nullptr) 
{
}

string::string(const string& s) : m_psz(nullptr)
{
  m_psz = duplicate(s.m_psz);
}

string::string(char* &&psz) : m_psz(psz)
{        
  psz = nullptr;
}

string::string(const char* &&psz) : m_psz(psz)
{        
  psz = nullptr;
}

string::string(const char* psz) : m_psz(nullptr)
{
  if (psz != nullptr)
    m_psz = _strdup(psz);
}

string::string(string&& s) : m_psz(s.m_psz)
{
  s.m_psz = nullptr;
}

string::~string()
{
  if (m_psz != nullptr)
    free((void*)m_psz);
}


string::const_iterator string::cbegin() const
{
  return m_psz;
}

string::const_iterator string::cend() const
{
  return m_psz + lenght() + 1;
}


size_t string::lenght() const
{
  return (m_psz == nullptr) ? 0 : strlen(m_psz);
}

bool string::empty() const 
{
  return lenght() == 0;
}

string::operator const char*() const
{
  return m_psz;
}

const char string::at(size_t index) const
{
   return m_psz[index];
}

inline int Diference(const string& s1, const string& s2)
{
  // -1 s1 < s2
  //  0 s1 == s2
  //  1 s1 > s2

  if (s1 != nullptr && s2 != nullptr)
    return strcmp(s1, s2);

  if  (s1 == nullptr && s2 != nullptr) 
    return -1;

  if  (s1 != nullptr && s2 == nullptr) 
    return 1;

  return 0;
}

inline bool operator < (const string& s1, const string& s2)
{
    return Diference(s1, s2) == -1;
}

inline bool operator > (const string& s1, const string& s2)
{
    return Diference(s1, s2) == 1;
}

inline bool operator == (const string& s1, const string& s2)
{
    return Diference(s1, s2) == 0;
}

inline bool operator != (const string& s1, const string& s2)
{
    return Diference(s1, s2) != 0;
}

}}}
