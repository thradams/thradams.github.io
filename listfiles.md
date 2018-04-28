
```cpp

#include "stdafx.h"


#include "stdafx.h"
#include <windows.h>
#include <Strsafe.h>
#include <stdio.h>

bool ListFiles(const wchar_t *sDir,
	const wchar_t* exta[],
	int n,
	void(*Callback)(const wchar_t*,void*),
	void* data)
{
	WIN32_FIND_DATA fdFile;
	HANDLE hFind = NULL;

	wchar_t sPath[MAX_PATH];

	wsprintf(sPath, L"%s\\*.*", sDir);

	if ((hFind = FindFirstFile(sPath, &fdFile)) == INVALID_HANDLE_VALUE)
	{
		return false;
	}

	do
	{
		//Find first file will always return "."
		//    and ".." as the first two directories.
		if (wcscmp(fdFile.cFileName, L".") != 0
			&& wcscmp(fdFile.cFileName, L"..") != 0)
		{
			//Build up our file path using the passed in
			//  [sDir] and the file/foldername we just found:
			wsprintf(sPath, L"%s\\%s", sDir, fdFile.cFileName);

			if (fdFile.dwFileAttributes &FILE_ATTRIBUTE_DIRECTORY)
			{
				ListFiles(sPath, exta,n,Callback, data);
			}
			else
			{
				
				wchar_t drive[_MAX_DRIVE];
				wchar_t dir[_MAX_DIR];
				wchar_t fname[_MAX_FNAME];
				wchar_t ext[_MAX_EXT];

				_wsplitpath(sPath, drive, dir, fname, ext);
				for (int k = 0; k < n; k++)
				{
					if (wcscmp(exta[k], ext) == 0)
					{
						Callback(fdFile.cFileName, data);
						break;
					}
				}
				
			}
		}
	} while (FindNextFile(hFind, &fdFile));

	FindClose(hFind);

	return true;
}


void f(const wchar_t* fileName, void* data)
{
	printf("%ws\n", fileName);
}

int main()
{
	const wchar_t* ext[] = { L".h", L".cpp" };
	ListFiles(L".",ext, 2, &f, 0);
    return 0;
}

```
