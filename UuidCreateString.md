Creating UUID string on windows.

```cpp

#include "stdafx.h"

#include <Rpc.h>
#pragma comment( lib, "Rpcrt4.lib" )

#include <string>

bool UuidCreateString(std::string& s)
{
    s.clear(); //out
    UUID  uuid;

    if (UuidCreate(&uuid) != RPC_S_OK)
    {
        return false;
    }

    UCHAR* psz = 0;

    if (UuidToStringA(&uuid, &psz) != RPC_S_OK)
    {
        s = (const char*)psz;
        RpcStringFreeA(&psz);
        return true;
    }

    return false;
}

int _tmain(int argc, _TCHAR* argv[])
{
  std::string s;  
  UuidCreateString(s);
  return 0;
}


```
