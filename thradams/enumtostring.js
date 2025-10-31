function isnondigit(ch) {
    return (ch >= 'a' && ch <= 'z') ||
        (ch >= 'A' && ch <= 'Z') ||
        (ch == '_');
}

function match(stream) {

    var result = {};
    result.lexeme = "";
    result.isIdentifier = false;

    while (1) {

        if (isnondigit(stream.text[stream.pos])) {
            var start = stream.pos;
            while (isnondigit(stream.text[stream.pos])) {
                stream.pos++;
            }

            result.lexeme = stream.text.substr(start, stream.pos);;
            result.isIdentifier = true;

            return result;
        } else if (stream.text[stream.pos] == "/" &&
            stream.text[stream.pos + 1] == "/") {
            var start = stream.pos;
            while (stream.text[stream.pos] != '\n') {
                stream.pos++;
            }
            result.lexeme = stream.text.substr(start, stream.pos);;
        } else if (stream.text[stream.pos] == "/" &&
            stream.text[stream.pos + 1] == "*") {
            var start = stream.pos;
            while (stream.text[stream.pos] != '*' &&
                stream.text[stream.pos + 1] != '/') {
                stream.pos++;
            }
            result.lexeme = stream.text.substr(start, stream.pos);;
        }

        result.lexeme = stream.text[stream.pos];

        return result;
    }
}


function OnButtonGenerate() {

    var input = document.getElementById("input").value;
    var stream = {};
    stream.text = input;
    stream.pos = 0;

    var r = match(stream);
    while (r.lexeme != '}') {
        r = match(stream);
    }


    var output = document.getElementById("output");
    output.value = "teste";
}