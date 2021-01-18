# opendir windows

This is a port of opendir for windows.

This code only works for the cases you test.

dirent.h

```cpp
#pragma once

#include <sys/types.h>

/* File types for `d_type'.  */
enum
{
    DT_UNKNOWN = 0,
    DT_FIFO = 1,
    DT_CHR = 2,
    DT_DIR = 4,
    DT_BLK = 6,
    DT_REG = 8,
    DT_LNK = 10,
    DT_SOCK = 12,
    DT_WHT = 14
};


struct dirent {
    ino_t          d_ino;       /* Inode number */
    off_t          d_off;       /* Not an offset; see below */
    unsigned short d_reclen;    /* Length of this record */
    unsigned char  d_type;      /* Type of file; not supported
                                   by all filesystem types*/
    char           d_name[256]; /* Null-terminated filename */
};

typedef struct DIRINFO DIR;

//https://www.man7.org/linux/man-pages/man3/fdopendir.3.html
DIR* opendir(const char* name);

int closedir(DIR* dirp);
struct dirent* readdir(DIR* dirp);

```

dirent.c

```cpp

#include "dirent.h"
#include <Windows.h>

#define DT_BLK 1 //This is a block device.
#define DT_CHR 2 //This is a character device.
#define DT_DIR 3 //This is a directory.
#define DT_FIFO 4//This is a named pipe(FIFO).
#define DT_LNK 5//This is a symbolic link.
#define DT_REG 6//This is a regular file.
#define DT_SOCK 7//This is a UNIX domain socket.
#define DT_UNKNOWN 8//

struct DIRINFO {
    HANDLE handle;
    struct dirent dirent;
};

DIR* opendir(const char* name)
{
    WIN32_FIND_DATAA fdFile;

    char sPath[MAX_PATH] = { 0 };
    strcat(sPath, name);
    strcat(sPath, "\\*.*");

    HANDLE handle = FindFirstFileA(sPath, &fdFile);

    if (handle != INVALID_HANDLE_VALUE)
    {
        struct DIRINFO* p = calloc(1, sizeof * p);
        if (p)
        {
            p->handle = handle;
            return p;
        }
        else
        {
            FindClose(handle);
        }
    }
    else
    {
        errno = GetLastError();
    }

    return NULL;
}

int closedir(DIR* dirp)
{
    FindClose(dirp->handle);
    free(dirp);
    return 0;
}

struct dirent* readdir(DIR* dirp)
{
    WIN32_FIND_DATAA fdFile;
    BOOL b = FindNextFileA(dirp->handle, &fdFile);
    if (b)
    {

        if (fdFile.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)
        {
            dirp->dirent.d_type = DT_DIR;
        }
        else
        {
            dirp->dirent.d_type = DT_REG;
        }

        strcpy(dirp->dirent.d_name, fdFile.cFileName);
        return &dirp->dirent;
    }

    return NULL;
}


```

sample

```cpp
#include <stdio.h>

#include <sys/types.h>
#include "dirent.h"
#include <stdlib.h>


int main(void)
{
    DIR* dirp;
    struct dirent* direntp;

    dirp = opendir("C:/Users/thiago/source/repos/iteratedir/");
    if (dirp == NULL) {
        perror("can't open /home/fred");
    }
    else {
        for (;;) {
            direntp = readdir(dirp);
            if (direntp == NULL) break;

            printf("%s\n", direntp->d_name);

            if (direntp->d_type == DT_DIR)
            {
            }
        }

        closedir(dirp);
    }

    return EXIT_SUCCESS;
}
```
