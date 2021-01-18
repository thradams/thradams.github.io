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

typedef struct {
    void* handle;
    struct dirent dirent;
} DIR;


//https://www.man7.org/linux/man-pages/man3/fdopendir.3.html
DIR* opendir(const char* name);

int closedir(DIR* dirp);
struct dirent* readdir(DIR* dirp);

```

dirent.c

```cpp


#include "dirent.h"
#include <Windows.h>


DIR* opendir(const char* name)
{
    WIN32_FIND_DATAA fdFile;

    char sPath[MAX_PATH] = { 0 };
    strcat(sPath, name);
    strcat(sPath, "\\*.*");

    HANDLE handle = FindFirstFileA(sPath, &fdFile);

    if (handle != INVALID_HANDLE_VALUE)
    {
        DIR* p = calloc(1, sizeof * p);
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
        /*clear*/
        memset(&dirp->dirent, 0, sizeof(dirp->dirent));

        
        if (fdFile.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)
        {
            dirp->dirent.d_type |= DT_DIR;
        }
         
        /*worst case trunks the string*/
        strncpy(dirp->dirent.d_name,
                fdFile.cFileName,
                sizeof(dirp->dirent.d_name) - 1);

        return &dirp->dirent;
    }
    else
    {
        errno = GetLastError();
    }
    return NULL;
}



```

sample

```cpp
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include "dirent.h"
#include <stdlib.h>
#include <string.h>

#define MAX_PATH 1024

//int stat(char*, struct stat*);
void dirwalk(char*, void (*fcn)(char*));

/* fsize:  print size of file "name" */
void fsize(char* name)
{
    struct stat stbuf;

    if (stat(name, &stbuf) == -1) {
        fprintf(stderr, "fsize: can't access %s\n", name);
        return;
    }
    if ((stbuf.st_mode & S_IFMT) == S_IFDIR)
        dirwalk(name, fsize);
    printf("%8ld %s\n", stbuf.st_size, name);
}


/* dirwalk:  apply fcn to all files in dir */
void dirwalk(char* dir, void (*fcn)(char*))
{
	char name[MAX_PATH];
	struct dirent* dp;
	DIR* dfd;

	if ((dfd = opendir(dir)) == NULL) {
		fprintf(stderr, "dirwalk: can't open %s\n", dir);
		return;
	}
	while ((dp = readdir(dfd)) != NULL) {
		if (strcmp(dp->d_name, ".") == 0
			|| strcmp(dp->d_name, "..") == 0)
			continue;	/* skip self and parent */
		if (strlen(dir) + strlen(dp->d_name) + 2 > sizeof(name))
			fprintf(stderr, "dirwalk: name %s/%s too long\n",
					dir, dp->d_name);
		else {
			sprintf(name, "%s%s", dir, dp->d_name);
			(*fcn)(name);
		}
	}
	closedir(dfd);
}

void callback(const char* name)
{
	printf("%s\n", name);
}

int main(void)
{

	fsize("C:/Users/thiago/source/repos/iteratedir/");
    
    return EXIT_SUCCESS;
}

```
