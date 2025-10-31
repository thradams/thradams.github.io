#Decomposição como forma de desacoplamento

##Introdução
Uma das métricas existentes para medir a qualidade de um software é o acoplamento entre classes.\\
Um alto acoplamento entre classes cria um software difícil de manter e estender.\\
Com isso, qualquer pequena mudança inicia uma cascata de mudanças em partes dependentes.\\
Quando o tamanho desta cascata não é identificado pelos mantedores e designers o custo de uma mudança não pode ser estimado.\\
Além disso, é criada uma fragilidade, pois pequenas mudanças podem ter um efeito inesperado em diversas partes do software.\\
Devido a esta dificuldade, mudanças benéficas ao usuário são aprovadas com muito mais dificuldade e depois de aprovadas requerem um grande esforço e tempo para serem concluídas.\\
No final, esta complexidade pode se refletir em custos e até em insatisfação de clientes.

O que eu quero mostrar aqui é que a idéia da decomposição de classes pode ser usada para se ver melhor o acoplamento e assim ser adotada uma estratégia para diminuí-lo.


##Medida de acoplamento
Existem várias formas de acoplamento. Uma métrica de acoplamento pode ser definida pelo número de tipos utilizados por uma classe ou função.

Tipos básicos como inteiros não são levados em consideração.

Por exemplo:


```cpp
void F(X x, Y y)
{
  int i = 0;
  Z z = x.z;
  ...
}
```
Neste caso o número de acoplamento de F é 3 pois usa os tipos X, Y e Z.

O valor de acoplamento para cada classe também deve ser levado em consideração. Neste exemplo e nos próximo o acoplamento indireto é 0 somente para facilitar.

Nota 1:\\
Como medida de facilidade de reuso outros fatores também poderiam ser levados em consideração. 
Por exemplo, classes não relacionadas no mesmo header dificultam o reuso e criam uma dependência de compilação.

Nota 2:\\
No VC++ 2008, 2010 existem métricas para código managed. 
Uma delas é justamente o Class Coupling que é calculado da seguinte maneira:

Class Coupling - Measures the coupling to unique classes through parameters, local variables, return types, method calls, generic or template instantiations, base classes, interface implementations, fields defined on external types, and attribute decoration. 



##Acoplamento de funções membro
Quando se trata de funções membro o "this" é um argumento implícito do tipo da classe.\\
Com funções estáticas não existe dependência do argumento this, porém ainda existe dependência do tipo.

Exemplo:
```cpp
class Y;

class X
{
};

class Z
{
  X x;
public:
  Z(Y& y)
  {
  }
  static void F(int i)
  {
  }

  void F2(int i)
  {
  }
}

```

Se a função F está na classe Z, então para usar F será preciso incluir Z e tudo o que Z necessita.\\
Por exemplo, para usar F vou depender de Z que depende de X. O acoplamento de F neste caso é Z X.

Já no caso da função não estática F2 também é preciso uma instância de Z, ou seja tudo o que é preciso para criar Z. Como o construtor usa Y o acoplamento de F2 é X Y Z.

Com isso é possível ver que funções estáticas podem ter um menor acoplamento do que as não estáticas.\\
E funções não membro (soltas) podem ter ainda menos acoplamento, pois se F não depende de Z o seu acoplamento poderia ser 0.

Com acoplamento zero F poderia ser reutilizada em qualquer parte do software sem precisar levar Z.



##A composição e decomposição de tipos 
Geralmente quando criamos classes estamos fazendo uma **composição** de tipos básicos.

Por exemplo:
```cpp
class Date
{
  int day;
  int month;
  int year;
  public:
...
};
```

No exemplo acima, a classe **Date** é formada por 3 dados fundamentais do tipo **int**.\\
A métrica acoplamento da classe Date é zero, pois os tipos básicos não são levados em consideração.



Classes também podem ser uma composição de outras classes.

Exemplo:

```cpp
class Person
{
  int id;
  Date birthday;
}
```


A classe **Person** é formada por um tipo básico **int** que é um identificador único da pessoa, e também possui sua data de nascimento com o tipo **Date**.\\
Com isso a métrica de acoplamento da classe Person é 1, pois utiliza a classe Date.



Agora podemos fazer o caminho inverso e decompor a classe **Person**. \\
Então é feita a explosão da classe que se quebra em tipos menores.

Uma primeira decomposição de Person poderia gerar:
```cpp
 int id;
 Date birthday;
```
E a decomposição completa:
```cpp
 int id;

 int day;
 int month;
 int year;
```



##Como podemos usar essa explosão de tipos para diminuir o acoplamento?

Para exemplificar vou utilizar a uma função "GetAge" que calcula a idade da pessoa representada pela classe Person, baseada no seu dia de nascimento.

```cpp
int GetAge(const Person& person)
{
  Date birthday = person.birthday;
  ...
}
```
A função GetAge recebe o parâmetro Person do qual vai perguntar a data de nascimento.

A métrica de acoplamento de da função acima é 2. Pois utiliza a classe Person e a classe Date através da data de nascimento.

Fazendo uma decomposição em **Person** poderíamos ter:

```cpp
int GetAge(int id, Date&)
{
  ...
  return years;
}
```
Neste caso o acoplamento é um, pois utiliza somente a classe Date.

Se decompormos **Date** temos:

```cpp
int GetAge(int id, int year, int month, int day)
{
  ...
  return years;
}
```
Agora o acoplamento é zero.


Com estes exemplos é possível ver que explodindo classes em tipos básicos o acoplamento vai diminuindo.\\
Por outro lado, o encapsulamento e a lógica dos dados é perdida.\\
Na função GetAge que não recebe nenhuma classe, a validação de year, month e day deveria ser feita na função afinal nada garante a origem dos dados.\\
Caso outras funções de data fossem escritas esta lógica de validação iria ficar duplicada ou uma função de validação seria compartilhada. Mas de qualquer forma o encapsulamento dos dados seria perdida.

Moral da história: 

# Decompondo classes o acoplamento vai diminuindo
# Quando fazemos a decomposição fica mais fácil perceber que nem todas as partes da classe são usadas em determinada função.
# Não adianta decompor a classe a tal ponto que se perca o encapsulamento
# Acoplamento menor não significa que é melhor


Então a melhor forma de escrever GetAge seria:

```cpp
  int GetAge(const Date& date)
  { 
    ...
    return years;
  }
```

Pois tem o menor acoplamento sem perder o encapulamento.

A solução genérica seria uma função que calcula o número de anos entre Datas.\\
A GetAge poderia ser apenas uma interpretação desta função e poderia ser membro da classe Person ou não membro. \\
O reuso da função não seria através de person mas através da Função DifferenceInYears por exemplo.
Como "DifferenceInYears" depende de Date ela pode ficar no mesmo header.

##Então qual seria a melhor ponto de decomposição?
O melhor ponto é aquele em que não se perde o encapsulamento para efeitos daquela operação e se tem os tipos fundamentais para aquela função

##Conclusão
Espero que esta visão mostrada aqui de decompor a classe seja útil para demonstrar a idéia de que funções podem ter um menor acoplamento e uma maior clareza se elas utilizarem os dados e tipos mínimos necessários para funcionar mantendo o encapsulamento naquele contexto.

