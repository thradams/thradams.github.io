==Tag-dispathing.==

( Nota: Para entender o tag dispathing � importante saber o que � uma especializa��o de templates e tamb�m Traits. Um artigo mais introdut�rio pode ser encontrado aqui: [[http://www.thradams.com/codeblog/templates.pdf|http://www.thradams.com/codeblog/templates.pdf]] )

Antes de iniciar o assunto tag-dispathing, quero lembrar rapidamente o conceito de sobrecarga (overloading).

Sobrecarregar fun��es significa criar fun��es com o mesmo nome mas com assinaturas diferentes. Ou seja, o tipo ou o n�mero de par�metros � diferente em cada uma.

Por exemplo:
{{{cpp
 int abs(int i) {...}
 double abs(double d) {...}
}}}
A fun��o correta ser� chamada de acordo com o argumento passado.

Tag dispathing � uma t�cnica que usa a sobrecarga de fun��es adicionando um par�metro extra apenas para servir de controle e sele��o de uma fun��o. Este par�metro extra � tipo chamado **"tag"**.


Para demonstrar a motiva��o � melhor ver um exemplo:


Vamos supor que eu tenha os tipos S1, S2 e S3.

{{{cpp
struct S1 {}; 
struct S2 {};
struct S3 {};
}}}

E uma fun��o gen�rica para T
{{{cpp
template<class T> void Search(T& v) { ... }
}}}

Vamos supor que os tipos S1 e S2 tenham uma caracter�stica especial aonde a implementa��o de Search poderia ser otimizada.

Uma solu��o seria criar uma especializa��o de Search para S1 e outra especializa��o de Search para S2. 
{{{cpp
template<> void Search(S1& v) { ... }
template<> void Search(S2& v) { ... }
}}}
No entanto se a implementa��o para S1 e S2 forem iguais estar�amos duplicando c�digo.

Ent�o para compartilhar o c�digo poderiamos ter:

{{{cpp
template<class T> void SearchOptimezed(T& v) { ... }

template<> void Search(S1& v) { SearchOptimezed(v); }
template<> void Search(S2& v) { SearchOptimezed(v); }
}}}

O tag dispatch � outra alternativa para resolver esta quest�o.

Com o tag dispatch � criado um tag para representar as caracteristicas em comum de S1 e S2.

Por exemplo:
{{{cpp
struct OptimezedTag{};
struct NonOptimezedTag{};
}}}

Depois � preciso associar o tipo (S1, S2 etc) ao tag. Para isso existem  duas formas. 

Uma intrusiva aonde um //typedef// no tipo vai dizer se ele pode ou n�o usar o algor�tmo especializado ou uma forma n�o intrusiva atrav�s de "Traits".

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

E a forma n�o intrusiva com um Traits seria:

{{{cpp
// O caso geral ser� o n�o especializado
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


Duas vers�es de implementa��o da fun��o Search s�o criadas com o mesmo nome por�m com o tipo de tag diferente.

{{{cpp
template<class T> void SearchImp(T& v, OptimezedTag) { ... }
template<class T> void SearchImp(T& v, NonOptimezedTag) { ... }
}}}


Ent�o a fun��o Search pode escolher a implementa��o correta usando a sobrecarga atrav�s do tag associado de cada tipo.


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

O resultado final disso tudo � que o compilador saber� selecionar a fun��o mais correta para cada tipo.


===Refer�ncias===

[[http://www.boost.org/community/generic_programming.html|http://www.boost.org/community/generic_programming.html]]


([[http://www.thradams.com/codeblog/tagdispatch.txt|Vers�o txt]])
