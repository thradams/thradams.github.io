
Utf8 file to wchar_t buffer, and wchar_t* to utf8 file.


```cpp

long int get_file_size(FILE* hFile)
{
  //TODO not byte size.. but chars size.
    fseek(hFile, 0L, SEEK_END);
    long int sz = ftell(hFile);
    fseek(hFile, 0L, SEEK_SET);
    return sz;
}

size_t ftowstr(FILE *hFile, wchar_t** ppszOut)
{
    long int sz = get_file_size(hFile);
    *ppszOut = (wchar_t*) malloc((sizeof(wchar_t) * sz) + 1);
    
    wint_t c;
    size_t n = 0;
    while ((c = fgetwc(hFile)) != WEOF)
    {
        (*ppszOut)[n++] = c;
    }
    (*ppszOut)[n] = 0;
    return n;
}

size_t string_to_file(char* pszFileName, wchar_t* psz, size_t len)
{
    FILE *hFile = fopen(pszFileName, "w, ccs=UTF-8");
    if (hFile)
    {
        fwrite(psz, sizeof(wchar_t), len, hFile );
        fclose(hFile);
        return len;
    }
    return 0;
}

size_t file_to_string(char* fileName, wchar_t** strBuffer)
{
    FILE *hFile = fopen(fileName, "r, ccs=UTF-8");
    if (hFile)
    {   
        size_t n = ftowstr(hFile, strBuffer);
        fclose(hFile);
        return n;
    }
    return 0;
}

int main(void)
{
    wchar_t *pstrBuffer;
    size_t n = file_to_string("c:\\test.txt", &pstrBuffer);
    if (n)
    {
        printf("%S", pstrBuffer);
        
        string_to_file("c:\\test2.txt", pstrBuffer, n);

        free(pstrBuffer);
    }
    
    return EXIT_SUCCESS;
}

```


