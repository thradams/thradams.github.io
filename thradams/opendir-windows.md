# opendir windows

This code is a port of opendir. readdir and closedir for windows. (include dirent.h on linux)



```cpp

#include <Windows.h>

#include <sys/types.h>
#include <stdio.h>
#include <sys/stat.h>
#include <stdlib.h>
#include <string.h>

#ifdef _WINDOWS_


/*
 opendir,  readdir closedir for windows.
 include dirent.h on linux
*/

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

struct dirent
{
  ino_t d_ino;             /* Inode number */
  off_t d_off;             /* Not an offset; see below */
  unsigned short d_reclen; /* Length of this record */
  unsigned char d_type;    /* Type of file; not supported
                                   by all filesystem types*/
  char d_name[256];        /* Null-terminated filename */
};

typedef struct
{
  void *handle;
  struct dirent dirent;
} DIR;

DIR *opendir(const char *name);
int closedir(DIR *dirp);
struct dirent *readdir(DIR *dirp);

static int convert_windows_getlasterror_to_posix(int i)
{
  switch (i)
  {
  case ERROR_ACCESS_DENIED:
    return EACCES;
  case ERROR_ALREADY_EXISTS:
    return EEXIST;
  case ERROR_BAD_UNIT:
    return ENODEV;
  case ERROR_BUFFER_OVERFLOW:
    return ENAMETOOLONG;
  case ERROR_BUSY:
    return EBUSY;
  case ERROR_BUSY_DRIVE:
    return EBUSY;
  case ERROR_CANNOT_MAKE:
    return EACCES;
  case ERROR_CANTOPEN:
    return EIO;
  case ERROR_CANTREAD:
    return EIO;
  case ERROR_CANTWRITE:
    return EIO;
  case ERROR_CURRENT_DIRECTORY:
    return EACCES;
  case ERROR_DEV_NOT_EXIST:
    return ENODEV;
  case ERROR_DEVICE_IN_USE:
    return EBUSY;
  case ERROR_DIR_NOT_EMPTY:
    return ENOTEMPTY;
  case ERROR_DIRECTORY:
    return EINVAL;
  case ERROR_DISK_FULL:
    return ENOSPC;
  case ERROR_FILE_EXISTS:
    return EEXIST;
  case ERROR_FILE_NOT_FOUND:
    return ENOENT;
  case ERROR_HANDLE_DISK_FULL:
    return ENOSPC;
  case ERROR_INVALID_ACCESS:
    return EACCES;
  case ERROR_INVALID_DRIVE:
    return ENODEV;
  case ERROR_INVALID_FUNCTION:
    return ENOSYS;
  case ERROR_INVALID_HANDLE:
    return EINVAL;
  case ERROR_INVALID_NAME:
    return EINVAL;
  case ERROR_LOCK_VIOLATION:
    return ENOLCK;
  case ERROR_LOCKED:
    return ENOLCK;
  case ERROR_NEGATIVE_SEEK:
    return EINVAL;
  case ERROR_NOACCESS:
    return EACCES;
  case ERROR_NOT_ENOUGH_MEMORY:
    return ENOMEM;
  case ERROR_NOT_READY:
    return EAGAIN;
  case ERROR_NOT_SAME_DEVICE:
    return EXDEV;
  case ERROR_OPEN_FAILED:
    return EIO;
  case ERROR_OPEN_FILES:
    return EBUSY;
  case ERROR_OPERATION_ABORTED:
    return ECANCELED;
  case ERROR_OUTOFMEMORY:
    return ENOMEM;
  case ERROR_PATH_NOT_FOUND:
    return ENOENT;
  case ERROR_READ_FAULT:
    return EIO;
  case ERROR_RETRY:
    return EAGAIN;
  case ERROR_SEEK:
    return EIO;
  case ERROR_SHARING_VIOLATION:
    return EACCES;
  case ERROR_TOO_MANY_OPEN_FILES:
    return EMFILE;
  case ERROR_WRITE_FAULT:
    return EIO;
  case ERROR_WRITE_PROTECT:
    return EACCES;
  case WSAEACCES:
    return EACCES;
  case WSAEADDRINUSE:
    return EADDRINUSE;
  case WSAEADDRNOTAVAIL:
    return EADDRNOTAVAIL;
  case WSAEAFNOSUPPORT:
    return EAFNOSUPPORT;
  case WSAEALREADY:
    return EALREADY;
  case WSAEBADF:
    return EBADF;
  case WSAECONNABORTED:
    return ECONNABORTED;
  case WSAECONNREFUSED:
    return ECONNREFUSED;
  case WSAECONNRESET:
    return ECONNRESET;
  case WSAEDESTADDRREQ:
    return EDESTADDRREQ;
  case WSAEFAULT:
    return EFAULT;
  case WSAEHOSTUNREACH:
    return EHOSTUNREACH;
  case WSAEINPROGRESS:
    return EINPROGRESS;
  case WSAEINTR:
    return EINTR;
  case WSAEINVAL:
    return EINVAL;
  case WSAEISCONN:
    return EISCONN;
  case WSAEMFILE:
    return EMFILE;
  case WSAEMSGSIZE:
    return EMSGSIZE;
  case WSAENETDOWN:
    return ENETDOWN;
  case WSAENETRESET:
    return ENETRESET;
  case WSAENETUNREACH:
    return ENETUNREACH;
  case WSAENOBUFS:
    return ENOBUFS;
  case WSAENOPROTOOPT:
    return ENOPROTOOPT;
  case WSAENOTCONN:
    return ENOTCONN;
  case WSAENOTSOCK:
    return ENOTSOCK;
  case WSAEOPNOTSUPP:
    return EOPNOTSUPP;
  case WSAEPROTONOSUPPORT:
    return EPROTONOSUPPORT;
  case WSAEPROTOTYPE:
    return EPROTOTYPE;
  case WSAETIMEDOUT:
    return ETIMEDOUT;
  case WSAEWOULDBLOCK:
    return EWOULDBLOCK;
  }
  return EPERM;
}

DIR *opendir(const char *name)
{
  WIN32_FIND_DATAA fdFile;

  char sPath[MAX_PATH] = {0};
  strcat(sPath, name);
  strcat(sPath, "\\*.*");

  HANDLE handle = FindFirstFileA(sPath, &fdFile);

  if (handle != INVALID_HANDLE_VALUE)
  {
    DIR *p = calloc(1, sizeof *p);
    if (p)
    {
      p->handle = handle;
      return p;
    }
    else
    {
      /*calloc sets errno to ENOMEM if a memory allocation fails */
      FindClose(handle);      
    }
  }
  else
  {
    errno = convert_windows_getlasterror_to_posix(GetLastError());
  }

  return NULL;
}

int closedir(DIR *dirp)
{
  FindClose(dirp->handle);
  free(dirp);
  return 0;
}

struct dirent *readdir(DIR *dirp)
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
    errno = convert_windows_getlasterror_to_posix(GetLastError());
  }
  return NULL;
}

#endif //_WINDOWS_

int copy_file(const char *pathfrom,
              const char *pathto)
{
  char buf[4096];
  size_t nread;
  int saved_errno;

  FILE *fd_from = fopen(pathfrom, "rb");
  if (fd_from < 0)
    return -1;

  FILE *fd_to = fopen(pathto, "wb");
  if (fd_to < 0)
    goto out_error;

  while (nread = fread(buf, sizeof(char), sizeof buf, fd_from), nread > 0)
  {
    char *out_ptr = buf;
    size_t nwritten;

    do
    {
      nwritten = fwrite(out_ptr, sizeof(char), nread, fd_to);

      if (nwritten >= 0)
      {
        nread -= nwritten;
        out_ptr += nwritten;
      }
      else
      {
        goto out_error;
      }
    } while (nread > 0);
  }

  if (nread == 0)
  {
    if (fclose(fd_to) < 0)
    {
      fd_to = NULL;
      goto out_error;
    }
    fclose(fd_from);

    /* Success! */
    return 0;
  }

out_error:
  saved_errno = errno;

  fclose(fd_from);

  if (fd_to != NULL)
    fclose(fd_to);

  return saved_errno;
}

int copy_folder(const char *from, const char *to)
{
  int errcode = _mkdir(to);
  if (errcode != 0)
  {
    return errcode;
  }
  
  DIR *dir = opendir(from);

  if (dir == NULL)
  {
    return errno;
  }

  struct dirent *dp;
  while ((dp = readdir(dir)) != NULL)
  {
    if (strcmp(dp->d_name, ".") == 0 || strcmp(dp->d_name, "..") == 0)
    {
      /* skip self and parent */
      continue; 
    }

    char fromlocal[MAX_PATH];
    snprintf(fromlocal, MAX_PATH, "%s/%s", from, dp->d_name);

    char tolocal[MAX_PATH];
    snprintf(tolocal, MAX_PATH, "%s/%s", to, dp->d_name);

    if (dp->d_type & DT_DIR)
    {
        errcode = copy_folder(fromlocal, tolocal);
    }
    else
    {
      errcode = copy_file(fromlocal, tolocal);
    }

    if (errcode != 0)
      break;
  }

  closedir(dir);
  return errcode;
}

int main(void)
{
  char buffer[200];
  _getcwd(buffer, 200);
  printf("%s\n", buffer);

  int errcode = copy_folder("from", "to");

  return EXIT_SUCCESS;
}

```

