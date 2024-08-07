##Technique to remove WndProc switches. (Windows message switch)

This post is for those who use window programming and WNDPROC.

Ok, generally we don't need to write a message switch, because WTL, MFC do this for us. They use MACROS to hide the switch cases.

However, if you are creating windows code without WTL/MFC maybe you will be interested in this solution.

The idea is to map windows messages "WM_XXX" direct into a class using a function member name.

For instance, if the class has the function OnPaint, it means that the message WM_PAINT will call that function like magic! No macros, no switch, no virtual!.

Sample: \\
wndprocsample.cpp

```cpp

// WndProc switch removal sample - Thiago R Adams - 2010
// http://www.thradams.com/

#include "stdafx.h"
#include "wndprocsample.h"
#include <windows.h>

//Your class (no macros, no virtual, no base class)
class Doc
{
    HWND m_hWnd;
public:

    Doc(HWND hWnd) : m_hWnd(hWnd)
    {
    }

    void OnCommand(DWORD dw, BOOL& bHandled)
    {
        if (dw == IDM_EXIT)
        {
            DestroyWindow(m_hWnd);
            bHandled = TRUE;
        }
    }

    void OnPaint(HDC hdc)
    {
        ::TextOut(hdc, 10, 10, _T("Hello windows!"), 14);
    }
};

int APIENTRY _tWinMain(HINSTANCE hInstance,
                       HINSTANCE hPrevInstance,
                       LPTSTR    lpCmdLine,
                       int       nCmdShow)
{
    MSG msg;
    HWND hWnd = CreateNewWindow(hInstance, TRUE);
    
    Doc doc(hWnd);
    SetWindowDocument(hWnd, &doc);
    
    // Main message loop:
    while (GetMessage(&msg, NULL, 0, 0))
    {
        DispatchMessage(&msg);
    }
    return (int) msg.wParam;
}
wndprocsample.h This code requires VC++ extension VC++ __if_exists.

#pragma once

#include "resource.h"



ATOM MyRegisterClass(HINSTANCE hInstance)
{
    WNDCLASSEX wcex;
    wcex.cbSize = sizeof(WNDCLASSEX);
    wcex.style          = CS_HREDRAW | CS_VREDRAW;
    wcex.lpfnWndProc    = DefWindowProc;
    wcex.cbClsExtra     = 0;
    wcex.cbWndExtra     = 0;
    wcex.hInstance      = hInstance;
    wcex.hIcon          = LoadIcon(hInstance, MAKEINTRESOURCE(IDI_WNDPROCSAMPLE));
    wcex.hCursor        = LoadCursor(NULL, IDC_ARROW);
    wcex.hbrBackground  = (HBRUSH)(COLOR_WINDOW + 1);
    wcex.lpszMenuName   = MAKEINTRESOURCE(IDC_WNDPROCSAMPLE);
    wcex.lpszClassName  = _T("sample");
    wcex.hIconSm        = LoadIcon(wcex.hInstance, MAKEINTRESOURCE(IDI_SMALL));
    return RegisterClassEx(&wcex);
}



HWND CreateNewWindow(HINSTANCE hInstance,
                     int nCmdShow)
{
    MyRegisterClass(hInstance );
    HWND hWnd = CreateWindow(_T("sample"), _T("Title"), WS_OVERLAPPEDWINDOW,
                             CW_USEDEFAULT, 0, CW_USEDEFAULT, 0, NULL, NULL, hInstance, NULL);
    if (!hWnd)
    {
        return NULL;
    }
    ShowWindow(hWnd, nCmdShow);
    UpdateWindow(hWnd);
    return hWnd;
}


template<class T>
void GetWindowDocument(HWND hWnd, T**ppDoc)
{
    *ppDoc = (T*)((LONG_PTR)(::GetWindowLongPtrW(hWnd, GWLP_USERDATA)));
}

template<class T>
T* SetWindowDocument(HWND hWnd, T* pReceiver)
{
    LONG_PTR lptr = ::SetWindowLongPtrW(
                        hWnd,
                        GWLP_USERDATA,
                        PtrToUlong(pReceiver));
    T *pOldDoc = (T*)(LONG_PTR)(lptr);
    LONG_PTR lptr2 = ::SetWindowLongPtrW(
                         hWnd,
                         GWLP_WNDPROC,
                         (LONG_PTR)((WNDPROC) & WindowsProcEx<T>));
    ::ShowWindow(hWnd, TRUE);
    ::UpdateWindow(hWnd);
    ::InvalidateRect(hWnd, 0, 0);
    return pOldDoc;
}


template <class T>
LRESULT CALLBACK WindowsProcEx(HWND hWnd,
                               UINT message,
                               WPARAM wParam,
                               LPARAM lParam)
{
    T* pDoc = 0;
    GetWindowDocument(hWnd, &pDoc);
    switch (message)
    {
            __if_exists (T::OnCommand)
            {
            case WM_COMMAND:
            {
                int wmId = LOWORD(wParam);
                BOOL bHandled = FALSE;
                pDoc->OnCommand(wmId, bHandled);
                if (!bHandled)
                    return DefWindowProc(hWnd, message, wParam, lParam);
                break;
            }
        }
        __if_exists (T::OnPaint)
        {
            case WM_PAINT:
            {
                PAINTSTRUCT ps;
                HDC hdc = BeginPaint(hWnd, &ps);
                pDoc->OnPaint(hdc);
                EndPaint(hWnd, &ps);
            }
            break;
        }
        case WM_DESTROY:
            PostQuitMessage(0);
            break;
        default:
            return DefWindowProc(hWnd, message, wParam, lParam);
    }
    return 0;
}

```

See also: http://www.thradams.com/codeblog/guiexpress.htm
