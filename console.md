##Turbo C console functions

For those missing the old conio.h from Turbo C, here is an implementation for windows.

I would like to complete this code (as you can see there are some functions not implemented) and create a version for linux as well.

See also [memory.htm](memory) to include the bit functions.

Download source : [[console.zip|console.zip]]

Some help about conio


```cpp
//
// Copyright (C) 2008, Thiago Adams (thiago.adams@gmail.com)
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.
//
#ifndef __CONSOLE_HEADER__
#define __CONSOLE_HEADER__

namespace console
{
  enum COLORS
  {
    BLACK        =  0,
    BLUE         =  1,
    GREEN        =  2,
    CYAN         =  3,
    RED          =  4,
    MAGENTA      =  5,
    BROWN        =  6,
    LIGHTGRAY    =  7,
    DARKGRAY     =  8,
    LIGHTBLUE    =  9,
    LIGHTGREEN   = 10,
    LIGHTCYAN    = 11,
    LIGHTRED     = 12,
    LIGHTMAGENTA = 13,
    YELLOW       = 14,
    WHITE        = 15,
    BLINK        = 128
  };
  
  enum CURSORTYPE
  {
    _NOCURSOR,//     (turns off the cursor)
    _SOLIDCURSOR,//  (solid block cursor)
    _NORMALCURSOR // (normal underscore cursor)
  };

  struct text_info 
  {
    unsigned char winleft;        /* left window coordinate */
    unsigned char wintop;         /* top window coordinate */
    unsigned char winright;       /* right window coordinate */
    unsigned char winbottom;      /* bottom window coordinate */
    unsigned char attribute;      /* text attribute */
    unsigned char normattr;       /* normal attribute */
    unsigned char currmode;       /* current video mode:
                                  BW40, BW80, C40, C80, or C4350 */
    unsigned char screenheight;   /* text screen's height */
    unsigned char screenwidth;    /* text screen's width */
    unsigned char curx;           /* x-coordinate in current window */
    unsigned char cury;           /* y-coordinate in current window */
  };

  char *cgets(char *buffer);

  void clreol(void);
  void clrscr();
  int cputs(const char *str);

  void delline(void);
  int getch(void);
  int getche(void);
  
  char *getpass(const char *prompt);
  int gettext(int left, int top, int right, int bottom, void*destin);
  void gettextinfo(struct text_info *r);
  void gotoxy(int x, int y);
  void highvideo();     

  void insline(void);
  int kbhit(void);

  void lowvideo();      
  int movetext(int left, int top, int right, int bottom, int destleft, int desttop);
  void normvideo();     
  
  int putch(int c);

  int puttext(int left, int top, int right, int bottom, const char*source);  
  void _setcursortype(int cur_t);
  void textattr(int newattr);
  int textbackground(int newcolor);
  int textcolor(int newcolor);
  int ungetch(int ch);
  int wherex();
  int wherey();
  //window    //TODO
} // namespace console

#endif //__CONSOLE_HEADER__

Windows - Implementation

#include "console.h"

#include <conio.h> //from windows
#include <cassert>
#include <windows.h>

namespace console
{
    using namespace memory;

    char *_cgets(char *buffer)
    {
        return _cgets(buffer);
    }

    int getch(void)
    {
        return _getch();
    }

    int getche(void)
    {
        return _getche();
    }

    int kbhit(void)
    {
        return _kbhit();
    }

    int cputs(const char *str)
    {
        return _cputs(str);
    }

    void gettextinfo(text_info *r)
    {
        if (r == 0)
            return;

        CONSOLE_SCREEN_BUFFER_INFO csbi;
        GetConsoleScreenBufferInfo(GetStdHandle(STD_OUTPUT_HANDLE), &csbi);

        r->attribute = csbi.wAttributes;
        r->curx = csbi.dwCursorPosition.X;
        r->cury = csbi.dwCursorPosition.Y;
        r->screenwidth = csbi.dwMaximumWindowSize.X;
        r->screenheight = csbi.dwMaximumWindowSize.X;
        r->winleft = csbi.srWindow.Left;
        r->wintop = csbi.srWindow.Top;
        r->winright = csbi.srWindow.Right;
        r->winbottom = csbi.srWindow.Bottom;
        r->normattr = 0;
        r->currmode = 3;
    }

    void _setcursortype(int cur_t)
    {
        CONSOLE_CURSOR_INFO ci;
        switch (cur_t)
        {
        case _NOCURSOR://     (turns off the cursor)
            ci.bVisible = FALSE;
            ci.dwSize = 0;
            break;
        case _SOLIDCURSOR://  (solid block cursor)
            ci.bVisible = TRUE;
            ci.dwSize = 100;
            break;
        default:
        case _NORMALCURSOR: // (normal underscore cursor)
            ci.bVisible = TRUE;
            ci.dwSize = 50;
            break;
        }
        SetConsoleCursorInfo(GetStdHandle(STD_OUTPUT_HANDLE), &ci);
    }

    void textattr(int newattr)
    {
        SetConsoleTextAttribute(GetStdHandle(STD_OUTPUT_HANDLE), newattr);
    }

    int putch(int c)
    {
        return _putch(c);
    }

    void clreol(void)
    {
        //clreol clears all characters from the cursor
        //position to the end of the line within the
        //current text window, without moving the
        //cursor.
    }

    char *getpass(const char *prompt)
    {
        //reads password
        //  getpass reads a password from the system
        //console, after prompting with the
        //null-terminated string prompt and disabling
        //the echo.

        //It returns a pointer to a null-terminated
        //string of up to eight characters (not
        //counting the null terminator).

        return 0;
    }

    void delline(void)
    {
        //tODO inserts blank line
    }

    void insline(void)
    {
        //tODO inserts blank line
    }

    int movetext(int left, int top, int right, int bottom, int destleft, int desttop)
    {
        //TODO
        return 0;
    }

    int gettext(int left, int top, int right, int bottom, void*destin)
    {
        if (destin == 0)
            return 0;
        char * pszText = (char *) destin;

        int count = 0;
        for (int k = top; (k <= bottom) && (*pszText); k++)
        {
            for (int i = left; (i <= right) && (*pszText); i++)
            {
                COORD point = {SHORT(i), SHORT(k)
                };

                TCHAR ch;
                DWORD c;
                ReadConsoleOutputCharacter(GetStdHandle(STD_OUTPUT_HANDLE), &ch, 1, point, &c);
                *pszText = ch;
                count++;
                pszText++;
            }
        }
        *pszText = 0;
        return count;
    }

    int puttext(int left, int top, int right, int bottom, const char*source)
    {
        if (source == 0)
            return 0;
        const char * pszText = (const char *) source;
        text_info ti;
        gettextinfo(&ti);
        int count = 0;
        for (int k = top; (k <= bottom) && (*pszText); k++)
        {
            for (int i = left; (i < right) && (*pszText); i++)
            {
                gotoxy(i, k);
                putch(*pszText);
                count++;
                pszText++;
            }
        }
        gotoxy(ti.curx, ti.cury);
        return count;
    }

    int textbackground(int newcolor)
    {
        text_info ti;
        gettextinfo(&ti);
        unsigned char wColor = ti.attribute;
        unsigned char old = getbits(wColor, 4, 4);
        setbits(wColor, 4, 4, newcolor);
        textattr(wColor);
        return old;
    }

    int textcolor(int newcolor)
    {
        text_info ti;
        gettextinfo(&ti);
        unsigned char wColor = ti.attribute;
        int old = getbits(wColor, 0, 4);
        setbits(wColor, 0, 4, newcolor);
        textattr(wColor);
        return old;
    }

    void highvideo()
    {
        text_info ti;
        gettextinfo(&ti);
        setbits(ti.attribute, 3, 1, 1);
        textattr(ti.attribute);
    }

    void lowvideo()
    {
        text_info ti;
        gettextinfo(&ti);
        setbits(ti.attribute, 3, 1, 0);
        textattr(ti.attribute);
    }

    void normvideo()
    {
        text_info ti;
        gettextinfo(&ti);
        setbits(ti.attribute, 3, 1, 0);
        setbits(ti.attribute, 7, 1, 0);
        textattr(ti.attribute);
    }

    int wherex()
    {
        text_info ti;
        gettextinfo(&ti);
        return ti.curx;
    }

    int wherey()
    {
        text_info ti;
        gettextinfo(&ti);
        return ti.cury;
    }

    void gotoxy(int x, int y)
    {
        COORD point = {SHORT(x), SHORT(y)};
        SetConsoleCursorPosition(GetStdHandle(STD_OUTPUT_HANDLE), point);
    }

    void clrscr()
    {
        COORD coordScreen = {0, 0};
        unsigned long cCharsWritten;
        CONSOLE_SCREEN_BUFFER_INFO csbi;
        unsigned long dwConSize;
        HANDLE hConsole = GetStdHandle(STD_OUTPUT_HANDLE);
        GetConsoleScreenBufferInfo(hConsole, &csbi);
        dwConSize = csbi.dwSize.X * csbi.dwSize.Y;
        FillConsoleOutputCharacter(hConsole, TEXT(' '), dwConSize, coordScreen, &cCharsWritten);
        GetConsoleScreenBufferInfo(hConsole, &csbi);
        FillConsoleOutputAttribute(hConsole, csbi.wAttributes, dwConSize, coordScreen, &cCharsWritten);
        SetConsoleCursorPosition(hConsole, coordScreen);
    }

    int ungetch(int ch)
    {
        return _ungetch(ch);
    }

} // namespace console

}}}

Utils
{{{cpp

void Box(int left, int top, int right, int bottom,
         int color = console::WHITE,
         char pattern = ' ')
{
  int i = console::textbackground(color); 
  console::text_info ti;
  console::gettextinfo(&ti);
  int count = 0;
  for (int k = top; (k <= bottom); k++)
  {
    for (int i = left; (i < right); i++)
    {
      console::gotoxy(i, k);
      console::putch(pattern);
    }
  }
  console::gotoxy(ti.curx, ti.cury);
  console::textbackground(i); 
}
```

