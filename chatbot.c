#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <sys/stat.h>
#include <ctype.h>

int make_words(char* inputtext, char* input[])
{
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

char* check(char* patterns, char* input[100], int inputsize, int* sz)
{
    char* p = patterns;

    for (;;)
    {
        if (*p == '\n' || *p == 0)
        {
            //emoty line stops
            return 0;
        }
        bool match = true;

        while (*p == ' ') p++;
        if (*p == '?') {
            p++; //skip ?
            p++; //skip =

            char* word = p;
            int wordsize = 0;
            while (*p && *p != ' ') {
                p++;  wordsize++;
            }

            bool found = false;
            for (int k = 0; k < inputsize; k++)
            {
                if (strncmp(input[k], word, wordsize) == 0)
                {
                    found = true;
                    break;
                }
            }
            if (!found)
                match = false;
            //?=make ?=cake
        }
        else if (isdigit(*p)) {
            int index = atoi(p);
            while (*p != '=') p++;
            p++;
            char* word = p;
            int wordsize = 0;
            while (*p && *p != ' ') {
                p++;  wordsize++;
            }

            if (index >= inputsize)
            {
                if (index == inputsize &&
                    wordsize == 1 && word[0] == '.')
                {
                    //ok
                }
                else
                {
                    match = false;
                }
            }
            else
            {
                if (strncmp(input[index], word, wordsize) != 0)
                {
                    match = false;
                }
            }
        }
        while (*p == ' ') p++;
        if (*p == '-')
        {
            p++;
            p++;
            while (*p == ' ') p++;

            if (match)
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
        if (!match)
        {
            while (*p != '\n' && *p) p++;
            if (*p == 0) break;
            p++;
        }
    }

    return 0;
}

int findat(char* input[100], int inputsize, char* word, int wordsize, int n)
{
    int r = -1;

    if (strncmp(input[n], word, wordsize) == 0)
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
        if (strncmp(input[i], word, wordsize) == 0)
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


/*
0=how 1=to 2=make 3=a 4=cake -> how to make a cake
?=make ?=cake -> how to make a cake
*/

int main()
{
    char* patterns = readfile("rules2.txt");
    if (patterns == NULL)
    {
        printf("error reading rules2.txt");
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
