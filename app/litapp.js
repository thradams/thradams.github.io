function Encode(s) {
    var r = "";
    for (var i in s) {
        switch (s.charAt(i)) {
            case "\n":
                r += "\\r";
                break;
            case "\"":
                r += "\\\"";
                break;
            case "\t":
                r += "\\t";
                break;
            case "\\":
                r += "\\\\";
                break;
            default:
                r += s.charAt(i);
                break;
        }
    }
    return r;
}

function GenerateDefineChar(arrayOfLines, literalPrefix) {
    var r = "#define STR \\\n";
    var lastLine = arrayOfLines.length - 1;
    for (var i in arrayOfLines) {
        if (i != lastLine) {
            r += literalPrefix + "\"" + Encode(arrayOfLines[i]) + "\\n\"" + "\\\n";
        } else {
            r += literalPrefix + "\"" + Encode(arrayOfLines[i]) + "\\n\"";
        }
    }
    return r;
}

function GenerateCString(arrayOfLines, literalPrefix) {
    var r = "const char* str = \n";

    for (var i in arrayOfLines) {
        r += literalPrefix + "\"" + Encode(arrayOfLines[i]) + "\\n\"" + "\n";
    }
    r += ";";

    return r;
}

function GenerateString(arrayOfLines, literalPrefix, literalSufix) {
    var r = "";

    for (var i in arrayOfLines) {
        r += literalPrefix + "\"" + Encode(arrayOfLines[i]) + "\\n\"" + literalSufix + "\n";
    }
    return r;
}


function GenerateComment(arrayOfLines) {
    var r = "/*\n";
    var lastLine = arrayOfLines.length - 1;
    for (var i in arrayOfLines) {
        r += " * ";

        r += arrayOfLines[i] + "\n";
    }
    r += " */\n";
    return r;
}

function Generate() {
    var text1 = document.getElementById("TextArea1").value;
    var selectedIndex = document.getElementById("Select1").selectedIndex;

    var arrayOfLines = text1.split("\n");

    var r = "";
    switch (selectedIndex) {
        case 0:
            r = GenerateDefineChar(arrayOfLines, "");
            break;
        case 1:
            r = GenerateDefineChar(arrayOfLines, "L");
            break;
        case 2:
            r = GenerateComment(arrayOfLines);
            break;
        case 3:
            r = GenerateString(arrayOfLines, "s += ", ";");
            break;
        case 4:
            r = GenerateCString(arrayOfLines, "");
            break;
    }

    var elText2 = document.getElementById("TextArea2");
    elText2.textContent = r;
}
window.onload = function() {};