![turboc.png]

http://www.dosbox.com/


Original Borland Turbo C header: CONIO.H


```cpp
/*  conio.h

    Direct MSDOS console input/output.

    Copyright (c) 1987, 1991 by Borland International
    All Rights Reserved.
*/

#if !defined(__CONIO_H)
#define __CONIO_H

#if !defined(__DEFS_H)
#include <_defs.h>
#endif

#define _NOCURSOR      0
#define _SOLIDCURSOR   1
#define _NORMALCURSOR  2

struct text_info {
    unsigned char winleft;
    unsigned char wintop;
    unsigned char winright;
    unsigned char winbottom;
    unsigned char attribute;
    unsigned char normattr;
    unsigned char currmode;
    unsigned char screenheight;
    unsigned char screenwidth;
    unsigned char curx;
    unsigned char cury;
};

enum text_modes { LASTMODE=-1, BW40=0, C40, BW80, C80, MONO=7, C4350=64 };

#if !defined(__COLORS)
#define __COLORS

enum COLORS {
    BLACK,          /* dark colors */
    BLUE,
    GREEN,
    CYAN,
    RED,
    MAGENTA,
    BROWN,
    LIGHTGRAY,
    DARKGRAY,       /* light colors */
    LIGHTBLUE,
    LIGHTGREEN,
    LIGHTCYAN,
    LIGHTRED,
    LIGHTMAGENTA,
    YELLOW,
    WHITE
};
#endif

#define BLINK       128 /* blink bit */

extern   int _Cdecl directvideo;
extern   int _Cdecl _wscroll;

#ifdef __cplusplus
extern "C" {
#endif

void        _Cdecl clreol( void );
void        _Cdecl clrscr( void );
void        _Cdecl gotoxy( int __x, int __y );
int         _Cdecl wherex( void );
int         _Cdecl wherey( void );
int         _Cdecl getch( void );
int         _Cdecl getche( void );
int         _Cdecl kbhit( void );
int         _Cdecl putch( int __c );

#ifndef _PORT_DEFS
int         _Cdecl inp( unsigned __portid );
unsigned    _Cdecl inpw( unsigned __portid );
int         _Cdecl outp( unsigned __portid, int __value );
unsigned    _Cdecl outpw( unsigned __portid, unsigned __value );
unsigned char _Cdecl inportb( int __portid );
void        _Cdecl outportb( int __portid, unsigned char __value );
#endif  /* !_PORT_DEFS */

int         _Cdecl inport( int __portid );
void        _Cdecl outport( int __portid, int __value );

void        _Cdecl delline( void );
int         _Cdecl gettext( int __left, int __top,
                            int __right, int __bottom,
                            void *__destin);
void        _Cdecl gettextinfo (struct text_info *__r );
void        _Cdecl highvideo( void );
void        _Cdecl insline( void );
void        _Cdecl lowvideo( void );
int         _Cdecl movetext( int __left, int __top,
                             int __right, int __bottom,
                             int __destleft, int __desttop );
void        _Cdecl normvideo( void );
int         _Cdecl puttext( int __left, int __top,
                            int __right, int __bottom,
                            void *__source );
void        _Cdecl textattr( int __newattr );
void        _Cdecl textbackground( int __newcolor );
void        _Cdecl textcolor( int __newcolor );
void        _Cdecl textmode( int __newmode );
void        _Cdecl window( int __left, int __top, int __right, int __bottom);

void        _Cdecl _setcursortype( int __cur_t );
char * _Cdecl cgets( char *__str );
int         _Cdecl cprintf( const char *__format, ... );
int         _Cdecl cputs( const char *__str );
int         _Cdecl cscanf( const char *__format, ... );
char * _Cdecl getpass( const char *__prompt );
int         _Cdecl ungetch( int __ch );

#ifndef _PORT_DEFS
#define _PORT_DEFS

    /* These are in-line functions.  These prototypes just clean up
       some syntax checks and code generation.
     */
unsigned char _Cdecl    __inportb__( int __portid );
unsigned int _Cdecl     __inportw__( int __portid );
void        _Cdecl      __outportb__( int __portid, unsigned char __value );
void        _Cdecl      __outportw__( int __portid, unsigned int __value );

#define inportb         __inportb__
#define inportw         __inportw__
#define outportb        __outportb__
#define outportw        __outportw__

#define inp( portid )      __inportb__( portid )
#define outp( portid,v )  (__outportb__( portid,v ), (int)_AL)
#define inpw( portid )     __inportw__( portid )
#define outpw( portid,v ) (__outportw__( portid,v ), (unsigned)_AX)

#endif  /* _PORT_DEFS */

#ifdef __cplusplus
}
#endif

#endif  /* __CONIO_H */

```
