var Module = {
    preRun: [],
    postRun: [],
    print: (function ()
    {
        var element = document.getElementById('output');
        if (element) element.value = ''; // clear browser cache
        return function (text)
        {
            if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
            // These replacements are necessary if you render to raw HTML
            //text = text.replace(/&/g, "&amp;");
            //text = text.replace(/</g, "&lt;");
            //text = text.replace(/>/g, "&gt;");
            //text = text.replace('\n', '<br>', 'g');
            console.log(text);
            if (element)
            {
                element.value += text + "\n";
                element.scrollTop = element.scrollHeight; // focus on bottom
            }
        };
    })(),
    printErr: function (text)
    {
        if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
        if (0)
        { // XXX disabled for safety typeof dump == 'function') {
            dump(text + '\n'); // fast, straight to the real console
        } else
        {
            console.error(text);
        }
    },
    setStatus: function (text)
    {
    },
    totalDependencies: 0,
    monitorRunDependencies: function (left)
    {
    }
};
window.onerror = function (event)
{
};

function CompileText(optionsText, source)
{
    //var ptr = allocate(intArrayFromString(inputText), 'i8', ALLOC_NORMAL);
    var resValue = Module.ccall('CompileText', // name of C function
        'string', // return type
        ['string', 'string'], // argument types
        [optionsText, source]); // arguments

    //var retPtr = _CompileText( ptr);
    //var resValue = Pointer_stringify(retPtr);
    //_free(ptr);
    //_free(ptr);
    return resValue;
}
