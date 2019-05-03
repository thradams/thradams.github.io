
var count = 0;
var s = "";

function GenerateCore(keywords, first, last, level) {
    var ident = (level + 1) * 2;

    s += ' '.repeat(ident);
    s += `switch (key[${level}])\n`;

    s += ' '.repeat(ident);
    s += "{\n";

    for (var i = first; i <= last; i++) {
        var begin = i;
        var end = begin;
        for (var k = i + 1; k <= last; k++) {
            if (keywords[k][level] == keywords[begin][level]) {
                i++;
                end++;
            }
            else
                break;
        }

        //we have the range
        if (begin == end) {
            //just one
            s += ' '.repeat(ident );
            s += `case /*${keywords[i]}*/ '${keywords[i].charAt(level)}' :\n`;
            
            s += ' '.repeat(ident );
            s += ' '.repeat(ident );
            s += `if (`;

            var len = keywords[i].length;

            var j = level + 1;
            for (; j < len; j++) {
                if (j != level + 1)
                    s += " && ";

                s += `key[${j}]=='${keywords[i].charAt(j)}'`;
            }
            if (j != level + 1)
                s += " && ";
            s += `key[${j}]=='\\0'`;
            s += `) {\n`;
            
            s += ' '.repeat(ident );
            s += ' '.repeat(ident );
            s += ' '.repeat(ident );
            s += `result = ${count};\n`;
            s += ' '.repeat(ident );
            s += ' '.repeat(ident );
            s += `}\n`;
            s += ' '.repeat(ident );
            s += `break;\n`;

            count++;
        }
        else {
            s += ' '.repeat(ident );
            s += `case '${keywords[i].charAt(level)}':\n`;//
            GenerateCore(keywords, begin, end, level + 1);

            s += ' '.repeat(ident);
            s += "break;\n";
        }

    }
    s += ' '.repeat(ident);
    s += "default : break;\n";

    s += ' '.repeat(ident);
    s += "}\n";
}

function Generate(keywords) {
    keywords.sort();
    s = "";
    s += "int find(const char* key)\n";
    s += "{\n";
    count = 0;
    var ident = 2;
    s += ' '.repeat(ident);
    s += "int result = -1;\n";
    GenerateCore(keywords, 0, keywords.length - 1, 0);

    s += ' '.repeat(ident); s
    s += "return result;\n";
    s += "}\n";
    return s;
}



function OnButtonGenerate() {
    var words = JSON.parse(document.getElementById('input').value);    
    var r = Generate(words);
    document.getElementById('output').value = r;
}
