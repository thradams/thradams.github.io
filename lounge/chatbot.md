

Algorítmo

O objetivo deste algorítmo é entender uma frase.

Exemplo

Qual é seu nome?

A ideia central é que vários "ifs" decidirão o significado.

Nós fazemos uma lista de perguntas ou 'ifs'.

As perguntas para esta frase poderiam ser.

 1 - A primeira palavra é 'Qual' ?
 2 - A segunda palavra é 'é' ? 
 3 - A terceira palavra é 'seu' ? 
 4 - A quarta palavra é 'nome' ?  
 5 - A quinta palavra é '?' ? 

Se todas estas perguntas tiverem resposta afirmativa
significa que atingimos um estado conhecido definido
por um ser humano. Neste caso o estado seria
"Quem perguntou quer saber seu nome".

Existem várias destas listas de perguntas para entender 
cada frase.
O algorítmo força bruta é passar por todas as listas
verificando cada pergunta. Se todas as respostas 
da lista forem positivas atingimos o estado.

(
 Notem que podemos fazer as perguntas de forma não sequencial.
)


Otimização:

Representamos cada lista de perguntas como uma linha
com perguntas ordenadas.

Exemplo:
0: 2 10 24  

Esta é a linha 0.
Ela tem a pergunta 2, pergunta 10, pergunta 24.

Temos várias linhas também ordenadas pelas perguntas
formando uma tabela:

    0  1  2
----------------
0:  2 10 24
1:  2 11 12
2:  3 10
3:  9 10 12 54
----------------

Dado uma entrada nós começamos fazendo a primeira 
pergunta da primeira linha. (pergunta 2)

Se a resposta for true fazemos a pergunta seguinte da 
mesma linha (pergunta 10). Caso contrário passamos para 
próxima linha.

Se a próxima linha tem mesmo começo de perguntas 
  Fazemos a próxima pergunta (pergunta 11) nesta linha
  e assim por diante.
Senão
  Fazemos a primeira pergunta desta nova linha


