##Clear x Destroy


Alguns programas em C, utilizam o conceito de "Clear" em substituição ao conceito de "Destroy".

Por exemplo,

```cpp

typedef struct 
{

} X;

X_Initialize()
{
}

X_Clear()
{
}

```
Exemplo de uso:

```cpp
int main()
{
  X x;
  X_Initialize(&x);
  X_Clear(&x);
}
```

#Qual é o problema desta abordagem?

Limpar e destruir não é a mesma operação. Inclusive o conceito de limpar pode existir e não ser suficiente para a destruição.

Vamos pegar o exemplo de um array que aloca objetos dentro. O conceito de clear poderia simplesmente zerar o tamanho do array sem desalocar memória.  Sendo assim, um clear ao final do escopo do array não seria suficiente para ele liberar a memória utilizada.

Já o conceito de destroy é direto. Após a destruição o objeto não pode mais ser usado e qualquer memória ou outro recurso que está sob a custódia do objeto será liberado.

O destroy também é mais eficiente do que o Clear. O Clear supoe que o objeto pode ser reutilizado e limpa todas as variáveis. Já o detroy somente precisa liberar os recursos e não precisa zerar nada, pois após o destroy o objeto não deve mais ser utilizado.

Outro problema é que existir um método clear não significa que ele seja obrigado a ser chamado. Uma struct simples pode ter um método clear e não precisar ser destruída. Assim não é claro se é obrigatório chamar o clear ou se é opcional.


