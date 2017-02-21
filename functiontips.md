##Algums esclarecimentos sobre o std::function

O function não representa exatamente um ponteiro para função.
E não existe como fazer um ponteiro genérico de função membro. 

O function faz uma chamada através de uma assinatura pré-determinada para um objeto função, para um função solta ou uma função membro. 
  
Essa assinatura é o parâmetro do template. 
 
Por exemplo: 
```cpp
function<int (X*)> f; 
```
Isso quer dizer que "f" vai ser chamada passando um X* e retornando um 
int. 
    
O function não determina se vai fazer uma chamada para função solta, 
função membro ou objeto função. 

Mas a lógica da chamada é modificada para o caso de ponteiros de 
função membro. 

Vou explicar com exemplos: 

Por exemplo, se apontar para uma função solta: 
```cpp
int func2(X*) { return 2; } 
void main() 
{ 
  function<int (X*)> f; 
  f = &func2; 
  X x; 
  f(&x); 
} 
```

Neste exemplo o "f(&x);" vai chamar a func2 passando o argumento X. \\
Mas se eu apontar para uma função membro:

```cpp

struct X { 
  int func() { return 2; } 
};

void main() 
{ 
  function<int (X*)> f; 
  f = &X::func; 
  X x; 
  f(&x); 
} 
```

Vai chamar a X::func da instância &x sem passar parâmetros. 

Resumindo a lógica é a seguinte: 

Se é um ponteiro para função membro, então o primeiro argumento é 
considerado o "this" do objeto. 

Caso contrário ele é tratado como um argumento convencional. 

Ou seja, é preciso dizer o tipo do objeto para funções membro.
Então 
não é possível criar um ponteiro para uma classe qualquer. 

Então não serve para nada? 

Serve, pois é só fazer um objeto função que faça a tradução da 
chamada: 
```cpp
struct X { 
  int func() { return 2; } 
}; 

struct callX 
{ 
  X &x; 
  callX(X &x_) : x(x_){} 
  int operator ()() 
  { 
    return x.func(); 
  } 
}; 

void main() 
{ 
  function<int (void)> f; 
  X x; 
  f = callX(x); 
  f(); 
} 
```
A regra para objetos função é a mesma que para funções não membro. 
(por isso eu removi o X* da assinatura) \\
Ok, agora eu posso usar para qualquer tipo de classe. Mas vou ter que 
criar este adaptador cada vez que eu precisar chamar uma classe 
diferente? 

Não, você não precisa. Para isso que serve o bind. (além de outras 
coisas...) 

A função bind cria adaptadores para você dos mais variados tipos. 

Então por exemplo:
```cpp
void main() 
{ 
  function<int (void)> f; 
  X x; 
  f = bind(&X::func, &x); 
  f(); 
} 
```
Neste exemplo o bind vai criar um objeto como o criado "na mão" 
anteriormente. 
Se voce quiser o bind também pode ser usado para levar argumentos para 
você. 
```cpp
struct X { 
  int func(int ) { return 2; } 
}; 

void main() 
{ 
  function<int (void)> f; 
  X x; 
  f = bind(&X::func, &x, 1); 
  f(); 
} 
```

(Este texto foi colocado por mim na lista http://groups.google.com.br/group/ccppbrasil em 8 abr 2008)
