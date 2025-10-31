
##TklGen

###Introduction
Tklgen is a scanner and parser generator.

The grammar used by tklgen is LL(1) and the generated parser is C++ top-down recursive-descendent.

The input file is a grammar LL(1) describing productions and terminals.

###Grammar syntax

```cpp
module tklgen
{
  language tklgen
  {
    //tokens (terminals)
    //syntax (productions)
  }
}
```

You can comment your grammar using line or block comments in the same way of C++.

The identifier after the **module** keyword is used to name the output files. 

The identifer after the **language** keyword is used as C++ namespaces to avoid name conflits.

Inside the language there are token declarations (terminals), and syntax declarations (productions).  

The **token** declaration is used to tell all the terminal symbols.

Sample:
```
  token Integer  = ('0'..'9')+;
```

Tokens operators

```
 ?         : Optional
 +         : One or more
 *         : Zero or more
 |         : Or operator
 'a'...'z' : Range
 any       : Any symbol
 "string"  : Sequence of characteres
 'c'       : One characteres
```


The **interleave** is an especial token that is ignored by the scanner. 

Sample:
```
  interleave Blanks = (' ' | '\n' | '\r')+;
```


The **syntax** declaration declares the production. The "Main" production is obrigatory.

Sample:
```
  syntax Main = A;
  syntax A = Integer | empty;
```

The **empty** keyword declares an empty production.\\
The or "|" symbol is used to declare multiple productions.

A complete sample is the tklgen grammar used to describe itself:

[TKLGEN Grammar\(klgengrammar.htm)


###Parser components:

Generated files:

 * Parser (header and cpp)
 * DFA  (used by tokenizer)

Existing files:

 * InputStream: [[FileStream.htm|FileStream]], [[StringStream.htm|StringStream]]
 * Tokenizer: [[Tokenizertklgen.htm|Tokenizer]]


##Calculator

[Expression Sample](expressionsample.htm)

[JSON grammar sample](jsonsample.htm)


###References

* "Compilers: Principles, Techniques, and Tools", Alfred V. Aho , Ravi Sethi , Jeffrey D. Ullman


###Download
Requires a serial key. Please send me an e-mail.

Download : [tklgen.zip](tklgen.zip)


