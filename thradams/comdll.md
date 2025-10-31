##Creating COM objects directly from the dll

This example shows how to load a COM object from his dll file.

It is not necessary to use a registered class and CoCreateInstance.

```cpp

HRESULT GetClassFactory(LPOLESTR pszDllName,
                        REFCLSID rclsid, //CoClass ID
                        IClassFactory **ppIClassFactory
                        )
{
    if (ppIClassFactory == 0)
        return E_POINTER;

    *ppIClassFactory = 0;
    HMODULE h = CoLoadLibrary(pszDllName, true);

    if (h == NULL)
    {
        DWORD lw32 = ::GetLastError();
        return HRESULT_FROM_WIN32(lw32);
    }

    typedef HRESULT (pascal *PFDllGetClassObject)(REFCLSID , REFIID , LPVOID* );
    PFDllGetClassObject pGetClassObject =
        (PFDllGetClassObject) ::GetProcAddress(h, "DllGetClassObject");

    if (pGetClassObject == 0)
    {
        DWORD lw32 = ::GetLastError();
        return HRESULT_FROM_WIN32(lw32);
    }

    return pGetClassObject(rclsid, IID_IClassFactory, (void**) ppIClassFactory);
}

HRESULT LocalCoCreateInstance(LPOLESTR pszDllName,
                              REFCLSID rclsid,
                              REFIID riid,
                              LPVOID* ppv,
                              LPUNKNOWN pUnkOuter = 0)

{
    CComPtr<IClassFactory> spClassFactory;
    HRESULT hr = GetClassFactory(pszDllName, rclsid, &spClassFactory);
    if (SUCCEEDED(hr))
    {
        hr = spClassFactory->CreateInstance(pUnkOuter, riid, ppv);
    }
    return hr;
}
```

example
```cpp
int main()
{
    CoInitialize(0);
    OLECHAR * psz = L"dllfile.dll";

    CComPtr<IMyNewObject> sp;
    HRESULT hr = LocalCoCreateInstance(psz,
                                       CLSID_MyNewObject,
                                       __uuidof(IMyNewObject),
                                       (void**)&sp);
    if (SUCCEEDED(hr))
    {
        //...
    }
    CoUninitialize();
}
```
