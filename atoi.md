
Function to parse integers. It doesn't handle plus and minus sign.

```cpp

int ParsePositiveInt(const wchar_t* psz)
{
  int result = 0; 
  while ((*psz >= '0') && (*psz <= '9'))
  { 
    result = result * 10 + (*psz - '0'); 
    psz++; 
  } 
  return result;
}

```
