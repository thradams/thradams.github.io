var bEnableLines = false;
var lineBase = 0;
var sourceFileName = "";
var s_StaticId = 0;
function GetLambdaName(call, name) {
    var s = name;
    s += "_Lambda" + call.id;
    return s;
}
function GetCaptureName(call, name) {
    var s = name;
    s += "_Capture" + call.id;
    return s;
}
var Call = (function () {
    function Call() {
        this.id = s_StaticId;
        s_StaticId++;
        this.name = "";
        this.call = "";
        this.lines0 = "";
        this.currentLine0 = 0;
        this.lines1 = "";
        this.currentLine1 = 0;
        this.args = new Array();
        this.captures = new Array();
    }
    return Call;
})();
var Source = (function () {
    function Source() {
        this.firstCall = new Call();
        this.calls = new Array();
    }
    return Source;
})();
function GenerateLines(indentation, lineNumber, lines) {
    var s = "";
    //s += "//USER CODE====================\n";
    var ar = lines.split('\n');
    for (var i = 0; i < ar.length; i++) {
        var tline = ar[i].trim();
        if (bEnableLines && tline != "") {
            s += "#line " + (lineBase + lineNumber);
            if (sourceFileName) {
                s += " \"" + sourceFileName + "\"";
            }
            s += "\n";
        }
        s += Ident(indentation) + ar[i].trim();
        s += '\n';
        lineNumber++;
    }
    // s += "//USER CODE====================\n";
    return s;
}
function GenerateTargetTypeVar(target) {
    var s = "";
    s += "void (*onResult)(Result";
    for (var i = 0; i < target.args.length; i++) {
        s += ", ";
        s += target.args[i].type;
    }
    s += ", void*)";
    return s;
}
function GenerateTargetErrorCall(target) {
    var s = "";
    s += "onResult(result";
    for (var i = 0; i < target.args.length; i++) {
        s += ", ";
        s += "NULL"; //some default value
    }
    s += ", data);//target error call\n";
    return s;
}
function SameSizeOf(sInput) {
    //gera uma string com mesmo tamanho so que com espacos
    var s = "";
    for (var i = 0; i < sInput.length; i++) {
        s += " ";
    }
    return s;
}
function Ident(n) {
    var s = "";
    for (var i = 0; i < n; i++) {
        s += "    ";
    }
    return s;
}
function GenerateArguments(spaces, items) {
    var s = "";
    for (var i = 0; i < items.length; i++) {
        s += items[i].type + " " + items[i].name;
        if (i < items.length - 1) {
            s += ",\n" + spaces;
        }
    }
    return s;
}
function GenerateCaptureNames(items) {
    var s = "";
    for (var i = 0; i < items.length; i++) {
        s += items[i].name;
        if (i < items.length - 1) {
            s += ", ";
        }
    }
    return s;
}
function GetCopyStatement(ident, v) {
    var i = 0;
    var s = "";
    if (v.type == "const char*") {
        s += Ident(ident) + "p->" + v.name + " = _strdup(" + v.name + ");\n";
        s += Ident(ident) + "result == (p->" + v.name + " != NULL) ? RESULT_OK : RESULT_FAIL;\n";
        s += Ident(ident) + "if (result == RESULT_OK)\n";
        s += Ident(ident) + "{\n";
        i = 1;
    }
    else {
        s += Ident(ident) + "p->" + v.name + " = " + v.name + ";\n";
    }
    return { "str": s, "ident": i };
}
function GetDestroyStatement(ident, v) {
    var i = 0;
    var s = "";
    if (v.type == "const char*") {
        s += Ident(ident + 1) + "free((void*)p->" + v.name + ");\n";
        i = 1;
    }
    else {
    }
    return { "str": s, "ident": i };
}
function GenerateCapture(identation, info, source) {
    var name0 = info.name;
    var captures = info.captures;
    var name = GetCaptureName(info, name0);
    var ErrorType = "Result";
    var s = "";
    s += "typedef struct \n";
    s += "{\n";
    for (var i = 0; i < captures.length; i++) {
        s += Ident(identation + 1) + captures[i].type + " " + captures[i].name + ";\n";
    }
    s += Ident(identation + 1) + GenerateTargetTypeVar(source.firstCall) + ";\n";
    s += Ident(identation + 1) + "void* data;\n";
    s += "} " + name + ";\n";
    var spaces = SameSizeOf("static " + ErrorType + " " + name + "_Init(");
    //implementa init
    s += "\n";
    var captureStr = GenerateArguments(spaces, captures);
    if (captureStr != "") {
        captureStr += ",\n" + spaces;
    }
    s += "static " + ErrorType + " " + name + "_Init(" + name + "** pp,\n" + spaces + captureStr + GenerateTargetTypeVar(source.firstCall) + ",\n" + spaces + "void* data" + ")\n";
    s += "{\n";
    s += Ident(identation + 1) + "Result result;\n";
    s += Ident(identation + 1) + "" + name + " *p = " + "(" + name + "*)" + "malloc(sizeof(" + "" + name + "));\n";
    s += Ident(identation + 1) + "result = p ? RESULT_OK : RESULT_OUTOFMEM;\n";
    s += Ident(identation + 1) + "if (result == RESULT_OK)\n";
    s += Ident(identation + 1) + "{\n";
    //implementa copias do init
    //escadinha
    var k = 0;
    for (var i = 0; i < captures.length; i++) {
        var pair = GetCopyStatement(identation + 2 + i, captures[i]);
        s += pair.str;
        k += pair.ident;
        if (i == captures.length - 1) {
            s += Ident(identation + 2 + k) + "p->onResult = onResult;\n";
            s += Ident(identation + 2 + k) + "p->data = data;\n";
            s += Ident(identation + 2 + k) + "*pp = p;\n";
            s += Ident(identation + 2 + k) + "goto end;\n";
        }
    }
    for (var i = captures.length - 1; i >= 0; i--) {
        var pair = GetDestroyStatement(identation + 1 + k, captures[i]);
        if (pair.ident == 1) {
            s += Ident(identation + 1 + k) + "}\n";
        }
        s += pair.str;
        k -= pair.ident;
    }
    if (captures.length > 0) {
        s += Ident(identation + 2) + "free((void*)p);\n";
    }
    else {
        s += Ident(identation + 2) + "p->onResult = onResult;\n";
        s += Ident(identation + 2) + "p->data = data;\n";
        s += Ident(identation + 2) + "*pp = p;\n";
    }
    s += Ident(identation + 1) + "}\n";
    if (captures.length > 0) {
        s += "end:\n";
    }
    s += Ident(identation + 1) + "return result;\n";
    s += "}\n";
    ////////
    //implementa destroy
    s += "\n";
    s += "static void" + " " + name + "_Delete(" + name + "* p)\n";
    s += "{\n";
    for (var i = 0; i < captures.length; i++) {
        var pair = GetDestroyStatement(identation, captures[i]);
        s += pair.str;
    }
    s += Ident(identation + 1) + "free((void*)p);\n";
    s += "}\n\n";
    return s;
}
;
function GenerateCaptureLocal(call, captures, source) {
    var name0 = call.name;
    var name = GetCaptureName(call, name0);
    var ErrorType = "Result";
    var s = "";
    for (var i = 0; i < captures.length; i++) {
        s += Ident(1) + captures[i].type + " " + captures[i].name + " = ((" + name + "*) _data)->" + captures[i].name + ";\n";
    }
    s += Ident(1) + GenerateTargetTypeVar(source.firstCall) + " = ((" + name + "*) _data)->" + "onResult" + ";\n";
    s += Ident(1) + "void* data" + " = ((" + name + "*) _data)->" + "data" + ";\n";
    return s;
}
function GenerateLambdaCall(identation, info, lines1, source) {
    var s = "";
    var name0 = info.name;
    var name = GetLambdaName(info, name0);
    var ErrorType = "Result";
    var ErrorVar = "result";
    s += "\n";
    s += Ident(identation + 1) + "" + GetCaptureName(info, name0) + "* " + "_cap" + ";\n";
    var capStr = GenerateCaptureNames(info.captures);
    if (capStr != "") {
        capStr += ", ";
    }
    s += Ident(identation + 1) + ErrorVar + " = " + GetCaptureName(info, name0) + "_Init(&_cap, " + capStr + "onResult, data);\n";
    s += Ident(identation + 1) + "if (" + ErrorVar + " == RESULT_OK)\n";
    s += Ident(identation + 1) + "{\n";
    var callargs = "";
    if (info.call != "") {
        callargs = info.call + ", ";
    }
    s += Ident(identation + 2) + name0 + "( " + callargs + name + ", " + "_cap" + ");\n";
    s += lines1;
    s += Ident(1) + "}\n";
    s += Ident(1) + "else\n";
    s += Ident(1) + "{\n";
    s += Ident(2) + GenerateTargetErrorCall(source.firstCall);
    s += Ident(1) + "}\n";
    return s;
}
function GenerateLambda(index, infos, source) {
    var info = infos[index];
    var name0 = info.name;
    var name = GetLambdaName(info, name0);
    var ErrorType = "Result";
    var ErrorVar = "result";
    var spaces = SameSizeOf("static void " + name + "(");
    var s = "";
    var funcargs = GenerateArguments(spaces, info.args);
    if (funcargs != "") {
        funcargs += ", ";
    }
    s += "static void " + name + "(" + ErrorType + " " + ErrorVar + ", " + funcargs + "void* _data)\n";
    s += "{\n";
    s += Ident(1) + "//capture vars\n";
    s += GenerateCaptureLocal(info, info.captures, source);
    s += "\n";
    s += "\n";
    s += Ident(1) + "if (" + ErrorVar + " == RESULT_OK)\n";
    s += Ident(1) + "{\n";
    if (index < infos.length - 1) {
        s += Ident(2) + "//continuation\n";
        s += GenerateLines(2, info.currentLine0, info.lines0);
        var lines1 = GenerateLines(2, info.currentLine1, info.lines1);
        s += GenerateLambdaCall(1, infos[index + 1], lines1, source);
        s += Ident(1) + "} //if\n";
    }
    else {
        s += Ident(2) + "//succeded!!\n";
        var targetResultsStr = source.firstCall.call;
        if (targetResultsStr != "") {
            //se tem call eh pq tem um resultado
            //deve ser chamado com return
            s += GenerateLines(2, info.currentLine0, info.lines0);
            targetResultsStr += ", ";
            s += Ident(2) + "onResult(result, " + targetResultsStr + "data); //target\n";
            s += GenerateLines(2, info.currentLine1, info.lines1);
        }
        else {
            //provamente nao tem return
            //neste caso se inverte e coloca o lines1 antes do onresult
            //deve ser branco
            s += GenerateLines(2, info.currentLine0, info.lines0);
            //este aqui pode ter coisas e vem antes do return
            s += GenerateLines(2, info.currentLine1, info.lines1);
            //fica bem no fim simulando o retorno
            s += Ident(2) + "onResult(result, data); //target no result\n";
            s += Ident(1) + "}\n";
        }
        s += Ident(1) + "else\n";
        s += Ident(1) + "{\n";
        s += Ident(2) + GenerateTargetErrorCall(source.firstCall);
        s += Ident(1) + "}//else\n";
    }
    s += "\n";
    s += Ident(1) + GetCaptureName(info, name0) + "_Delete((" + GetCaptureName(info, name0) + "*)" + "_data);\n";
    s += "} //lambda\n\n";
    return s;
}
function Generate(source) {
    var strResult = "";
    var s = "";
    for (var i = (source.calls.length - 1); i >= 0; i--) {
        s += GenerateCapture(0, source.calls[i], source);
        s += GenerateLambda(i, source.calls, source);
    }
    s += "\n\n\n";
    var spaces = SameSizeOf("Result " + source.firstCall.name + "(");
    var captureStr = GenerateArguments(spaces, source.firstCall.captures);
    if (captureStr != "") {
        captureStr += ",\n" + spaces;
    }
    s += "void " + source.firstCall.name + "(" + captureStr + GenerateTargetTypeVar(source.firstCall) + ",\n" + spaces + "void* data" + ")\n";
    s += "{\n";
    s += Ident(1) + "Result result;\n";
    s += GenerateLines(1, source.firstCall.currentLine0, source.firstCall.lines0);
    var lines1 = GenerateLines(1, source.firstCall.currentLine1, source.firstCall.lines1);
    if (source.calls.length > 0) {
        s += GenerateLambdaCall(0, source.calls[0], lines1, source);
    }
    else {
    }
    s += "}\n";
    strResult = s;
    return strResult;
}
function ParseFunctionResult(scanner) {
    var typesAndNames = new Array();
    scanner.SkipBlanks();
    scanner.MatchToken("-");
    scanner.MatchToken(">");
    scanner.SkipBlanks();
    if (scanner.lexeme == "void") {
        //pode ser sem retorno
        scanner.MatchLexeme("void");
        scanner.SkipBlanks();
        if (scanner.token != '{') {
            var typename = "void";
            var modifier = "";
            var pointer = "";
            scanner.SkipBlanks();
            if (scanner.token == "*") {
                pointer = scanner.MatchToken("*");
                scanner.SkipBlanks();
            }
            var name = scanner.MatchToken("identifier");
            scanner.SkipBlanks();
            typesAndNames.push({ "type": modifier + typename + pointer, "name": name });
        }
    }
    else {
        //normal
        typesAndNames.push(ParseTypeAndName(scanner));
        if (scanner.token == ",") {
            scanner.MatchToken(",");
        }
    }
    while (scanner.token != "{") {
        typesAndNames.push(ParseTypeAndName(scanner));
        if (scanner.token == "{") {
            break;
        }
        else if (scanner.token == ",") {
            scanner.MatchToken(",");
        }
        else {
            throw "expected , or }";
        }
    }
    scanner.MatchToken("{");
    scanner.SkipBlanks();
    return typesAndNames;
}
function ParseTypeAndName(scanner) {
    scanner.SkipBlanks();
    var modifier = "";
    var pointer = "";
    if (scanner.lexeme == "const" ||
        scanner.lexeme == "unsigned") {
        var modifier = scanner.MatchToken("identifier");
        modifier += " ";
        scanner.SkipBlanks();
    }
    var typename = scanner.MatchToken("identifier");
    scanner.SkipBlanks();
    if (scanner.token == "*") {
        pointer = scanner.MatchToken("*");
        scanner.SkipBlanks();
    }
    var name = scanner.MatchToken("identifier");
    scanner.SkipBlanks();
    return { "type": modifier + typename + pointer, "name": name };
}
function ParseAsyncCallAndDeclaration(scanner, call) {
    scanner.MatchLexeme("async");
    scanner.SkipBlanks();
    scanner.MatchLexeme("[");
    while (scanner.token != "]") {
        call.captures.push(ParseTypeAndName(scanner));
        if (scanner.token == "]") {
        }
        else if (scanner.token == ",") {
            scanner.MatchToken(",");
            scanner.SkipBlanks();
        }
        else {
            throw "expected , or )";
        }
    } //captures
    scanner.MatchToken("]");
    scanner.SkipBlanks();
    call.name = scanner.MatchToken("identifier");
    scanner.SkipBlanks();
    scanner.MatchToken("(");
    scanner.SkipBlanks();
    var callStr = "";
    for (;;) {
        if (scanner.token == ")") {
            scanner.MatchToken(")");
            break;
        }
        callStr += scanner.lexeme;
        scanner.Next();
    }
    call.call = callStr;
    call.args = ParseFunctionResult(scanner);
}
function ParseAsyncBody(scanner, originBodyCall, sourceOut) {
    var functionBodyStartLine = scanner.currentLine;
    var functionBodyEndLine = 0;
    var blockCount = 1;
    var lines = "";
    for (;;) {
        if (scanner.lexeme == "return") {
            originBodyCall.currentLine0 = functionBodyStartLine;
            originBodyCall.lines0 = lines;
            lines = "";
            scanner.MatchLexeme("return");
            scanner.SkipBlanks();
            sourceOut.firstCall.call = "";
            for (;;) {
                if (scanner.token != ';') {
                    //?
                    sourceOut.firstCall.call += scanner.lexeme;
                }
                else {
                    break;
                }
                scanner.Next();
            }
            scanner.MatchToken(';');
            scanner.SkipBlanks();
        }
        else if (scanner.lexeme == "async") {
            originBodyCall.currentLine0 = functionBodyStartLine;
            originBodyCall.lines0 = lines;
            var call = new Call();
            lines = "";
            sourceOut.calls.push(call);
            ParseAsyncCallAndDeclaration(scanner, call);
            ParseAsyncBody(scanner, call, sourceOut);
        }
        else if (scanner.token == "}") {
            blockCount--;
            if (blockCount <= 0) {
                //entende que a ultima chave fechada
                //fecha o body da funcao                
                scanner.MatchToken('}');
                scanner.SkipBlanks();
                functionBodyEndLine = scanner.currentLine;
                break;
            }
            else {
                lines += scanner.lexeme;
                scanner.Next();
            }
        }
        else {
            if (scanner.token == "{") {
                blockCount++;
            }
            lines += scanner.lexeme;
            scanner.Next();
        }
        if (scanner.token == "eof") {
            break;
        }
    }
    originBodyCall.currentLine1 = functionBodyStartLine;
    originBodyCall.lines1 = lines;
}
function Parse(inputSource) {
    var strResult = "";
    var scanner = new Scanner(inputSource);
    for (;;) {
        if (scanner.lexeme == "async") {
            var sourceOut = new Source();
            //            scanner.SkipBlanks();
            scanner.MatchLexeme("async");
            scanner.SkipBlanks();
            sourceOut.firstCall.name = scanner.MatchToken("identifier");
            scanner.SkipBlanks();
            scanner.MatchToken("(");
            scanner.SkipBlanks();
            while (scanner.token != ")") {
                //Na funcao principal usa os captures como se fossem os parametros
                sourceOut.firstCall.captures.push(ParseTypeAndName(scanner));
                if (scanner.token == ")") {
                }
                else if (scanner.token == ",") {
                    scanner.MatchToken(",");
                    scanner.SkipBlanks();
                }
                else {
                    throw "expected , or )";
                }
            } //parametros
            scanner.MatchToken(")");
            sourceOut.firstCall.args = ParseFunctionResult(scanner);
            ParseAsyncBody(scanner, sourceOut.firstCall, sourceOut);
            //strResult += lines;
            // lines = "";
            strResult += Generate(sourceOut);
            //;;manySources.push(sourceOut);
            if (scanner.token == "eof") {
                //ok!
                break;
            }
        } //async
        else {
            //se quer ignorar
            //strResult += scanner.lexeme;
            scanner.Next();
        }
        if (scanner.token == "eof") {
            //ok!
            break;
        }
    } //for    
    return strResult;
}
var Scanner = (function () {
    function Scanner(src) {
        this.currentLine = 0;
        this.current = 0;
        this.stringSource = src;
        this.Next();
    }
    Scanner.prototype.MatchLexeme = function (tk) {
        if (this.lexeme != tk) {
            throw "Lexeme expected =" + tk + ", got " + this.token + " " + " " + this.lexeme + " at line " + this.currentLine;
        }
        this.Next();
    };
    Scanner.prototype.MatchToken = function (tk) {
        var lexeme = this.lexeme;
        if (this.token != tk) {
            throw "Token expected =" + tk + ", got " + this.token + " " + " " + this.lexeme + " at line " + this.currentLine;
        }
        this.Next();
        return lexeme;
    };
    Scanner.prototype.SkipBlanks = function () {
        while (this.token != "eof" &&
            (this.token == "whitespace" || this.token == "linebreak")) {
            this.Next();
        }
    };
    Scanner.prototype.Next = function () {
        if (this.current == this.stringSource.length - 1) {
            this.lexeme = "";
            this.token = "eof";
            return false;
        }
        var ch = this.stringSource[this.current];
        if (ch == '\n') {
            //incrementa a linha
            this.currentLine++;
            this.current++;
            this.lexeme = '\n';
            this.token = "linebreak";
            return true;
        }
        var whitespace = "";
        while (ch == ' ' || ch == '\n' || ch == '\r' || ch == '\t') {
            whitespace += ch;
            this.current++;
            ch = this.stringSource[this.current];
        }
        if (whitespace != "") {
            this.lexeme = whitespace;
            this.token = "whitespace";
            return true;
        }
        var identifier = "";
        if ((ch >= 'a' && ch <= 'z') ||
            (ch >= 'A' && ch <= 'Z') ||
            (ch == '_')) {
            while ((ch >= 'a' && ch <= 'z') ||
                (ch >= 'A' && ch <= 'Z') ||
                (ch >= '0' && ch <= '9') ||
                (ch == '_')) {
                identifier += ch;
                this.current++;
                ch = this.stringSource[this.current];
            }
        }
        if (identifier != "") {
            this.lexeme = identifier;
            this.token = "identifier";
            return true;
        }
        var lineComment = "";
        if (ch == "/") {
            //tenta olhar um adiante
            if (this.current + 1 < this.stringSource.length) {
                if (this.stringSource[this.current + 1] == "/") {
                    lineComment = "";
                    //comentario de linha!
                    while (ch != '\n') {
                        lineComment += ch;
                        this.current++;
                        ch = this.stringSource[this.current];
                    }
                }
            }
        }
        if (lineComment != "") {
            this.lexeme = lineComment;
            this.token = "comment";
            return true;
        }
        var strliteral = "";
        if (ch == "\"") {
            strliteral += ch;
            this.current++;
            ch = this.stringSource[this.current];
            while (ch != '"') {
                strliteral += ch;
                this.current++;
                ch = this.stringSource[this.current];
            }
            strliteral += ch;
            this.current++;
            ch = this.stringSource[this.current];
        }
        if (strliteral != "") {
            this.lexeme = strliteral;
            this.token = "strliteral";
            return true;
        }
        if (this.current >= this.stringSource.length) {
            this.lexeme = "";
            this.token = "eof";
            return false;
        }
        this.current++;
        this.lexeme = ch;
        this.token = ch; //"punctuator";
        return true;
    };
    return Scanner;
})();
//////////////////////////////////////////////
//////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
function ButtonClick() {
    var textIn = document.getElementById("InputText");
    var textOut = document.getElementById("OuputText");
    var r = "";
    try {
        r = Parse(textIn.value);
    }
    catch (e) {
        r = e;
    }
    textOut.value = r;
}
window.onload = function () {
    var textIn = document.getElementById("InputText");
    var s = "";
    s += "async Read(const char * user,\n";
    s += "          const char * password) ->Value * pValue\n";
    s += "{\n";
    s += "    async [const char* user, const char* passoword] Connect(server)->Connection * pConnection\n";
    s += "    {\n";
    s += "        async [] Login(pConnection, user, password) ->Token * pToken\n";
    s += "        {\n";
    s += "            pConnection ->SetToken(pToken);\n";
    s += "            async [] Read(server) ->Value * pValue\n";
    s += "            {\n";
    s += "                return (pValue);\n";
    s += "            }\n";
    s += "        }\n";
    s += "     }\n";
    s += "}\n";
    //JSON.stringify(exemplo);
    textIn.value = s;
};
//# sourceMappingURL=app.js.map