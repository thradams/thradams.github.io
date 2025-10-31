var tabs = "  ";


function MakeStringForEachMember(struct, f)
{
  var r = "";
  for (var i in struct.members)
  {
    r += f(i, struct.members[i]);
  }
  return r;
}

function MakeStringForEachMemberRev(struct, f)
{
  var r = "";
  for (var i = struct.members.length - 1; i >= 0; i--)
  {
    r += f(i, struct.members[i]);
  }
  return r;
}


function GetIndent(n)
{
  var ident = Array(n * 4).join(" ");
  return ident;
}

function StaticInit(member)
{
  var r = "";
  switch (member.type)
  {
    case "const char*":
    case "int":
      r += "0";
      break;
    default:
      r += "0";
  }
  return r;
}

function InitCopy(struct, member)
{
  var r = "";
  switch (member.type)
  {
    case "const char*":
      r += member.type + " " + member.name + "temp;\n";
      r += "r = str_create((char**)&" + member.name + "temp" + ", " + member.name + "," + member.name + ");";
      break;
    case "int":
      r += struct.name + "->" + member.name + " = " + member.name + ";";
      break;
    default:
      r += struct.name + "->" + member.name + " = " + member.name + ";";
  }
  return r;
}

function InitDestroy(struct, member, identLevel)
{
  var r = "";
  switch (member.type)
  {
    case "const char*":
      r += GetIndent(identLevel) + "free((void*)" + struct.name + "->" + member.name + ");\n";
       break;
    default:
      //r += GetIndent(identLevel) + struct.name + "->" + member.name + " = " + member.name + ";";
  }
  return r;
}

function MakeStaticInit(struct, bDeclaration)
{
  var r = "#define " + struct.name.toUpperCase() + "_INIT {";

  r += MakeStringForEachMember(struct, function (i, member)
  {
    var s = "";
    if (i > 0)
      s += ", ";
    s += StaticInit(member);
    return s;
  });
  r += "}";
  return r;
}

function MakeInit(struct, bDeclaration)
{
  var part1 = "int " + struct.name + "_init(";
  var r = part1 + "struct " + struct.name + "* " + struct.name;

  var ident = Array(part1.length + 1).join(" ");

  for (var i in struct.members)
  {
    r += ", ";
    r += "\n";
    r += ident;
    r += struct.members[i].type;
    r += " ";
    r += struct.members[i].name;
  }
  r += ")";

  if (bDeclaration)
  {
    r += ";\n";
    return r;
  } else
  {
    r += "\n";
  }
  r += "{\n";
  r += GetIndent(1) + "/*out*/\n";
  r += GetIndent(1) + "struct " + struct.name + " " + struct.name + "temp = " + struct.name.toUpperCase() + "_INIT;\n";
  r += GetIndent(1) + "*" + struct.name + " = " + struct.name + "temp;\n";
  r += "\n";
  r += GetIndent(1) + "int r = 1;\n";

  ident = 1;
  r += MakeStringForEachMember(struct, function (i, member)
  {
    var s = "";
    switch (member.type)
    {
      case "const char*":
        s += GetIndent(ident) + member.type + " " + member.name + "temp;\n";
        s += GetIndent(ident) + "r = str_create((char**)&" + member.name + "temp," + member.name +");\n";
        s += GetIndent(ident) + "if (r == 0)\n";
        s += GetIndent(ident) + "{\n";
        ident++;
        break;
      case "int":
       break;
    }

    return s;
  });

  isreturn = true; //o primeiro cara vai ser o return

  ident--;
  maxident = ident;

  r += MakeStringForEachMemberRev(struct, function (i, member)
  {
    var s = "";
    if (ident == maxident)
    {
      s += MakeStringForEachMember(struct, function (k, member2)
      {
        var s2 = "";
        switch (member2.type)
        {
          case "const char*":
            s2 += GetIndent(ident + 1) + struct.name + "->" + member2.name + " = " + member2.name + "temp;\n"; break;
            break;
          case "int":
            s2 += GetIndent(ident + 1) + struct.name + "->" + member2.name + " = " + member2.name + ";\n";
            break;
        }
        return s2;
      });
    }

    switch (member.type)
    {
      case "const char*":
        if (ident != maxident)
        {
          s += GetIndent(ident + 1) + "free((void*)" + member.name + "temp" + ");\n";
        }
        s += GetIndent(ident) + "}\n";
        ident--;
        break;
      case "int":
        break;
    }

    return s;
  });


  r += GetIndent(1) + "return r;\n";
  r += "}\n";
  return r;
}

function MakeSwap(struct, bDeclaration)
{
  var part1 = "void " + struct.name + "_swap(";
  var r = part1 + "struct " + struct.name + "* " + struct.name;
  r += ", struct " + struct.name + "* other)";


  if (bDeclaration)
  {
    r += ";\n";
    return r;
  } else
  {
    r += "\n";
  }
  r += "{\n";

  for (var i in struct.members)
  {
    switch (struct.members[i].type)
    {
      case "const char*":
        r += tabs + "ptr_swap((void**)&" + struct.name + "->" + struct.members[i].name + ", (void**) &other->" + struct.members[i].name + ");";
        break;
      case "int":
        r += tabs + "int_swap(&" + struct.name + "->" + struct.members[i].name + ", &other->" + struct.members[i].name + ");";
        break;
    }
    r += "\n";
  }

  r += "}\n";
  return r;
}

function MakeDestroy(struct, bDeclaration)
{
  var part1 = "void " + struct.name + "_destroy(";
  var r = part1 + "struct " + struct.name + "* " + struct.name;
  r += ")";

  if (bDeclaration)
  {
    r += ";\n";
    return r;
  }
  else
  {
    r += "\n";
  }
  r += "{\n";

  for (var i in struct.members)
  {
    r += InitDestroy(struct, struct.members[i], 1);
  }

  r += "}\n";
  return r;
}

