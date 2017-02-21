#C para programadores C++ - Construtores e destrutores em C

Os objetos em C podem ser contruídos de duas formas

* Por inicialização estática
* Por inicialização durante a execução do programa

## Inicialização estática

Este tipo de inicialização é feita com uma atribuição na declaração.

Exemplo de inicialização de uma variável global.

```cpp
struct Point {
  int x;
  int y
};

struct Point point = { 0 , 0 };
```

Exemplo para variáveis locais

```cpp
void f()
{
  struct Point point = { 0 , 0 };
}
  
```
Ambos os exemplos são chamados de inicialização estática.

Na prática, somente o primeiro ocorre efetivalmente antes da execução do programa.

Esta forma de inicialização trás consigo um problema. 

Ela depende do conhecimento da representação exata do objeto para ser usada. 
Imagine que o mesmo objeto Point está sendo inicializado em vários lugares e alguém decide mudar o tipo da coordenada de int para double ou adicionar uma terceira coordenada. 
Neste caso todos os locais de inicialização teriam que ser revistos e atualizados.

A forma que os programadores evitam este problema é através da criação de uma macro de inicialização.
```cpp
struct Point {
  int x;
  int y
};
#define POINT_INIT {0, 0}

void f()
{
  struct Point point = POINT_INIT;
}

```
Esta macro é declarada com o tipo e pode ser usada em todos os lugares aonde o tipo seja usado.
Caso hava alguma mudança na struct o programador pode simplestemente atualizar a macro. 

Umas das características importantes é que também é possível compor tipos.

```
struct Line {
  Point start;
  Point end;
};

#define LINE_INIT { POINT_INIT , POINT_INIT }
```

Além disso, se necessário, pode-se passar parâmetros  e fazer alguma expressão desde que ela seja estática.
Arrays e strings também podem ser inicializados desta forma.


## Inicialização dinâmica, ou em tempo de execução

Nem sempre é possível usar a inicialição estática. 
Não é possível, por exemplo, compor nesta forma estática constructores que podem falhar.

Neste caso é normamente oferecido um constructor não estático na forma de uma função especial.

```cpp

struct ArrayInts {
  int* p;
};

ErrorCode ArrayInts_Init(struct ArrayInts* p, size_t n)
{
  p->p = malloc(sizeof(int) * n);
  if (p->p == NULL)
  {
    return ErrorCode_OutOfMem;
  }
  return ErrorCode_Ok;
}
```

O que esta função têm de especial?

Uma das características desta função é que o argumento (que é o tipo a ser inicializado) 
não contém nenhum estado válido na entrada. Em outras palavras, o input só pode ser usado 
para inicialização.

Após uma inicialização com sucesso todos os membros da struct devem estar inicializados.

O exemplo do array foi escolhido aqui, pois ele não teria como ser inicializado de forma estática.

Com este exemplo também entramos na questão do destructor. Quando o array foi inicializado ele alocou memória que ficou sob sua custodia. Desta forma, quando o objeto parar de ser usado ele precisa retornar esta memória.

```
void ArrayInts_Destroy(struct ArrayInts* p)
{
  if (p)
  {
    free(p->p);
  }
}
```

Por que o destructor é uma função especial?

Após a chamada do destructor o objeto **não se encontra mais em um estado válido** e não deve ser acessado.
No caso do C++, a não ser que se chama um destructor diretamente, não é possível mais usar o objeto já que o destructor é chamado na saída do escopo.

O par constructor e destructor, formam no C o seguinte padrão.
```
struct ArrayInts values;
ErrorCode result = ArrayInts_Init(&values);
if (result == ErrorCode_Ok)
{
  ArrayInts_Destroy(&values);
}

```
Para toda inicialização com sucesso haverá um Destroy. 
Existe uma exceção a esta regra mas ela será mostrada com o conceito de move.

Algums programadores C não adotam o conceito de destructor. 
Ao invés disso, ele utilizam o conceito de limpar, ou devolver o objeto a um estado inicial.
Geralmente a função então se chama clear.

A diferença é que após um clear o objeto pode ser usado e no destructor não.
Então o destructor é mais otimizado pois ele evita zerar valores na struct que não serão mais usados.

A memória de um objeto pode ser usada novamente após o destructor. Basta chamar o init.


Umas das diferenças entre o C e o C++, é que o destrutor no C pode conter parâmetros embora isso seja raro.


Como reportar erros?

Em C++, o modo mais comum de reportar erros no constructor é através de exceções.

Em C, o erro é normalmente reportado com um código de retorno da função.

Uma questão importante nas funções de inicialização é garantir que em caso de erro nenhum efeito colateral seja observado como um vazamento de memória. Este comportamento que é feito automaticamente pelo C++, no C têm que ser feito na mão.

Exemplo:

```cpp
struct Data {
  ArrayInts ValuesIn;
  ArrayInts ValuesOut;
};

ErrorCode Data_Init(struct Data* p)
{
  ErrorCode result = ArrayInts_Init(&p->ValuesIn);
  if (result == ErrorCode_Ok)
  {
    result = ArrayInts_Init(&p->ValuesOut);
    if (result != ErrorCode_Ok)
    {
       //é preciso liberar a memória de ValuesIn
    }
  }
  return result;
}

```
Com isso nós entramos na questão dos destructores.

O destrutor no C também é um função especial que tem o efeito inverso ao constructor.
O destrutor tem a função de desfazer a inicialização. Se houve alocação de memória por exemplo, e esta memória está sob custódia do objeto, então é preciso liberar este recurso.

```
ErrorCode Data_D(struct Data* p)
{
  ErrorCode result = ArrayInts_Init(&p->ValuesIn);
  if (result == ErrorCode_Ok)
  {
    result = ArrayInts_Init(&p->ValuesOut);
    if (result != ErrorCode_Ok)
    {
       //é preciso liberar a memória de ValuesIn
    }
  }
  return result;
}
```

##Curiosidade do C
No C é possível fazer um constructor para vários objetos. A mesma coisa para o destructor.
Por exemplo, 

```c
struct X { int i; } ;
struct Y { int i; } ;
```





