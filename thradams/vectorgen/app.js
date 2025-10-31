
function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
function replaceAll(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function MakeHeader(strVectorName, strItemType, strItemDestructor, bAddZero, strPrintItem, strItemCopy) {
    var s = "";
    s += "\n";
    s += "#ifndef _[VECTOR_UNAME]_H\n";
    s += "#define _[VECTOR_UNAME]_H\n";
    s += "\n";
    s += "#ifndef __cplusplus\n";
    s += "#include <stdbool.h>\n";
    s += "#define inline __inline\n";
    s += "#endif\n";
    s += "\n";
    s += "\n";
    s += "struct [VECTOR_NAME]\n";
    s += "{\n";
    s += "    size_t    size;\n";
    s += "    size_t    capacity;\n";
    s += "    [VECTOR_ITEM_TYPE]* data;    \n";
    s += "};\n";
    s += "\n";
    s += "#define [VECTOR_UNAME]_INIT { 0, 0, 0 }\n";
    s += "\n";
    s += "void [VECTOR_NAME]_destructor(struct [VECTOR_NAME]* p);\n";
    s += "size_t [VECTOR_NAME]_reserve(struct [VECTOR_NAME]* p, size_t size);\n";
    s += "void [VECTOR_NAME]_erase_n(struct [VECTOR_NAME]* p, size_t index, size_t count);\n";
    s += "\n";
    s += "size_t [VECTOR_NAME]_insert_n(struct [VECTOR_NAME]* p,\n";
    s += "                              size_t index,\n";
    s += "                              const [VECTOR_ITEM_TYPE]* pSource,\n";
    s += "                              size_t count);\n";
    s += "\n";
    s += "void [VECTOR_NAME]_set(struct [VECTOR_NAME]* p, size_t index, [VECTOR_ITEM_TYPE] pointer);\n";
    s += "\n";
    s += "\n";
    s += "inline void [VECTOR_NAME]_append_n(struct [VECTOR_NAME]* p, const [VECTOR_ITEM_TYPE]* psz, size_t nelements)\n";
    s += "{\n";
    s += "    [VECTOR_NAME]_insert_n(p, p->size, psz, nelements);\n";
    s += "}\n";
    s += "\n";
    s += "inline [VECTOR_ITEM_TYPE] [VECTOR_NAME]_get(struct [VECTOR_NAME]* p, size_t index)\n";
    s += "{\n";
    s += "    return p->data[index];\n";
    s += "}\n";
    s += "\n";
    s += "inline size_t [VECTOR_NAME]_size(struct [VECTOR_NAME]* p)\n";
    s += "{\n";
    s += "    return p->size;\n";
    s += "}\n";
    s += "\n";
    s += "inline [VECTOR_ITEM_TYPE] [VECTOR_NAME]_back(struct [VECTOR_NAME]* p)\n";
    s += "{\n";
    s += "    return p->data[p->size - 1];\n";
    s += "}\n";
    s += "\n";
    s += "inline [VECTOR_ITEM_TYPE] [VECTOR_NAME]_front(struct [VECTOR_NAME]* p)\n";
    s += "{\n";
    s += "    return p->data[0];\n";
    s += "}\n";
    s += "\n";
    s += "inline bool [VECTOR_NAME]_empty(struct [VECTOR_NAME]* p)\n";
    s += "{\n";
    s += "    return p->size == 0;\n";
    s += "}\n";
    s += "\n";
    s += "inline void [VECTOR_NAME]_clear(struct [VECTOR_NAME]* p)\n";
    s += "{\n";
    s += "    [VECTOR_NAME]_erase_n(p, 0, p->size);\n";
    s += "}\n";
    s += "\n";
    s += "inline void [VECTOR_NAME]_copy_n(struct [VECTOR_NAME]* p, const [VECTOR_ITEM_TYPE]* psz, size_t nelements)\n";
    s += "{\n";
    s += "    [VECTOR_NAME]_clear(p);\n";
    s += "    [VECTOR_NAME]_insert_n(p, 0, psz, nelements);\n";
    s += "}\n";
    s += "\n";
    s += "inline void [VECTOR_NAME]_erase(struct [VECTOR_NAME]* p, size_t index)\n";
    s += "{\n";
    s += "    [VECTOR_NAME]_erase_n(p, index, 1);\n";
    s += "}\n";
    s += "\n";
    s += "inline size_t [VECTOR_NAME]_capacity(struct [VECTOR_NAME]* p)\n";
    s += "{\n";
    s += "    return p->capacity;\n";
    s += "}\n";
    s += "\n";
    s += "inline [VECTOR_ITEM_TYPE]* [VECTOR_NAME]_data(struct [VECTOR_NAME]* p)\n";
    s += "{\n";
    s += "    return p->data;\n";
    s += "}\n";
    s += "\n";
    s += "inline size_t [VECTOR_NAME]_push_back(struct [VECTOR_NAME]* p, [VECTOR_ITEM_TYPE] pointer)\n";
    s += "{\n";
    s += "    return [VECTOR_NAME]_insert_n(p, p->size, &pointer, 1);\n";
    s += "}\n";
    s += "\n";
    if (strPrintItem) {
        s += "void [VECTOR_NAME]_print(struct [VECTOR_NAME]* v);\n";
    }
    s += "\n";
    s += "#endif  //_[VECTOR_UNAME]_H\n";
    s += "\n";
    s += "\n";

    var r = s;
    r = replaceAll(r, "[VECTOR_UNAME]", strVectorName.toUpperCase());
    r = replaceAll(r, "[VECTOR_NAME]", strVectorName);
    r = replaceAll(r, "[VECTOR_ITEM_TYPE]", strItemType);

    return r;
}

function MakeSource(strVectorName, strItemType, strItemDestructor, bAddZero, strPrintItem, bGeometricGrow, strItemCopy) {
    var s = "";
    s += "#include <stdlib.h>\n";
    s += "#include <string.h>\n";
    s += "#include <assert.h>\n";
    s += "#include <stdio.h>\n";
    s += "#include <memory.h>\n";
    s += "\n";
    s += "#include \"[VECTOR_NAME].h\"\n";
    s += "\n";
    s += "\n";
    s += "#define CHECKBOUNDS(p, index) assert(p != NULL); assert(index < p->size); assert(index >= 0)\n";
    s += "#define INITIAL_CAPACITY (4)\n";
    s += "#define MAX_CAPACITY     ((size_t)(UINT_MAX/sizeof([VECTOR_ITEM_TYPE])))\n";
    s += "\n";

    if (strItemDestructor) {
        s += "inline void destroy_elements([VECTOR_ITEM_TYPE]* p,\n";
        s += "                             size_t nelements)\n";
        s += "{\n";
        s += "    [VECTOR_ITEM_TYPE]* end = p + nelements;\n";
        s += "    for (; p != end; p++)\n";
        s += "    {\n";
        s += "        [VECTOR_ITEM_DESTRUCTOR](p);\n";
        s += "    }\n";
        s += "}\n";
    }

    s += "\n";
    s += "inline void erase_n([VECTOR_ITEM_TYPE]* p,\n";
    s += "    size_t position,\n";
    s += "    size_t nelements)\n";
    s += "{\n";
    s += "    if (nelements > 0)\n";
    s += "    {\n";
    if (strItemDestructor) {
        s += "        /*Destroy elements if necessary*/\n";
        s += "        destroy_elements(&p[position], nelements);\n";
        s += "\n";
    }    
    s += "        /*assuming byte-move works*/\n";
    s += "        memmove(p + position,\n";
    s += "                p + position + nelements,\n";
    s += "                sizeof([VECTOR_ITEM_TYPE]) * nelements);\n";
    s += "    }\n";
    s += "}\n";
    s += "\n";
    s += "void insert_n([VECTOR_ITEM_TYPE]* dest,\n";
    s += "              size_t destsize,\n";
    s += "              size_t position, \n";
    s += "              const [VECTOR_ITEM_TYPE]* source,\n";
    s += "              size_t nelements)\n";
    s += "{\n";
    s += "    if (position < destsize)\n";
    s += "    {\n";
    s += "        /*assuming byte-move works*/\n";
    s += "        memmove(dest + position + nelements,\n";
    s += "                dest + position,\n";
    s += "                (sizeof([VECTOR_ITEM_TYPE])) * (position - position));\n";
    s += "    }\n";
    s += "\n";

    if (strItemCopy) {
        s += "    for (size_t i =0; i < nelements; i++)\n";
        s += "    {\n";
        s += "       [VECTOR_ITEM_COPY](dest + position + i, source + i);\n";
        s += "    }\n";
    }
    else {
        s += "    /*assuming byte-copy works*/\n";
        s += "    memcpy(dest + position, source, sizeof([VECTOR_ITEM_TYPE]) * nelements);\n";
    }
    
    s += "}\n";
    s += "\n";
    s += "static inline size_t reserve([VECTOR_ITEM_TYPE]** p,\n";
    s += "              size_t size,\n";
    s += "              size_t capacity,\n";
    s += "              size_t newCapacity)\n";
    s += "{\n";
    s += "    if (newCapacity > capacity)\n";
    s += "    {\n";
    s += "        if (*p == NULL)\n";
    s += "        {\n";

    if (bAddZero)
        s += "            *p = ([VECTOR_ITEM_TYPE]*) malloc((newCapacity + 1)* sizeof([VECTOR_ITEM_TYPE]));\n";
    else
        s += "            *p = ([VECTOR_ITEM_TYPE]*) malloc(newCapacity * sizeof([VECTOR_ITEM_TYPE]));\n";

    s += "        }\n";
    s += "        else\n";
    s += "        {\n";
    s += "            /*assuming that byte-copy works*/\n";
    if (bAddZero)
        s += "            *p = ([VECTOR_ITEM_TYPE]*) realloc(*p, sizeof([VECTOR_ITEM_TYPE]) * (newCapacity + 1));\n";
    else
        s += "            *p = ([VECTOR_ITEM_TYPE]*) realloc(*p, sizeof([VECTOR_ITEM_TYPE]) * (newCapacity + 1));\n";
    s += "        }\n";
    s += "    }\n";
    s += "    \n";
    s += "    return (*p != 0) ? newCapacity : 0;\n";
    s += "}\n";
    s += "\n";
    if (bGeometricGrow) {
        s += "static inline size_t grow_if_necessary([VECTOR_ITEM_TYPE]** p,\n";
        s += "    size_t size,\n";
        s += "    size_t capacity,\n";
        s += "    size_t newCapacity)\n";
        s += "{\n";
        s += "    if (newCapacity > capacity)\n";
        s += "    {\n";
        s += "        size_t newCalculatedCapacity = capacity == 0 ? INITIAL_CAPACITY : capacity;\n";
        s += "        while (newCalculatedCapacity < newCapacity)\n";
        s += "        {\n";
        s += "            newCalculatedCapacity *= 2;\n";
        s += "            \n";
        s += "            if (newCalculatedCapacity < newCapacity ||\n";
        s += "                newCalculatedCapacity > MAX_CAPACITY)\n";
        s += "            {\n";
        s += "                /*overflow check*/\n";
        s += "                newCalculatedCapacity = MAX_CAPACITY;\n";
        s += "            }\n";
        s += "        }\n";
        s += "        return reserve(p, size, capacity, newCalculatedCapacity);\n";
        s += "    }\n";
        s += "    return capacity;\n";
        s += "}\n";
    }

    s += "\n";
    s += "size_t [VECTOR_NAME]_reserve(struct [VECTOR_NAME]* p, size_t nelements)\n";
    s += "{\n";
    s += "    p->capacity = reserve(&(p->data), p->size, p->capacity, nelements);\n";
    s += "    return p->capacity;\n";
    s += "}\n";
    s += "\n";
    s += "static size_t [VECTOR_NAME]_grow_if_necessary(struct [VECTOR_NAME]* p,\n";
    s += "    size_t nelements)\n";
    s += "{\n";
    s += "    p->capacity = grow_if_necessary(&(p->data), p->size, p->capacity, nelements);\n";
    s += "    return p->capacity;\n";
    s += "}\n";
    s += "\n";
    s += "void [VECTOR_NAME]_destructor(struct [VECTOR_NAME]* p)\n";
    s += "{\n";
    s += "    [VECTOR_NAME]_clear(p);\n";
    s += "    free(p->data);\n";
    s += "    p->data = 0;\n";
    s += "}\n";
    s += "\n";
    s += "size_t [VECTOR_NAME]_insert_n(struct [VECTOR_NAME]* p,\n";
    s += "                           size_t index,\n";
    s += "                           const [VECTOR_ITEM_TYPE]* pSource,\n";
    s += "                           size_t nelements)\n";
    s += "{\n";
    if (bGeometricGrow) {
        s += "    size_t result = [VECTOR_NAME]_grow_if_necessary(p, p->size + nelements);\n";
    }
    else {
        s += "    size_t result = [VECTOR_NAME]_reserve(p, p->size + nelements);\n";
    }
    s += "    if (result == 0)\n";
    s += "    {\n";
    s += "        return 0;\n";
    s += "    }\n";
    s += "\n";
    s += "    insert_n(p->data, p->size, index, pSource, nelements);\n";
    s += "    p->size += nelements;\n";

    if (bAddZero) {
        s += "\n";
        s += "    /*zero is always at the end*/\n";
        s += "    if (p->data[p->size] != 0)\n";
        s += "    {\n";
        s += "        p->data[p->size] = 0;\n";
        s += "    }\n";
    }

    s += "    return nelements;\n";
    s += "}\n";
    s += "\n";
    s += "void [VECTOR_NAME]_erase_n(struct [VECTOR_NAME]* p, \n";
    s += "    size_t position,\n";
    s += "    size_t nelements)\n";
    s += "{\n";
    s += "    erase_n(p->data, position, nelements);\n";
    s += "    p->size = p->size - nelements;\n";
    s += "}\n";
    s += "\n";
    s += "void [VECTOR_NAME]_set(struct [VECTOR_NAME]* p,\n";
    s += "    size_t position,\n";
    s += "                    [VECTOR_ITEM_TYPE] value)\n";
    s += "{\n";
    s += "    CHECKBOUNDS(p, position);\n";
    if (strItemDestructor) {
        s += "    /*destructor*/\n";
        s += "    [VECTOR_ITEM_DESTRUCTOR](&(p->data[position]));\n";
    }
    s += "    p->data[position] = value;\n";
    s += "}\n";
    s += "\n";
    if (strPrintItem) {
        s += "void [VECTOR_NAME]_print(struct [VECTOR_NAME]* v)\n";
        s += "{\n";
        s += "    printf(\"{\\n\");\n";
        s += "    printf(\" size     : %d\\n\", v->size);\n";
        s += "    printf(\" capacity : %d\\n\", v->capacity);\n";
        s += "    printf(\" data     : [\");\n";
        s += "    for (size_t i = 0; i < v->size; i++)\n";
        s += "    {\n";
        s += "        if (i > 0)\n";
        s += "            printf(\", \");\n";
        s += "        [VECTOR_ITEM_PRINT](&v->data[i]);\n";
        s += "    }\n";
        s += "    printf(\"] [\");\n";
        s += "    for (size_t i = v->size; i < v->capacity; i++)\n";
        s += "    {\n";
        s += "        if (i > v->size)\n";
        s += "            printf(\", \");\n";
        s += "        [VECTOR_ITEM_PRINT](&v->data[i]);\n";
        s += "    }\n";
        s += "    printf(\"]\\n\");\n";
        s += "    printf(\"}\\n\");\n";
        s += "}\n";
    }
    s += "\n";
    s += "\n";
    s += "\n";

    var r2 = s;
    r2 = replaceAll(r2, "[VECTOR_UNAME]", strVectorName.toUpperCase());
    r2 = replaceAll(r2, "[VECTOR_NAME]", strVectorName);
    r2 = replaceAll(r2, "[VECTOR_ITEM_TYPE]", strItemType);
    r2 = replaceAll(r2, "[VECTOR_ITEM_DESTRUCTOR]", strItemDestructor);
    r2 = replaceAll(r2, "[VECTOR_ITEM_PRINT]", strPrintItem);
    r2 = replaceAll(r2, "[VECTOR_ITEM_COPY]", strItemCopy);
    
    return r2;
}


function Generate() {

    var itemtype = document.getElementById("ItemType").value;
    var itemDestructor = document.getElementById("ItemDestructor").value;
    var itemPrint = document.getElementById("ItemPrint").value;
    var strItemCopy = document.getElementById("ItemCopy").value;
    
    var vectorName = document.getElementById("vectorName").value;
    var addZero = document.getElementById("AddZero").checked;
    var bGeometricGrow = document.getElementById("GeometricGrow").checked;
    

    document.getElementById("Result").innerHTML = GetHtml(MakeHeader(vectorName, itemtype, itemDestructor, addZero, itemPrint, bGeometricGrow, strItemCopy));
    document.getElementById("Source").innerHTML = GetHtml(MakeSource(vectorName, itemtype, itemDestructor, addZero, itemPrint, bGeometricGrow, strItemCopy));


}
