Generating a temporary file name on Windows.


```cpp
bool GetTempFileName(std::wstring& ws )
{
    ws.clear();//out

    TCHAR szTempFileName[MAX_PATH];  
    TCHAR lpTempPathBuffer[MAX_PATH];
    char  chBuffer[BUFSIZE]; 

     //  Gets the temp path env string (no guarantee it's a valid path).
    auto dwRetVal = GetTempPath(MAX_PATH,          // length of the buffer
                           lpTempPathBuffer); // buffer for path 
    if (dwRetVal > MAX_PATH || (dwRetVal == 0))
    {
       return false;
    }

    //  Generates a temporary file name. 
    auto uRetVal = GetTempFileName(lpTempPathBuffer, // directory for tmp files
                              TEXT("DEMO"),     // temp file name prefix 
                              0,                // create unique name 
                              szTempFileName);  // buffer for name 
    if (uRetVal == 0)
    {
        return false;
    }
    ws = szTempFileName;
    return true;
}
```
