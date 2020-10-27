
Adding double buffer for conio.h

TODO release resources and linux implementation

```cpp
#include "conio.h"

void edit(int x, int y, int w, char* buffer)
{
	c_textcolor(WHITE);
	c_textbackground(BLUE);

	c_gotoxy(x, y);
	for (int i = 0; i < w; i++)
	{
		if (*buffer)
		{
			c_printf("%c", *buffer);
			buffer++;
		}
		else
			c_printf(" ");
		
	}

	
}

void screen()
{
	edit(2, 1, 10, "teste");
	edit(2, 3, 10, "teste2");
	

}

int main(void)
{
	c_init();
	
	int i = 0;
	int j = 1;
	while (1) {
		
		c_begin();


		c_textcolor(WHITE);
		c_textbackground(GREEN);
		c_clrscr();
		
		screen();

		//for (int i = 1 ; i < j; i++)
//		  c_printf("A");
		
		c_end();

		j++;
		Sleep(30);
		if (j == 50)
			j = 1;
	}

	c_destroy();

	return 0;
}
```



```cpp
#pragma once

extern HANDLE hConsole;//; GetStdHandle(STD_OUTPUT_HANDLE);

enum COLORS
{
  BLACK = 0,
  BLUE = 1,
  GREEN = 2,
  CYAN = 3,
  RED = 4,
  MAGENTA = 5,
  BROWN = 6,
  LIGHTGRAY = 7,
  DARKGRAY = 8,
  LIGHTBLUE = 9,
  LIGHTGREEN = 10,
  LIGHTCYAN = 11,
  LIGHTRED = 12,
  LIGHTMAGENTA = 13,
  YELLOW = 14,
  WHITE = 15,
  BLINK = 128
};

enum CURSORTYPE
{
  _NOCURSOR,//     turns off the cursor
  _SOLIDCURSOR,//  solid block cursor
  _NORMALCURSOR // normal underscore cursor
};

struct text_info
{
  unsigned char attribute;      /* text attribute */
  unsigned char normattr;       /* normal attribute */
  int screenheight;   /* text screen's height */
  int screenwidth;    /* text screen's width */
  int curx;           /* x-coordinate in current window */
  int cury;           /* y-coordinate in current window */
};



int   c_getch(void);
int   c_getche(void);
int   c_kbhit(void);

void  c_clrscr();
void  c_gotoxy(int x, int y);
void  c_setcursortype(int cur_t);
void  c_textbackground(int newcolor);
void  c_textcolor(int newcolor);
int   c_wherex(void);
int   c_wherey(void);
void  c_gettextinfo(struct text_info *r);
void  c_textattr(int newattr);

void c_init();
void c_destroy();
void c_begin();
void c_end();
void c_printf(const char* format, ...);
```

