
This macro can be used to validate input arguments in COM.

```cpp
#include <Windows.h>

#define A_OUT(pp) if (pp) {*pp = 0; } else { hr = E_POINTER; }
#define A_IN(p) if (!p) { hr = E_POINTER;}
#define A_OPTIONAL(p)

#define REQUIRE(...) \
    while(1)\
      {\
     HRESULT hr = 0;  \
     __VA_ARGS__ \
     if (FAILED(hr))  \
        return hr;  \
      break;\
      }

HRESULT F(const char* p, char** pp)
{
  REQUIRE(A_IN(p) A_OUT(pp))

  return S_OK;
}

int main(int argc, char* argv[])
{
  char* p ;
  HRESULT hr = F("s", &p);
  hr = F(0, &p);
  hr = F("s", 0);
  hr = F(0, 0);

	return 0;
}

```
