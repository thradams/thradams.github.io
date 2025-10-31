
Estava pensando: Por que tenho que expressar as interfaces \\de um objeto na sua declara��o?

Eu n�o tenho que expressar no tipo do objeto, por exemplo, se ele vai ser instanciado na pilha ou no heap. Isso permite que use o mesmo objeto nos dois modos.

A mesma id�ia poderia ser aplicada no polimorfismo.\\
Eu poderia ter uma defini��o de classe e escolher se eu quero que seja polim�rfica ou n�o. Mais ainda, eu poderia escolher como eu vou ver aquele objeto e ele n�o precisa saber como ser�.

Uma raz�o para fazer isso, � porque a heran�a complica o design e dificulta mudan�as.

O polimorfismo est�tico e os algor�tmos gen�ricos, resolvem este problema em alguns casos, mas eles n�o resolvem o problema quando o polirmorfismo din�mico � necess�rio.

Digamos que eu tenha uma lista de Cars e Dogs.\\
Ambos t�m a propriedade Cor. Para aplicar um algor�tmo que usa a propriedade Cor nesta lista eu precisarei implementar uma interface comum em Car e Dog.
Tenho que artificialmente criar esta interface comum apenas para acessar a Cor. Se a classe base de Dog � Animal e j� tem a propriedade Cor isto n�o vai ajudar, pois carro n�o � derivado de Animal. Se Car for derivado de Vehicle e Vehicle tiver a propriedade cor isso tamb�m n�o ajuda.

Agora digamos que eu tenha essa interface em comum mas em outro programa eu vou usar apenas a classe Car. Para este programa a interface Vehicle � suficiente, porque vou ter uma lista somente de Vehicle. N�o vou precisar de Aninal neste caso.

Este exemplo mostra que o mesmo objeto Car pode ser visto diferentemente em dois lugares. O objeto carro � exatamente o mesmo ele tem a propriedade cor. "A beleza est� nos olhos de quem v�"

Tentando lidar com esta quest�o, eu fiz um experimento com a "interface_cast".


Exemplo:

{{{cpp
struct Car {
  int Color() {return 1;}
};

struct Dog {
  int Color() {return 2;}
};
}}}

Eu preciso em algum software / algoritimo ver a Cor de uma maneira polim�rfica.
Para isso eu vou usar uma "vis�o" ou interface.

{{{cpp
struct IColor { virtual int Color() = 0; };
}}}
O uso de "interface_cast" " � algo como: (O resultado final)
{{{cpp
Car car;
Dog dog;

IColor& rCar = interface_cast<IColor>(car);
cout  << rCar.Color();
IColor& rDog = interface_cast<IColor>(dog);  
cout  << rDog.Color();
}}}

A fun��o interface_cast retorna um objeto derivado de da interface (IColor) que faz a convers�o de chamada.

{{{cpp

template<class TObject, class TInterface> 
struct InterfaceAdapter; // Not Implemented

template<class TInterface, class TObject>
InterfaceAdapter<TObject, TInterface> interface_cast(TObject& r)
{
    return InterfaceAdapter<TObject, TInterface>(r);
}
}}}

O objeto retornado "InterfaceAdapter" precisa ser criado manualmente.

Para este caso:
{{{cpp
template<class T>
struct InterfaceAdapter<T, IColor> : public IColor
{
    T& m_r;
    InterfaceAdapter(T& r) : m_r(r) {}

    virtual int Color()
    {
        return m_r.Color(); //call
    }
};
}}}

A propriedade cor poderia ter um sintaxe diferente, por exemplo MyColor. Neste caso, uma vers�o mais especializada de InterfaceAdapter tem que ser criada.
{{{cpp
template<>
struct InterfaceAdapter<Car, IColor> : public IColor
{
    Car& m_r;
    InterfaceAdapter(Car& r) : m_r(r) {}

    virtual int Color()
    {
        return m_r.MyColor(); //call
    }
};
}}}

Para manter o objeto de uma maneira polim�rfica em um container n�s poder�amos ter algo como:


{{{cpp
template<class TObject, class TInterface> 
struct InterfaceAdapterInstance : public InterfaceAdapter<TObject, TInterface>
{
  TObject m_obj;
  InterfaceAdapterInstance() : InterfaceAdapter<TObject, TInterface>(m_obj){}
};

template<class TObject, class TInterface>
InterfaceAdapterInstance<TObject, TInterface>* New()
{
    return new InterfaceAdapterInstance<TObject, TInterface>;   
}

std::vector<IColor*> v;   
v.push_back(New<Car, IColor>());
v.push_back(New<Dog, IColor>());
}}}

Eu penso que existe uma rela��o com a id�ia dos concepts. mas neste caso com um comportamento polim�rfico e din�mico.

Eu iria aprecisar seu coment�rio sobre isto.