```cpp


#ifdef _WIN32



#include <windows.h>
#include <conio.h>
#include "conio.h"
#include <limits.h>
#include <stdio.h>

HANDLE hNewScreenBuffer = 0;
HANDLE hNewScreenBuffer2 = 0;


void c_init()
{
    struct text_info ti;
    c_gettextinfo(&ti);

    hNewScreenBuffer = CreateConsoleScreenBuffer(
        GENERIC_WRITE | GENERIC_READ,
        0,
        NULL,                    // default security attributes 
        CONSOLE_TEXTMODE_BUFFER, // must be TEXTMODE 
        NULL);                   // reserved; must be NULL 


    hNewScreenBuffer2 = CreateConsoleScreenBuffer(
        GENERIC_WRITE | GENERIC_READ,
        0,
        NULL,                    // default security attributes 
        CONSOLE_TEXTMODE_BUFFER, // must be TEXTMODE 
        NULL);                   // reserved; must be NULL 


    COORD coordBufSize = { ti.screenwidth, ti.screenheight };
    SetConsoleScreenBufferSize(hNewScreenBuffer, coordBufSize);


    SMALL_RECT srctWriteRect = { 0 };
    srctWriteRect.Right = ti.screenwidth - 1;
    srctWriteRect.Bottom = ti.screenheight - 1;

    SetConsoleWindowInfo(hNewScreenBuffer, TRUE, &srctWriteRect);

    SetConsoleScreenBufferSize(hNewScreenBuffer2, coordBufSize);
    SetConsoleWindowInfo(hNewScreenBuffer2, TRUE, &srctWriteRect);

    
}

void c_begin()
{
    
}

void c_destroy()
{
}

void c_printf(const char* format, ...)
{
    char buffer[1000];

    va_list args;
    va_start(args, format);
    int n = vsnprintf(buffer, 1000, format, args);
    va_end(args);

    int numberOfCharsWritten;
    WriteConsoleA(
        hConsole,
        buffer,
        n,
        &numberOfCharsWritten,
        0);
}

void c_end()
{

    SetConsoleActiveScreenBuffer(hConsole);


    if (hConsole == hNewScreenBuffer2)
    {
        hConsole = hNewScreenBuffer;
    }
    else
    {
        hConsole = hNewScreenBuffer2;
    }
}


HANDLE hConsole = 0;//GetStdHandle(STD_OUTPUT_HANDLE);

static void clearbits(unsigned char * v,
  int bit_index,
  int nbits)
{
  unsigned mask = ~((unsigned char)(0)) << (sizeof(v) * CHAR_BIT - (unsigned char)(nbits));
  mask = mask >> (sizeof(v) * CHAR_BIT - (unsigned char)(bit_index)-(unsigned char)(nbits));
  *v &= ~mask;
}


static void setbits(unsigned char *v,
  int bit_index,
  int nbits,
  unsigned char number)
{
  clearbits(&number, nbits, sizeof(number) * CHAR_BIT - nbits);

  unsigned char big = number;
  big = (big << bit_index);

  clearbits(v, bit_index, nbits);
  *v |= big;
}


static unsigned char getbits(unsigned char v, int bit_index, int nbits)
{
  unsigned char r = v >> bit_index;
  clearbits(&r, nbits, sizeof(unsigned char) * CHAR_BIT - nbits);
  return r;
}


void c_gettextinfo(struct text_info *r)
{
  if (hConsole == NULL)
    hConsole = GetStdHandle(STD_OUTPUT_HANDLE);

  if (r == 0)
    return;

  CONSOLE_SCREEN_BUFFER_INFO csbi;
  if (GetConsoleScreenBufferInfo(hConsole, &csbi))
  {

      r->attribute = (unsigned char)csbi.wAttributes;
      r->curx = (unsigned char)csbi.dwCursorPosition.X;
      r->cury = (unsigned char)csbi.dwCursorPosition.Y;
      r->screenwidth = (unsigned char)csbi.dwMaximumWindowSize.X;
      r->screenheight = (unsigned char)csbi.dwMaximumWindowSize.Y;
      r->normattr = 0;
  }
  else
  {
      int e = GetLastError();
      e = 0;
  }
}

int c_kbhit(void)
{
  return _kbhit();
}
int c_getch(void)
{
  return _getch();
}

int c_getche(void)
{
  return _getche();
}

void c_setcursortype(int cur_t)
{
    if (hConsole == NULL)
        hConsole = GetStdHandle(STD_OUTPUT_HANDLE);

  CONSOLE_CURSOR_INFO ci;

  switch (cur_t)
  {
  case _NOCURSOR://     (turns off the cursor)
    ci.bVisible = FALSE;
    ci.dwSize = 1;
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

  SetConsoleCursorInfo(hConsole, &ci);
}

void c_textattr(int newattr)
{
    if (hConsole == NULL)
        hConsole = GetStdHandle(STD_OUTPUT_HANDLE);

  SetConsoleTextAttribute(hConsole, newattr);
}

void c_textbackground(int newcolor)
{
    
  struct text_info ti;
  c_gettextinfo(&ti);
  unsigned char wColor = ti.attribute;
  unsigned char old = getbits(wColor, 4, 4);
  setbits(&wColor, 4, 4, newcolor);
  c_textattr(wColor);
}

void c_textcolor(int newcolor)
{
  struct text_info ti;
  c_gettextinfo(&ti);
  unsigned char wColor = ti.attribute;
  int old = getbits(wColor, 0, 4);
  setbits(&wColor, 0, 4, newcolor);
  c_textattr(wColor);
}


int c_wherex()
{
  CONSOLE_SCREEN_BUFFER_INFO cbsi;
  if (GetConsoleScreenBufferInfo(hConsole, &cbsi))
  {
    return cbsi.dwCursorPosition.X + 1;
  }
  return -1;
}

int c_wherey()
{
    if (hConsole == NULL)
        hConsole = GetStdHandle(STD_OUTPUT_HANDLE);

  CONSOLE_SCREEN_BUFFER_INFO cbsi;
  if (GetConsoleScreenBufferInfo(hConsole, &cbsi))
  {
    return cbsi.dwCursorPosition.Y;
  }
  return -1;
}

void c_gotoxy(int x, int y)
{
    if (hConsole == NULL)
        hConsole = GetStdHandle(STD_OUTPUT_HANDLE);

  COORD point;
  point.X = x - (short)1;
  point.Y = y;
  SetConsoleCursorPosition(hConsole, point);
}

void c_clrscr()
{
    if (hConsole == NULL)
        hConsole = GetStdHandle(STD_OUTPUT_HANDLE);

  COORD coordScreen = { 0, 0 };
  unsigned long cCharsWritten;
  CONSOLE_SCREEN_BUFFER_INFO csbi;
  unsigned long dwConSize;
  //HANDLE hConsole = GetStdHandle(STD_OUTPUT_HANDLE);
  GetConsoleScreenBufferInfo(hConsole, &csbi);
  dwConSize = csbi.dwSize.X * csbi.dwSize.Y;
  FillConsoleOutputCharacter(hConsole, TEXT(' '), dwConSize, coordScreen, &cCharsWritten);
  GetConsoleScreenBufferInfo(hConsole, &csbi);
  FillConsoleOutputAttribute(hConsole, csbi.wAttributes, dwConSize, coordScreen, &cCharsWritten);
  SetConsoleCursorPosition(hConsole, coordScreen);
}



#elif __linux__


#include <stdio.h>
#include <termios.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include "conio.h"

int c_kbhit(void)
{
  struct termios oldt, newt;
  int ch;
  int oldf;

  tcgetattr(STDIN_FILENO, &oldt);
  newt = oldt;
  newt.c_lflag &= ~(ICANON | ECHO);
  tcsetattr(STDIN_FILENO, TCSANOW, &newt);
  oldf = fcntl(STDIN_FILENO, F_GETFL, 0);
  fcntl(STDIN_FILENO, F_SETFL, oldf | O_NONBLOCK);

  ch = getchar();

  tcsetattr(STDIN_FILENO, TCSANOW, &oldt);
  fcntl(STDIN_FILENO, F_SETFL, oldf);

  if (ch != EOF)
  {
    ungetc(ch, stdin);
    return 1;
  }

  return 0;
}


static int getCursorPosition2(int *x, int *y)
{
  *x = -1;
  *y = -1;

  char buf[32];
  unsigned int i = 0;
  int ch;

  printf("\x1B[6n");

  while (i < sizeof(buf) - 1)
  {
    ch = c_getch();
    if (ch == EOF || ch == 'R') break;
    buf[i++] = ch;
  }
  buf[i] = '\0';

  if (buf[0] != '\x1b' || buf[1] != '[') return -1;

  if (sscanf(&buf[2], "%d;%d", y, x) != 2) return -1;

  return 0;
}

int c_wherex(void)
{
  int x, y;
  getCursorPosition2(&x, &y);
  return x;
}

int c_wherey(void)
{
  int x, y;
  getCursorPosition2(&x, &y);
  return y;
}


void c_gotoxy(int x, int y)
{
  printf("\x1b[%d;%dH", y, x);
  fflush(stdout);
}

void c_clrscr()
{
  puts("\x1b[2J\x1b[1;1H");
  fflush(stdout);
}

void c_textcolor(int newcolor)
{
  //https://en.wikipedia.org/wiki/ANSI_escape_code

  const char * s = "\x1b[30m";

  switch (newcolor)
  {
  case BLACK:
    s = "\x1b[30m";
    break;

  case BLUE:
    s = "\x1b[34m";
    break;

  case GREEN:
    s = "\x1b[32m";
    break;

  case CYAN:
    s = "\x1b[36m";
    break;

  case RED:
    s = "\x1b[31;1m";
    break;

  case MAGENTA:
    s = "\x1b[35m";
    break;

  case BROWN:
    s = "\x1b[31m";
    break;

  case LIGHTGRAY:
    s = "\x1b[30;1m";
    break;

  case DARKGRAY:
    s = "\x1b[30m";
    break;

  case LIGHTBLUE:
    s = "\x1b[34;1m";
    break;

  case LIGHTGREEN:
    s = "\x1b[32,1m";;
    break;

  case LIGHTCYAN:
    s = "\x1b[36;1m";
    break;

  case LIGHTRED:
    s = "\x1b[31;1m";
    break;

  case LIGHTMAGENTA:
    s = "\x1b[35;1m";
    break;

  case YELLOW:
    s = "\x1b[33;1m";
    break;

  case WHITE:
    s = "\x1b[37;1m";
    break;

  case BLINK:
    s = "\x1b[30m";
    break;
  };

  printf("%s", s);
}

void c_textbackground(int newcolor)
{
  //https://en.wikipedia.org/wiki/ANSI_escape_code

  const char * s = "\x1b[40m";

  switch (newcolor)
  {
  case BLACK:
    s = "\x1b[40m";
    break;

  case BLUE:
    s = "\x1b[44m";
    break;

  case GREEN:
    s = "\x1b[42m";
    break;

  case CYAN:
    s = "\x1b[46m";
    break;

  case RED:
    s = "\x1b[41;1m";
    break;

  case MAGENTA:
    s = "\x1b[45m";
    break;

  case BROWN:
    s = "\x1b[41m";
    break;

  case LIGHTGRAY:
    s = "\x1b[40;1m";
    break;

  case DARKGRAY:
    s = "\x1b[40m";
    break;

  case LIGHTBLUE:
    s = "\x1b[44;1m";
    break;

  case LIGHTGREEN:
    s = "\x1b[42,1m";;
    break;

  case LIGHTCYAN:
    s = "\x1b[46;1m";
    break;

  case LIGHTRED:
    s = "\x1b[41;1m";
    break;

  case LIGHTMAGENTA:
    s = "\x1b[45;1m";
    break;

  case YELLOW:
    s = "\x1b[43;1m";
    break;

  case WHITE:
    s = "\x1b[47;1m";
    break;

  case BLINK:
    s = "\x1b[40m";
    break;
  };

  puts(s);
}


/* Read 1 character - echo defines echo mode */
/*
static char getch_(int echo)
{
  struct termios old, new;
  int ch;

  tcgetattr(0, &old);

  new = old;
  new.c_lflag &= ~ICANON;
  if (!echo)
  {
    new.c_lflag &= ~ECHO;
  }
  tcsetattr(0, TCSANOW, &new);

  ch = getchar();

  tcsetattr(0, TCSANOW, &old);

  return ch;
}
*/

/* Read 1 character without echo */
int c_getch(void)
{
  struct termios old, new;
  int ch;

  tcgetattr(0, &old);

  new = old;
  new.c_lflag &= ~ICANON;
  new.c_lflag &= ~ECHO;
  tcsetattr(0, TCSANOW, &new);

  ch = getchar();

  tcsetattr(0, TCSANOW, &old);

  return ch;
}

/* Read 1 character with echo */
int c_getche(void)
{
  struct termios old, new;
  int ch;

  tcgetattr(0, &old);

  new = old;
  new.c_lflag &= ~ICANON;
  //new.c_lflag &= ~ECHO;
  tcsetattr(0, TCSANOW, &new);

  ch = getchar();

  tcsetattr(0, TCSANOW, &old);
  return ch;
}


void c_setcursortype(int cur_t)
{
  switch (cur_t)
  {
  case _NOCURSOR:
    printf("\x1b[?25l");
    break;

  case _NORMALCURSOR:
    printf("\x1b[?25h");
    break;

  case _SOLIDCURSOR://TODO
    printf("\x1b[?25h");
    break;
  }
}

void c_gettextinfo(struct text_info *r)
{

  struct winsize w;
  ioctl(0, TIOCGWINSZ, &w);

  r->screenheight = w.ws_row;
  r->screenwidth = w.ws_col;

  int x, y;
  getCursorPosition2(&x, &y);


  r->curx = x;
  r->cury = y;

}

void c_textattr(int newattr)
{
  //tODO
}

#endif //linux

```


