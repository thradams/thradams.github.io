
Sample of use of codecvt_utf8. 

This class is part of C++0x.
"Standard code conversion facets"

```cpp

#include <fstream>
#include <codecvt>
#include <string>
using namespace std;

int main()
{

        // writing
	{
		std::locale ulocale(locale(), new codecvt_utf8<wchar_t>) ;
		std::wofstream ofs("test.txt");
		ofs.imbue(ulocale);
		ofs << L"maçã"; //apple in portuguese
        
        }

        // reading
	{
		std::locale ulocale(locale(), new codecvt_utf8<wchar_t>) ;
		std::wifstream ifs("test.txt");
		ifs.imbue(ulocale);
		std::wstring ws;
		std::getline(ifs, ws);		
    }
}
```

(compiled using VC++ 2010 express)
