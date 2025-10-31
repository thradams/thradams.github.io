==Tag-dispathing.==

( Nota: Para entender o tag dispathing é importante saber o que é uma especializaçào de templates e também Traits. Um artigo mais introdutório pode ser encontrado aqui: [[http://www.thradams.com/codeblog/templates.pdf|http://www.thradams.com/codeblog/templates.pdf]] )

Antes de iniciar o assunto tag-dispathing, quero lembrar rapidamente o conceito de sobrecarga (overloading).

Sobrecarregar funções significa criar funções com o mesmo nome mas com assinaturas diferentes. Ou seja, o tipo ou o número de parâmetros é diferente em cada uma.

Por exemplo:
{{{cpp
 int abs(int i) {...}
 double abs(double d) {...}
}}}
A função correta será chamada de acordo com o argumento passado.

Tag dispathing é uma técnica que usa a sobrecarga de funções adicionando um parâmetro extra apenas para servir de controle e seleção de uma função. Este parâmetro extra é tipo chamado **"tag"**.


Para demonstrar a motivação é melhor ver um exemplo:


Vamos supor que eu tenha os tipos S1, S2 e S3.

{{{cpp
struct S1 {}; 
struct S2 {};
struct S3 {};
}}}

E uma função genérica para T
{{{cpp
template<class T> void Search(T& v) { ... }
}}}

Vamos supor que os tipos S1 e S2 tenham uma característica especial aonde a implementação de Search poderia ser otimizada.

Uma solução seria criar uma especialização de Search para S1 e outra especialização de Search para S2. 
{{{cpp
template<> void Search(S1& v) { ... }
template<> void Search(S2& v) { ... }
}}}
No entanto se a implementação para S1 e S2 forem iguais estaríamos duplicando código.

Então para compartilhar o código poderiamos ter:

{{{cpp
template<class T> void SearchOptimezed(T& v) { ... }

template<> void Search(S1& v) { SearchOptimezed(v); }
template<> void Search(S2& v) { SearchOptimezed(v); }
}}}

O tag dispatch é outra alternativa para resolver esta questão.

Com o tag dispatch é criado um tag para representar as caracteristicas em comum de S1 e S2.

Por exemplo:
{{{cpp
struct OptimezedTag{};
struct NonOptimezedTag{};
}}}

Depois é preciso associar o tipo (S1, S2 etc) ao tag. Para isso existem  duas formas. 

Uma intrusiva aonde um //typedef// no tipo vai dizer se ele pode ou não usar o algorítmo especializado ou uma forma não intrusiva através de "Traits".

A forma intrusiva seria por exemplo:
{{{cpp
struct S1 
{ 
  typedef OptimezedTag type;
  ...
} 

struct S2
{ 
  typedef OptimezedTag type; 
  ...
} 
}}}

E a forma não intrusiva com um Traits seria:

{{{cpp
// O caso geral será o não especializado
template<class T> struct Traits 
{ 
  typedef NonOptimezedTag type;
} 

// S1 pode usar o caso otimizado
template< > struct Traits <S1> 
{
 typedef OptimezedTag type; 
}

// S2 pode usar o caso otimizado 
template< > struct Traits <S2> 
{
 typedef OptimezedTag type; 
}
}}}


Duas versões de implementação da função Search são criadas com o mesmo nome porém com o tipo de tag diferente.

{{{cpp
template<class T> void SearchImp(T& v, OptimezedTag) { ... }
template<class T> void SearchImp(T& v, NonOptimezedTag) { ... }
}}}


Então a função Search pode escolher a implementação correta usando a sobrecarga através do tag associado de cada tipo.


1) Para o caso de estar usando Traits:
{{{cpp
template<class T> void Search(T& v) 
{
  typename Traits<T>::type t;
  SearchImp(v, t);
}
}}}

2) Ou o caso do existir o typedef

{{{cpp
template<class T> void Search(T& v) 
{
  typename T::type t;
  SearchImp(v, t);
}
}}}

O resultado final disso tudo é que o compilador saberá selecionar a função mais correta para cada tipo.


===Referências===

[[http://www.boost.org/community/generic_programming.html|http://www.boost.org/community/generic_programming.html]]


([[http://www.thradams.com/codeblog/tagdispatch.txt|Versão txt]])
