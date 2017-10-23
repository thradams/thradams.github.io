## Code coverage

This program generates a file with lines where the code must pass.

Lines with " _"

After that, if you run the code you can get a report

```cpp


#include <sstream>
#include <fstream>
#include <iostream>
#include <string>

using namespace std;

int main(int argc, char **argv)
{
    if (argc < 3)
    {
        cout << "missing in and out" << endl;
        return 1;
    }

    string line;
    ifstream in(argv[1]);
    ofstream out(argv[2]);

    cout << "in" << argv[1] << endl;
    cout << "out" << argv[2] << endl;

    out << "#include <stdio.h>\n"
        "#define _ lines[__LINE__ - 1]++;\n"
        "int lines[] = {\n";

    int lineNumber = 0;
    int col = 0;
    while (std::getline(in, line))
    {
        bool bCheck = false;
        for (int i = 0; i < line.size(); i++)
        {
            if (line[i] != ' ')
            {
                if (line[i] == '_')
                {
                    bCheck = true;
                }
                break;
            }
        }

        if (lineNumber > 0)
            out << ",";

        if (col > 9)
        {
            out << endl;
            col = 0;
        }

        if (bCheck)
        {
            out << 1 << "/*" << (lineNumber + 1) << "*/";
        }
        else
        {
            out << 0;
        }
        lineNumber++;
        col++;
    }
    out <<
        "};\n"
        "void PrintCoverage()\n"
        "{\n"
        "   printf(\"\\n\");\n"
        "   int failCount = 0;\n"
        "    for (int i = 0; i < (sizeof(lines) / sizeof(lines[0])); i++)\n"
        "    {\n"
        "        if (lines[i] != 0)\n"
        "        {\n"
        "           if (lines[i] == 1)\n"
        "           {\n"
        "              failCount++;\n"
        "              printf(\"NAO PASSOU na linha %d\\n\", (i + 1));\n"
        "           }\n"
        "        }\n"
        "     }\n"
        "   printf(\"\\n\");\n"
        "    if (failCount > 0)\n"
        "        printf(\"Nao passou em %d linhas \\n\", failCount);\n"
        "    else\n"
        "        printf(\"Tudo Ok\\n\");\n"
        "}\n";

    cout << "generated";
    return 0;
}


```

