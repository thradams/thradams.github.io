#include "stdafx.h"
#include "system.h"
#include <Windows.h>
#include "Strsafe.h"
#include <cassert>
#include <string>

std::wstring GetPath(const std::wstring &file)
{
  wchar_t drive[_MAX_DRIVE];
  wchar_t dir[_MAX_DIR];
  wchar_t fname[_MAX_FNAME];
  wchar_t ext[_MAX_EXT];

  _wsplitpath_s(file.c_str(), drive, dir, fname, ext); // C4996

  std::wstring path(drive);
  path += dir;
  return path;

}
int ForEachFile(const wchar_t* directory,
  const wchar_t* pszFilter,
  std::function<void(const wchar_t*)> userFunction)
{
  WIN32_FIND_DATA ffd;
  LARGE_INTEGER filesize;
  TCHAR szDir[MAX_PATH];
  size_t length_of_arg;
  HANDLE hFind = INVALID_HANDLE_VALUE;
  DWORD dwError = 0;


  StringCchLength(directory, MAX_PATH, &length_of_arg);

  if (length_of_arg > (MAX_PATH - 3))
  {
    assert(false);
    return (-1);
  }

  StringCchCopy(szDir, MAX_PATH, directory);
 // StringCchCat(szDir, MAX_PATH, TEXT("\\"));
  StringCchCat(szDir, MAX_PATH, pszFilter);
  

  hFind = FindFirstFile(szDir, &ffd);

  if (INVALID_HANDLE_VALUE == hFind)
  {
    assert(false);
    return dwError;
  }

  do
  {
    if (ffd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)
    {
      //Não é recursiva por enquanto ffd.cFileName
    }
    else
    {
      filesize.LowPart = ffd.nFileSizeLow;
      filesize.HighPart = ffd.nFileSizeHigh;

      userFunction(ffd.cFileName);
    }
  } while (FindNextFile(hFind, &ffd) != 0);

  dwError = GetLastError();
  if (dwError != ERROR_NO_MORE_FILES)
  {
    assert(false);
    return dwError;
  }

  FindClose(hFind);
  return 0;
}