function MakeDelete(struct, bDeclaration)
{
  var part1 = "void " + struct.name + "_delete(";
  var r = part1 + "struct " + struct.name + "* " + struct.name;
  r += ")";

  if (bDeclaration)
  {
    r += ";\n";
    return r;
  } else
  {
    r += "\n";
  }

  r += "{\n";
  r += tabs + "if (" + struct.name + " == 0)\n";
  r += tabs + "{\n";
  r += tabs + tabs + "assert(0);\n";
  r += tabs + tabs + "return;\n";
  r += tabs + "}\n";
  r += tabs + struct.name + "_destroy(" + struct.name + ");\n";
  r += tabs + "free((void*)" + struct.name + ");\n";
  r += "}\n";
  return r;
}

function MakeCreate(struct, bDeclaration)
{
  var part1 = "int " + struct.name + "_create(";
  var r = part1 + "struct " + struct.name + "** pp";

  var ident = Array(part1.length + 1).join(" ");

  for (var i in struct.members)
  {
    r += ",\n";
    r += ident;
    r += struct.members[i].type;
    r += " ";
    r += struct.members[i].name;
  }
  r += ")";

  if (bDeclaration)
  {
    r += ";\n";
    return r;
  } else
  {
    r += "\n";
  }

  r += "{\n";
  r += tabs + "int r = 1;\n";
  r += tabs + "struct " + struct.name + "* pNew = (struct " + struct.name + "*) malloc(sizeof(struct " + struct.name + "));\n";
  r += tabs + "if (pNew)\n";
  r += tabs + "{\n";
  r += tabs + tabs + "if (" + struct.name + "_init(pNew";
  for (i in struct.members)
  {
    r += ", ";
    r += struct.members[i].name;
  }
  r += ") == 0)\n";
  r += tabs + tabs + "{\n";
  r += tabs + tabs + tabs + "*pp = pNew;\n";
  r += tabs + tabs + "}\n";
  r += tabs + tabs + "else\n";
  r += tabs + tabs + "{\n";
  r += tabs + tabs + tabs + "r = 2;\n";
  r += tabs + tabs + tabs + "free((void*)pNew);\n";
  r += tabs + tabs + "}\n";
  r += tabs + "}\n";
  r += tabs + "return r;\n";
  r += "}\n";
  return r;
}

function Check(b)
{
  if (!b)
    throw "error";
}

function ParseStruct(text)
{
  var result = text.split(/[\ \n]+/);
  //struct { name
  var struct = {};
  struct.members = [];

  Check(result[0] == "struct");
  struct.name = result[1];
  Check(result[2] == "{");
  var currentIndex = 2 + 1;

  var k = 0;
  while (result[currentIndex] != "}" &&
         result[currentIndex] != "};")
  {
    var vartype = "";
    var varname = "";
    while (1)
    {
      if (result[currentIndex] == "}")
        break;

      if (result[currentIndex].indexOf(";") >= 0)
      {
        varname = result[currentIndex];
        varname = varname.substring(0, varname.length - 1);

        console.log(varname);
        currentIndex++;
        break;
      }
      else
      {
        if (vartype != "")
          vartype += " ";
        vartype += result[currentIndex];
        console.log(vartype);
      }
      currentIndex++;
    }
    var member = {};
    member.type = vartype;
    member.name = varname;
    struct.members.push(member);
    k++;
  }


  return struct;
}

function Generate()
{
  var text1 = document.getElementById("TextArea1").value;

  var struct = {};

  try
  {
    struct = ParseStruct(text1);
  } catch (e)
  {
    alert(e);
  }

  var r = "/*forward declarations*/\n\n";

    //copia a struct
  r += text1;

  r += MakeStaticInit(struct, true);
  r += "\n";
  r += "\n";
  r += MakeInit(struct, true);
  r += "\n";
  r += MakeSwap(struct, true);
  r += "\n";
  r += MakeDestroy(struct, true);
  r += "\n";
  r += "\n";
  r += MakeCreate(struct, true);
  r += "\n";
  r += MakeDelete(struct, true);
  r += "\n";

  document.getElementById("header").innerHTML = CppToHtml(r);
  r = "";
  r += "/*implementation*/\n\n";
  r += "#include <stdlib.h>\n";
  r += "#include <string.h>\n";
  r += "#include <assert.h>\n";
  r += "\n";
  r += "inline int str_create(char** pp, const char* text)\n";
  r += "{\n";
  r += "   assert(pp);\n";
  r += "   int r = 2;\n";
  r += "   size_t n = strlen(text);\n";
  r += "   char *pNew = (char*) malloc (sizeof(char) * (n + 1));\n";
  r += "   if (pNew)\n";
  r += "   {\n";
  r += "      strncpy(pNew, text, n);\n";
  r += "      *pp = pNew;\n";
  r += "      r = 0;\n";
  r += "   }\n";
  r += "   return r;\n";
  r += "}\n";
  r += "\n";


  r += MakeInit(struct, false);
  r += "\n";
  r += MakeSwap(struct, false);
  r += "\n";
  r += MakeDestroy(struct, false);
  r += "\n";
  r += "\n";
  r += MakeCreate(struct, false);
  r += "\n";
  r += MakeDelete(struct, false);

  document.getElementById("source").innerHTML = CppToHtml(r);
}

window.onload = function ()
{
  var s = "";
  s += "struct X\n";
  s += "{\n";
  s += "  int n;\n";
  s += "  const char* text;\n";
  s += "  const char* text1;\n";
  s += "};\n";
  s += "\n";

  var text1 = (document.getElementById("TextArea1"));
  text1.value = s;
};
