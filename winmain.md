
## Converting from WinMain to standard main

```cpp
int main(int argc, TCHAR* argv[]);

int APIENTRY _tWinMain(HINSTANCE hInstance,
                       HINSTANCE hPrevInstance,
                       LPTSTR    lpCmdLine,
                       int       nCmdShow)
{   
   int nArgs;
   LPWSTR *szArglist = CommandLineToArgvW(GetCommandLineW(), &nArgs);

   if (szArglist == NULL)
       return 1; //error
   
   const int r = main(nArgs, szArglist);
   LocalFree(szArglist);
   return r;   
}
```
