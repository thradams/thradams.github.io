#pragma once
#include <functional>

std::wstring GetPath(const std::wstring &file);

int ForEachFile(const wchar_t* directory,
  const wchar_t* pszFilter,
  std::function<void(const wchar_t*)> userFunction);