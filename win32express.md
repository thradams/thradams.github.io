Micro framework to generate win32 applications.



Sample:

```cpp

// Windows Header Files:
#include <windows.h>

// C RunTime Header Files
#include <stdlib.h>
#include <malloc.h>
#include <memory.h>
#include <tchar.h>

#include "win32express.h"
#include "resource.h"


class AboutDlg : public Dialog<AboutDlg, IDD_ABOUT>
{
  void About()
  {  
  }

  void OnClose()
  {
    EndDialog(IDCANCEL);
  }

  void OnOk()
  {
    EndDialog(IDCANCEL);
    PostQuitMessage(1);
  }  

public:

  BEGIN_MSG_MAP(AboutDlg)
  S_COMMAND_ID_HANDLER(IDCANCEL, OnClose)  
  S_COMMAND_ID_HANDLER(IDOK, OnOk)  
  S_COMMAND_ID_HANDLER(IDM_ABOUT1, About)
  END_MSG_MAP()

  AboutDlg(HWND hParent = NULL) : Dialog<AboutDlg, IDD_ABOUT>(hParent) 
  {
  }
  
    void OnPaint(HDC hdc)
    {
        ::TextOut(hdc, 10,10,L"hello", 6);
    }
};


class Doc : public Window<Doc, IDI_ICON1, IDR_MENU1>
{
  void Exit()
  {
    DestroyWindow(m_hWnd);
    PostQuitMessage(0);
  }

  void About()
  {
    AboutDlg dlg(m_hWnd);
    dlg.ShowDialog();
  }

public:

  BEGIN_MSG_MAP(AboutDlg)
  S_COMMAND_ID_HANDLER(IDM_ABOUT1, About)
  S_COMMAND_ID_HANDLER(IDM_EXIT1, Exit)
  END_MSG_MAP()

  void OnPaint(HDC hdc)
    {
        ::TextOut(hdc, 10,10,L"hello", 6);
    }
};

int APIENTRY _tWinMain(HINSTANCE hInstance,
                     HINSTANCE hPrevInstance,
                     LPTSTR    lpCmdLine,
                     int       nCmdShow)
 {

   Doc doc;
   doc.Create();
   
    return RunMessageLoop();
 }

Header file


// Copyright (C) 2010, Thiago Adams (thiago.adams@gmail.com)
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.

//This is a experimental code.


#pragma once

#include <windows.h>
#include <commctrl.h>
#include <vector>
#include <string>
#ifndef ASSERT
#include <cassert>
#define ASSERT assert
#endif
#include <string.h>

template<class T>
T* GetWindowDocument(HWND hWnd)
{
  T *pDoc = reinterpret_cast<T *>(static_cast<LONG_PTR>(
    ::GetWindowLongPtrW(hWnd, GWLP_USERDATA)));
  return pDoc;
}

template<class T>
T* SetWindowDocument(HWND hWnd, T* pReceiver)
{
  LONG_PTR lptr = ::SetWindowLongPtrW(
    hWnd,
    GWLP_USERDATA,
    PtrToUlong(pReceiver));
  T *pOldDoc = (T*)(LONG_PTR)(lptr);
  return pOldDoc;
}

template<class T>
LRESULT CALLBACK WindowsProcEx(HWND hWnd,
  UINT message,
  WPARAM wParam,
  LPARAM lParam)
{
  T* pDoc = GetWindowDocument<T>(hWnd);
  BOOL bHandled = false;
  LRESULT r = Details::SendMessageTo(pDoc, hWnd , message, wParam, lParam, bHandled);
  if (bHandled)
  {
    return r;
  }
  return DefWindowProc(hWnd, message, wParam, lParam);  
}


inline bool IsControlKeyPressed()
{
  return (GetKeyState(VK_CONTROL) & 0xf000) == 0xf000;
}

inline bool IsShiftKeyPressed()
{
  return (GetKeyState(VK_SHIFT) & 0xf000) == 0xf000;
}

#ifndef GET_X_LPARAM
#define GET_X_LPARAM(lParam)    ((int)(short)LOWORD(lParam))
#endif
#ifndef GET_Y_LPARAM
#define GET_Y_LPARAM(lParam)    ((int)(short)HIWORD(lParam))
#endif

namespace Details
{
  class MemoryDC
  {
  public:
    HDC m_hDC;
    HDC m_hDCOriginal;
    RECT m_rcPaint;
    HBITMAP m_hBitmap;
    HBITMAP m_hBmpOld;

    MemoryDC(HDC hDC, RECT& rcPaint) : m_hDCOriginal(hDC), m_hBmpOld(NULL)
    {
      m_rcPaint = rcPaint;
      m_hDC = ::CreateCompatibleDC(m_hDCOriginal);
      ASSERT(m_hDC != NULL);
      m_hBitmap = ::CreateCompatibleBitmap(m_hDCOriginal,
        m_rcPaint.right - m_rcPaint.left, m_rcPaint.bottom - m_rcPaint.top);
      ASSERT(m_hBitmap != NULL);
      m_hBmpOld = (HBITMAP)::SelectObject(m_hDC, m_hBitmap);
      ::SetViewportOrgEx(m_hDC, -m_rcPaint.left, -m_rcPaint.top, 0);
    }

    ~MemoryDC()
    {
      ::BitBlt(m_hDCOriginal, m_rcPaint.left, m_rcPaint.top,
        m_rcPaint.right - m_rcPaint.left, m_rcPaint.bottom - m_rcPaint.top,
        m_hDC, m_rcPaint.left, m_rcPaint.top, SRCCOPY);
      (HBITMAP)::SelectObject(m_hDC, m_hBmpOld);
      ::DeleteObject(m_hBitmap);
      ::DeleteObject(m_hDC);
    }
  };


  template<class TEventReceiver>
  LRESULT SendMessageTo(TEventReceiver* pEventReceiver,
    HWND hWnd,
    UINT uMsg,
    WPARAM wparam,
    LPARAM lparam,
    BOOL& bHandled)
  {
    bHandled = FALSE;
    if (pEventReceiver == NULL)
    {
      return FALSE;
    }
    bHandled = TRUE;
    switch (uMsg)
    {

      //notifications
    case WM_COMMAND:
    case WM_NOTIFY:
      {
        LRESULT lresult;
        pEventReceiver->ProcessWindowMessage(hWnd, uMsg, wparam, lparam, lresult);
      }
      break;

      __if_exists(TEventReceiver::OnDeactivate)
      {
    case WM_ACTIVATE:
      {
        if (LOWORD(wparam) == WA_INACTIVE)
        {
          pEventReceiver->OnDeactivate();
        }
        break;
      }
      } //OnDeactivate

#ifndef _WIN32_WCE
      __if_exists(TEventReceiver::OnMouseWheel)
      {
    case WM_MOUSEWHEEL:
      {
        int fwKeys = GET_KEYSTATE_WPARAM(wparam );
        short zDelta = GET_WHEEL_DELTA_WPARAM(wparam );                
        pEventReceiver->OnMouseWheel(fwKeys, zDelta);
      }
      break;
      }//OnMouseWheel
#endif
      __if_exists(TEventReceiver::OnSetFocus)
      {
    case WM_SETFOCUS:
      {
        pEventReceiver->OnSetFocus();
      }            
      break;
      }

      __if_exists(TEventReceiver::OnSetCursor)
      {
    case WM_SETCURSOR:
      {
        if (!pEventReceiver->OnSetCursor())
        {
          bHandled = FALSE;
        }
      }            
      break;
      }

      __if_exists (TEventReceiver::OnKillFocus)
      {
    case WM_KILLFOCUS:
      {
        pEventReceiver->OnKillFocus();
      }            
      break;
      }//OnKillFocus

      __if_exists (TEventReceiver::OnPaint)
      {
    case WM_PAINT:
      {
        PAINTSTRUCT ps;
        HDC hDC = BeginPaint(hWnd, &ps);
        pEventReceiver->OnPaint(hDC);
        EndPaint(hWnd, &ps);
      }
      break;
      }

    default:
      bHandled = FALSE;
      return FALSE;
    }
    return TRUE;
  }
} //namespace details

int RunMessageLoop()
{
  MSG msg;
  while (GetMessage(&msg, NULL, 0, 0))
  {
    DispatchMessage(&msg);
  }
  return (int) msg.wParam;
}

DWORD GetStyle(HWND m_hWnd)
{
  ASSERT(::IsWindow(m_hWnd));
  return (DWORD)::GetWindowLong(m_hWnd, GWL_STYLE);
}

BOOL CenterWindow(HWND m_hWnd, HWND hWndCenter = NULL)
{
  ASSERT(::IsWindow(m_hWnd));

  // determine owner window to center against
  DWORD dwStyle = GetStyle(m_hWnd);
  if(hWndCenter == NULL)
  {
    if(dwStyle & WS_CHILD)
      hWndCenter = ::GetParent(m_hWnd);
    else
      hWndCenter = ::GetWindow(m_hWnd, GW_OWNER);
  }

  // get coordinates of the window relative to its parent
  RECT rcDlg;
  ::GetWindowRect(m_hWnd, &rcDlg);
  RECT rcArea;
  RECT rcCenter;
  HWND hWndParent;
  if(!(dwStyle & WS_CHILD))
  {
    // don't center against invisible or minimized windows
    if(hWndCenter != NULL)
    {
      DWORD dwStyleCenter = ::GetWindowLong(hWndCenter, GWL_STYLE);
      if(!(dwStyleCenter & WS_VISIBLE) || (dwStyleCenter & WS_MINIMIZE))
        hWndCenter = NULL;
    }

    // center within screen coordinates
#if WINVER < 0x0500
    ::SystemParametersInfo(SPI_GETWORKAREA, NULL, &rcArea, NULL);
#else
    HMONITOR hMonitor = NULL;
    if(hWndCenter != NULL)
    {
      hMonitor = ::MonitorFromWindow(hWndCenter,
        MONITOR_DEFAULTTONEAREST);
    }
    else
    {
      hMonitor = ::MonitorFromWindow(m_hWnd, MONITOR_DEFAULTTONEAREST);
    }

    //ATLENSURE_RETURN_VAL(hMonitor != NULL, FALSE);

    MONITORINFO minfo;
    minfo.cbSize = sizeof(MONITORINFO);
    BOOL bResult = ::GetMonitorInfo(hMonitor, &minfo);
    //ATLENSURE_RETURN_VAL(bResult, FALSE);

    rcArea = minfo.rcWork;
#endif
    if(hWndCenter == NULL)
      rcCenter = rcArea;
    else
      ::GetWindowRect(hWndCenter, &rcCenter);
  }
  else
  {
    // center within parent client coordinates
    hWndParent = ::GetParent(m_hWnd);
    ASSERT(::IsWindow(hWndParent));

    ::GetClientRect(hWndParent, &rcArea);
    ASSERT(::IsWindow(hWndCenter));
    ::GetClientRect(hWndCenter, &rcCenter);
    ::MapWindowPoints(hWndCenter, hWndParent, (POINT*)&rcCenter, 2);
  }

  int DlgWidth = rcDlg.right - rcDlg.left;
  int DlgHeight = rcDlg.bottom - rcDlg.top;

  // find dialog's upper left based on rcCenter
  int xLeft = (rcCenter.left + rcCenter.right) / 2 - DlgWidth / 2;
  int yTop = (rcCenter.top + rcCenter.bottom) / 2 - DlgHeight / 2;

  // if the dialog is outside the screen, move it inside
  if(xLeft + DlgWidth > rcArea.right)
    xLeft = rcArea.right - DlgWidth;
  if(xLeft < rcArea.left)
    xLeft = rcArea.left;

  if(yTop + DlgHeight > rcArea.bottom)
    yTop = rcArea.bottom - DlgHeight;
  if(yTop < rcArea.top)
    yTop = rcArea.top;

  // map screen coordinates to child coordinates
  return ::SetWindowPos(m_hWnd, NULL, xLeft, yTop, -1, -1,
    SWP_NOSIZE | SWP_NOZORDER | SWP_NOACTIVATE);
}


// Message handler for about box.
template<class T>
INT_PTR CALLBACK DlgProc(HWND hDlg,
  UINT message,
  WPARAM wParam,
  LPARAM lParam)
{
  BOOL bHandled = FALSE;
  UNREFERENCED_PARAMETER(lParam);

  switch (message)
  {
  case WM_INITDIALOG:
    {
      T * p = (T*)lParam;
      SetWindowLongPtr(hDlg, GWLP_USERDATA, (LONG_PTR) p);
      p->InitEntry(hDlg);
      return (INT_PTR)TRUE;
    }  
  }

  //TODO : all messages?
  T * p = (T*)GetWindowLongPtr(hDlg, GWLP_USERDATA);
  LRESULT r = Details::SendMessageTo(p, hDlg, message, wParam, lParam, bHandled);

  return bHandled;
}


template<class T>
INT_PTR ShowDialog(LPCWSTR lpTemplateName, T * p, HWND hWndParent)
{
  HINSTANCE hInst = GetModuleHandle(NULL);
  INT_PTR r = DialogBoxParam(hInst, lpTemplateName, hWndParent, &DlgProc<T>,(LPARAM) p);

  ASSERT(r != 0); //resource exists?	(1813)
  return r;
}

template<class T>
HWND ShowModeless(UINT IDD, T* p, HWND hParent)
{
  HWND hWnd = NULL;

  HINSTANCE hInstance = GetModuleHandle(NULL);   

  HRSRC hDlg = FindResource(hInstance, MAKEINTRESOURCE(IDD), RT_DIALOG);
  if (hDlg != NULL)
  {
    DWORD dwLastError = 0;
    HGLOBAL hResource = LoadResource(hInstance, hDlg);
    if (hResource != NULL)
    {
      DLGTEMPLATE* pDlg = (DLGTEMPLATE*) LockResource(hResource);
      if (pDlg != NULL)
      {
        hWnd = CreateDialogIndirectParam(
          hInstance,
          pDlg,
          hParent,
          &DlgProc<T>, 
          (LPARAM)p);

        UnlockResource(hResource);
      }
      else
        dwLastError = ::GetLastError();
    }
    else
      dwLastError = ::GetLastError();

    if (dwLastError != 0)
      SetLastError(dwLastError);
  }
  return hWnd;
}


template<class T, UINT IDD>
class Dialog
{
protected:
  HWND m_hDlg;
  HWND m_hParent;

public:

  int EndDialog(int r)
  {
    return ::EndDialog(m_hDlg, r);
  }

  UINT GetDlgItemText(int nID, std::wstring& s) const
  {
    ASSERT(::IsWindow(m_hDlg));
    HWND hItem = GetDlgItem(nID);
    if (hItem != NULL)
    {
      int nLength = ::GetWindowTextLength(hItem);
      std::vector<wchar_t> buffer(nLength+1);
      wchar_t* pszText = &buffer[0];
      nLength = ::GetWindowText(hItem, pszText, nLength+1);
      s = pszText;
      return nLength;
    }
    else
    {
      s.clear();
      return 0;
    }
  }

  HWND GetDlgItem(UINT id) const
  {
    return ::GetDlgItem(m_hDlg, id);
  }

  Dialog(HWND hParent = NULL) : m_hParent(hParent)
  {
  }

  //WM_INITDIALOG
  void InitEntry(HWND hDlg)
  {     
    m_hDlg = hDlg;
    CenterWindow(m_hDlg, m_hParent);

    __if_exists (T::InitDialog)
    {
      static_cast<T*>(this)->InitDialog();
    }
  }

  //show modeless
  void Show()
  {
    m_hDlg = ShowModeless(IDD, this, m_hParent);                        
  }

  //show modal
  int ShowDialog()
  {
    return ::ShowDialog(MAKEINTRESOURCE(IDD), static_cast<T*>(this), m_hParent);
  }
};

template<class T, 
  UINT IconId =0,
  UINT MENUIDD = 0,
  UINT wStyle =  WS_OVERLAPPEDWINDOW | CS_DBLCLKS 
>
class Window
{
protected:
  HWND m_hWnd;

public:

  static const WNDCLASSEX * GetClass()
  {
    HINSTANCE hInstance = GetModuleHandle(NULL);
    static WNDCLASSEX wcex;
    wcex.cbSize = sizeof(WNDCLASSEX);
    wcex.style          = CS_HREDRAW | CS_VREDRAW | CS_DBLCLKS;
    wcex.lpfnWndProc    = &WindowsProcEx<T>;
    wcex.cbClsExtra     = 0;
    wcex.cbWndExtra     = 0;
    wcex.hInstance      = hInstance;

    wcex.hIcon            = LoadIcon(hInstance, MAKEINTRESOURCE(IconId));

    wcex.hCursor          = LoadCursor(NULL, IDC_ARROW);
    wcex.hbrBackground  = (HBRUSH)(COLOR_WINDOW + 1);

    if (MENUIDD != NULL)
      wcex.lpszMenuName   = MAKEINTRESOURCE(MENUIDD);
    else
      wcex.lpszMenuName   = NULL;

    wcex.lpszClassName  = L"class";
    wcex.hIconSm        = 0;//LoadIcon(wcex.hInstance,MAKEINTRESOURCE(IDI_SMALL));
    return &wcex;
  }

  Window() : m_hWnd(NULL)
  {
  }

  void Create(HWND hWndParent = 0)
  {
    HINSTANCE hInstance = GetModuleHandle(NULL);
    RegisterClassEx(GetClass());

    m_hWnd = CreateWindow(GetClass()->lpszClassName, L"", wStyle,
      0, 0, CW_USEDEFAULT, CW_USEDEFAULT, hWndParent, NULL, hInstance, NULL);

    SetWindowDocument(m_hWnd, static_cast<T*>(this));
    ShowWindow(m_hWnd, TRUE);
    UpdateWindow(m_hWnd);
  }
};


#if defined _M_IX86
#pragma comment(linker, "/manifestdependency:\"type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='x86' publicKeyToken='6595b64144ccf1df' language='*'\"")
#elif defined _M_IA64
#pragma comment(linker, "/manifestdependency:\"type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='ia64' publicKeyToken='6595b64144ccf1df' language='*'\"")
#elif defined _M_X64
#pragma comment(linker, "/manifestdependency:\"type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='amd64' publicKeyToken='6595b64144ccf1df' language='*'\"")
#else
#pragma comment(linker, "/manifestdependency:\"type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='*' publicKeyToken='6595b64144ccf1df' language='*'\"")
#endif


#define COMMAND_ID_HANDLER(id, func) \
  if(uMsg == WM_COMMAND && id == LOWORD(wParam)) \
{ \
  bHandled = TRUE; \
  lResult = func(HIWORD(wParam), LOWORD(wParam), (HWND)lParam, bHandled); \
  if(bHandled) \
  return TRUE; \
}

#define S_COMMAND_ID_HANDLER(id, func) \
  if(uMsg == WM_COMMAND && id == LOWORD(wParam)) \
{ \
  bHandled = TRUE; \
  lResult = 1;\
  bHandled = TRUE;\
  func(); \
  if(bHandled) \
  return TRUE; \
}


#define COMMAND_HANDLER(id, code, func) \
  if(uMsg == WM_COMMAND && id == LOWORD(wParam) && code == HIWORD(wParam)) \
{ \
  bHandled = TRUE; \
  lResult = func(HIWORD(wParam), LOWORD(wParam), (HWND)lParam, bHandled); \
  if(bHandled) \
  return TRUE; \
}


#define BEGIN_MSG_MAP(theClass) \
public: \
  BOOL ProcessWindowMessage(_In_ HWND hWnd, _In_ UINT uMsg, _In_ WPARAM wParam,\
  _In_ LPARAM lParam, _Inout_ LRESULT& lResult, _In_ DWORD dwMsgMapID = 0) \
{ \
  BOOL bHandled = TRUE; \
  (hWnd); \
  (uMsg); \
  (wParam); \
  (lParam); \
  (lResult); \
  (bHandled); \
  switch(dwMsgMapID) \
{ \
  case 0:


#define END_MSG_MAP() \
  break; \
  default: \
  break; \
} \
  return FALSE; \
}

```


[win32express1.zip](Download sample)
