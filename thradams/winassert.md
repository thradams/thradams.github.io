##Windows assert

Using VC++ the standard assert doens't stop at the line where the assert is positioned.

The ASSERTE defined in <crtdbg.h>
do the correct work, so in some projects I decided to make this change:

```cpp

#include <crtdbg.h>
#ifdef assert
#undef assert
#define assert(x) _ASSERTE(x)
#else
#define assert(x) _ASSERTE(x)
#endif

```

