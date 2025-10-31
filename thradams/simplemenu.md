Simple popup menu sample in Windows.

{{{cpp
  int ShowPopupMenu(HWND hWnd,
                    int x,
                    int y,
                    const std::vector<std::wstring>& items)
  {
    HMENU hMenu = CreatePopupMenu();

    for(int i = 0; i < items.size(); i++)
    {
      AppendMenu(hMenu, MF_STRING, i + 1, items[i].c_str());
    }

    POINT pt = {x, y};
    ClientToScreen(hWnd, &pt);
    BOOL b =  TrackPopupMenu(hMenu,
      TPM_LEFTALIGN |TPM_RETURNCMD,
      pt.x,
      pt.y,
      0,
      m_hWnd,
      0);

    DestroyMenu(hMenu);    
    return b;
  }

  void OnMouseDown(int xPos, int yPos)
  {     
    std::vector<std::wstring> items;
    items.push_back(L"Item1");
    items.push_back(L"Item2");
    items.push_back(L"Item3");
    ShowPopupMenu(m_hWnd, xPos, yPos, items);
  }
}}}
