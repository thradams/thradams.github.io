Code made with chatgpt. 

```c
#include <stdio.h>
#include <string.h>
#include <ctype.h>

static void print_ansi(const char *s) { printf("%s", s); }
static void reset() { print_ansi("\033[0m"); }

// Forward declarations
static void render_inline(const char *line);

void md_print(const char *text) {
    const char *p = text;
    char line[1024] = {0};
    int in_code_block = 0;

    while (*p) {
        // Read one line
        size_t len = 0;
        while (p[len] && p[len] != '\n' && len < sizeof(line)-1)
        {       line[len] = p[len];
        len++;
    }
        line[len] = '\0';
        p += len;
        if (*p == '\n') p++;

        // Check for fenced code block ```
        if (strncmp(line, "```", 3) == 0) {
            in_code_block = !in_code_block;
            if (in_code_block)
                print_ansi("\033[90m"); // gray
            else
                reset(), putchar('\n');
            continue;
        }

        if (in_code_block) {
            printf("%s\n", line);
            continue;
        }

        // Trim leading spaces
        const char *s = line;
        while (isspace((unsigned char)*s)) s++;

        // Skip empty line
        if (*s == '\0') { putchar('\n'); continue; }

        // Horizontal rule
        if ((strncmp(s, "---", 3) == 0 || strncmp(s, "***", 3) == 0) && strlen(s) >= 3) {
            print_ansi("\033[90m--------------------------------\033[0m\n");
            continue;
        }

        // Headings (#)
        if (*s == '#') {
            int level = 0;
            while (*s == '#') { level++; s++; }
            while (*s == ' ') s++;
            switch (level) {
                case 1: print_ansi("\033[1;34m"); break; // blue bold
                case 2: print_ansi("\033[1;36m"); break; // cyan bold
                case 3: print_ansi("\033[1;32m"); break; // green bold
                default: print_ansi("\033[1m"); break;   // bold
            }
            render_inline(s);
            reset();
            putchar('\n');
            continue;
        }

        // Blockquote
        if (*s == '>') {
            s++;
            while (*s == ' ') s++;
            print_ansi("\033[2;33m| "); // dim yellow
            render_inline(s);
            reset();
            putchar('\n');
            continue;
        }

        // List items
        if ((*s == '-' || *s == '*' || *s == '+') && isspace((unsigned char)s[1])) {
            s += 2;
            print_ansi("* ");
            render_inline(s);
            putchar('\n');
            continue;
        }

        // Indented code block
        if (isspace((unsigned char)line[0]) && isspace((unsigned char)line[1]) &&
            isspace((unsigned char)line[2]) && isspace((unsigned char)line[3])) {
            print_ansi("\033[90m");
            printf("%s\n", s);
            reset();
            continue;
        }

        // Normal paragraph
        render_inline(s);
        putchar('\n');
    }

    reset();
}

// ------------------------------------------------------------------
// Inline renderer: handles **bold**, _italic_, `code`, [text](url)
// ------------------------------------------------------------------
static void render_inline(const char *line) {
    const char *p = line;
    while (*p) {
        // bold
        if (p[0] == '*' && p[1] == '*') {
            p += 2;
            print_ansi("\033[1m");
            while (*p && !(p[0] == '*' && p[1] == '*'))
                putchar(*p++);
            reset();
            if (*p) p += 2;
            continue;
        }
        // italic
        if (*p == '_') {
            p++;
            print_ansi("\033[3m");
            while (*p && *p != '_')
                putchar(*p++);
            reset();
            if (*p) p++;
            continue;
        }
        // inline code
        if (*p == '`') {
            p++;
            print_ansi("\033[93m");
            while (*p && *p != '`')
                putchar(*p++);
            reset();
            if (*p) p++;
            continue;
        }
        // link [text](url)
        if (*p == '[') {
            p++;
            char text[256], url[256];
            size_t tlen = 0, ulen = 0;
            while (*p && *p != ']' && tlen < sizeof(text)-1)
                text[tlen++] = *p++;
            text[tlen] = '\0';
            if (*p == ']') p++;
            if (*p == '(') {
                p++;
                while (*p && *p != ')' && ulen < sizeof(url)-1)
                    url[ulen++] = *p++;
                url[ulen] = '\0';
                if (*p == ')') p++;
                print_ansi("\033[4;34m"); // underline blue
                printf("%s", text);
                reset();
                print_ansi(" (\033[90m");
                printf("%s", url);
                print_ansi("\033[0m)");
                continue;
            }
            // fallback if no (url)
            printf("[%s]", text);
            continue;
        }
        putchar(*p++);
    }
}

// ------------------------------------------------------------------
// Example test
// ------------------------------------------------------------------

int main(void) {
    const char *sample =
        "# Title\n"
        "Some text with **bold**, _italic_, and `inline code`.\n"
        "\n"
        "## Lists\n"
        "- Item 1\n"
        "- Item 2\n"
        "\n"
        "> A blockquote example\n"
        "\n"
        "A link to [OpenAI](https://openai.com)\n"
        "\n"
        "```\n"
        "int main() {\n"
        "    return 0;\n"
        "}\n"
        "```\n"
        "---\n"
        "End of markdown demo.\n";

    md_print(sample);
    return 0;
}
```
