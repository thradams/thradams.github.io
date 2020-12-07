
```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <sys/stat.h>
#include <ctype.h>
#include <Windows.h>

//https://github.com/pythonprobr/palavras
//https://github.com/dwyl/english-words

int make_words(char* inputtext, char* input[])
{
    /*dado uma string com palavras separadas
    por espcos este funcao coloca cada palavra
    no input e insere um 0 no terminio da palavra 
    */
    char* p = inputtext;
    int i = 0;

    while (p)
    {
        while (*p == ' ') p++;
        input[i] = p;
        i++;
        while (*p && *p != ' ') p++;
        if (*p == 0)
            break;
        *p = 0;
        p++;
    }

    return i;
}

char* readfile(const char* path)
{
    char* data = 0;
    bool result = false;
    struct stat info;
    int r = stat(
        path,
        &info);
    if (r == 0)
    {
        data = (char*)malloc(sizeof(char) * info.st_size + 1);
        if (data != NULL)
        {
            FILE* file = fopen(path, "r");
            if (file != NULL)
            {
                //SKIP BOM
                if (info.st_size >= 3)
                {
                    fread(data, 1, 3, file);
                    if (data[0] == (char)0xEF &&
                        data[1] == (char)0xBB &&
                        data[2] == (char)0xBF)
                    {
                        size_t n = fread(data, 1, info.st_size - 3, file);
                        data[n] = 0;
                    }
                    else
                    {
                        size_t n = fread(data + 3, 1, info.st_size - 3, file);
                        data[3 + n] = 0;
                    }
                }
                else
                {
                    size_t n = fread(data, 1, info.st_size, file);
                    data[n] = 0;
                }

                fclose(file);
                result = true;
                return data;
            }
        }
    }
    return data;
}

int findat(char* input[100], int inputsize, char* word, int wordsize, int n)
{
    int r = -1;

    if (n < inputsize && strncmp(input[n], word, wordsize) == 0)
    {
        r = n;
    }

    return r;
}


int findafter(char* input[100], int inputsize, char* word, int wordsize, int n)
{
    int r = -1;
    for (int i = n + 1; i < inputsize; i++)
    {
        if (n < inputsize && strncmp(input[i], word, wordsize) == 0)
        {
            r = i;
            break;
        }
    }
    return r;
}

int find(char* input[100], int inputsize, char* word, int wordsize)
{
    int r = -1;
    for (int i = 0; i < inputsize; i++)
    {
        if (strncmp(input[i], word, wordsize) == 0)
        {
            r = i;
            break;
        }
    }
    return r;
}

char* check2(char* patterns, char* input[100], int inputsize, int* sz)
{
    char* p = patterns;
    for (;;)
    {
        while (*p == ' ') p++;
        if (*p == '\n' || *p == 0)
        {
            return 0;
        }

        char op = *p;
        p++;

        int lastindex = -1;
        bool found = true;
        int wordcount = 0;
        while (*p == ' ') p++;
        while (*p != '-')
        {
            char* word = p;
            int wordsize = 0;
            while (*p && *p != ' ') {
                p++;  wordsize++;
            }
            if (op == '=')
            {
                //nesta ordem e posicao exata
                if (findat(input, inputsize, word, wordsize, wordcount) == -1)
                {
                    found = false;
                    break;
                }
            }
            else if (op == '~')
            {
                //achar estas palavras em qualquer posicao
                if (find(input, inputsize, word, wordsize) == -1)
                {
                    found = false;
                    break;
                }
            }
            else if (op == '>')
            {
                //achar em qualquer posicao mas na sequencia
                lastindex = findafter(input, inputsize, word, wordsize, lastindex);
                if (lastindex == -1)
                {
                    found = false;
                    break;
                }
            }
            while (*p == ' ') p++;
            wordcount++;
        }

        if (*p == '-')
        {
            p++;
            p++;
            while (*p == ' ') p++;

            if (found)
            {

                char* answer = p;
                //achou
                int wordsize = 0;
                while (*p && *p != '\n') {
                    p++;  wordsize++;
                }
                *sz = wordsize;
                return answer;
            }
        }
        else
        {
            while (*p && *p != '\n') {
                p++;
            }
            if (*p == 0)
                break;
            p++;
        }

    }
    return 0;
}

int main()
{
    SetConsoleOutputCP(CP_UTF8);
    char* patterns = readfile("rules.txt");
    if (patterns == NULL)
    {
        printf("error reading rules.txt");
        return 1;
    }

    char inputtext[1000] = { 0 };
    char* input[100] = { 0 };

    for (;;)
    {
        printf("> ");
        gets(inputtext);

        /*lower case*/
        for (int i = 0; inputtext[i]; i++) {
            inputtext[i] = tolower(inputtext[i]);
        }

        if (strcmp(inputtext, "reload") == 0)
        {
            /*reload rules*/
            free(patterns);

            patterns = readfile("rules.txt");
            printf("ok\n");
            continue;
        }

        int r = make_words(inputtext, input);

        int sz;
        char* answer = check2(patterns, input, r, &sz);
        if (answer)
        {
            printf("%.*s\n", sz, answer);
        }
        else
        {
            printf("sorry I dont have a answer\n");
        }
    }

    free(patterns);
    return 0;
}

```
