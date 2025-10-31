
#include "build.h"
//#include "fs.h"
#include "fs.c"

void generate_doc(const char* mdfilename, const char* outfile)
{
    const char* header =
        "<!DOCTYPE html>\n"
        "<html>\n"
        "<head>\n"
        "   <link rel=\"stylesheet\" href=\"style.css\" />\n"
        "  <link rel=\"stylesheet\" href = \"default.min.css\">\n"
        "  <script src = \"highlight.min.js\"></script>\n"
        "  <script>hljs.highlightAll(); </script>\n"
        " <link rel = \"stylesheet\" href = \"style.css\"/>\n"
        "</head>\n"
        "<body>\n";
    

    FILE* f2 = fopen(outfile /*"./web/index.html"*/, "w");
    if (f2)
    {
        fputs(header, f2);
        if (strcmp(mdfilename, "index.md") != 0)
        {
            const char* menu = "<a class = \"linkbox\" href = \"index.html\" > HOME</a>\n";
            fputs(menu, f2);
        }
        
        
        fclose(f2);
    }
    char cmd[200];
    //snprintf(cmd, sizeof cmd, RUN "hoedown.exe --html-toc --toc-level 2 --autolink --fenced-code %s >> %s", mdfilename, outfile);
    //if (system(cmd) != 0) exit(1);

    snprintf(cmd, sizeof cmd, RUN "hoedown.exe  --toc-level 2 --autolink --fenced-code %s >> %s", mdfilename, outfile);
    if (system(cmd) != 0) exit(1);

    FILE* f3 = fopen(outfile /*"./web/index.html"*/, "a");
    if (f3)
    {
        fwrite("</body></html>", 1, strlen("</body></html>"), f3);
        fclose(f3);
    }
}


#define try  if (1)
#define catch else catch_label:
#define throw goto catch_label

char* dirname(char* path)
{
    int last = -1;
    for (int i = 0; path[i]; i++)
    {
        if (path[i] == '\\' || path[i] == '/')
            last = i;
    }

    if (last != -1)
    {
        path[last] = 0;
    }
    return path;
}

static int endsWith(const char* string, const char* tail)
{
    const char* s1;
    const char* s2;

    if (!*tail)
        return 1;
    if (!*string)
        return 0;
    for (s1 = string; *s1; ++s1);
    for (s2 = tail; *s2; ++s2);
    if (s1 - string < s2 - tail)
        return 0;
    for (--s1, --s2; *s1 == *s2 && s2 >= tail; --s1, --s2);
    if (s2 < tail)
        return 1;
    else
        return 0;
}

int main()
{
    if (chdir("tools") != 0)
    {
        printf("error ao entrar em tools");
    }

    chdir("./hoedown");

#define HOEDOWN_SRC " autolink.c buffer.c document.c escape.c hoedown.c html.c html_blocks.c html_smartypants.c stack.c version.c"

    if (system("cl " HOEDOWN_SRC  " -o ../../../hoedown.exe") != 0) exit(1);

    chdir("..");
    chdir("..");
    chdir("..");

    //generate_doc("./manual.md", "./manual.html");
    //generate_doc("./about.md", "./about.html");

    DIR* dir = NULL;
    
    try
    {
    
        dir = opendir("./");
        if (dir == NULL)
        {            
                throw;            
        }

        struct dirent* dp;
        while (dir && (dp = readdir(dir)) != NULL)
        {
            if (strcmp(dp->d_name, ".") == 0 || strcmp(dp->d_name, "..") == 0)
            {
                /* skip self and parent */
                continue;
            }

            if (dp->d_type & DT_DIR)
            {
                continue;
            }
            
            if (endsWith(dp->d_name, ".md"))
            {
                printf("%s\n", dp->d_name);
                char outname[200] = { 0 };
                strcat(outname, dp->d_name);
                outname[strlen(outname) - 2] = 0;
                strcat(outname, "html");
                printf("%s\n", outname);

                generate_doc(dp->d_name, outname);
            }

            
        }
    }
    catch
    {
    }


    if (dir != NULL)
    {
        closedir(dir);
    }

    return EXIT_SUCCESS;
}
