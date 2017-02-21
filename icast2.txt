
===Alternativa ao interface_cast===

(Ver o post anterior sobre o interface-cast.)


Seguindo a motivação original:

#	O objeto não precisa saber como os outros o veem
#	O polimorfismo pode ser adicionado depois


Digamos que eu tenha a classe Button:
{{{cpp
struct Button {
  void Draw(Args args) {...}
  void KeyDown(int key) {...}
  void MouseDown(int x, int y) {...}
};
}}}
Eu poderia usar esta classe diretamente desta forma:

{{{cpp
struct Window
{
  Button button;  
  void OnPaint()  {  ... button.Draw(args); ... }
  ...
}
}}}
Agora, digamos que eu queria ver o Button de uma maneira polimórfica como um Control e assim ter uma lista de controles implementando esta interface.
Eu poderia fazer o Control derivado de "KeyEventReceiver", "MouseEventReceiver" e "IDraw" ou simplesmente colocar todas as funções dentro de Control sem nenhuma hierarquia extra. Porém eu não quero decidir nada antes de ver os algoritmos e o uso.\\
A alternativa para o interface_cast poderia ser:

{{{cpp
struct NonPolymorphic {};
Template<class TInterface = NonPolymorphic>
struct Button : public TInterface {
  void Draw(Args args) {...} 
  void KeyDown(int key) {...}
  void MouseDown(int x, int y) {...}
};
}}}
Agora, nós temos a classe Button e uma interface. O Button não precisa conhecer nada sobre a TInterface. (1)

Para usar um Button não polimórfico nós poderíamos fazer:
{{{cpp
 Button<> button;
}}}

Para ver o Button como um Control polimórfico nós poderíamos fazer: 


Primeiro declarar a interface. (Como queremos ver o Button?) (2)

{{{cpp
struct Control  
{
  virtual void Draw(Args args) =0;
  virtual void KeyDown(int key) =0;
  virtual void MouseDown(int x, int y) =0;
 }
}}}
Depois passar esta interface para o parâmetro do template, e o uso seria:
{{{cpp
vector<Control*> v;
v.push_back( new Button<Control> );
}}}
Basicamente o padrão é deixar em branco a classe Base. A interface é decidida de acordo com o uso. Se o Button for sempre visto de maneira polimórfica é melhor ter um typedef do que ficar vendo o template  o tempo todo.
