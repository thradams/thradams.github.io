
##Almost generic member function pointer

Motivation:


I have a class called MyDialog.\\
Inside it, I have a Button that needs to send events to MyDialog.

For instance, button.OnClick should call "MyDialog::ButtonClick".

of MyDialog and I want to use this pointer to call functions of MyDialog. (Button events)

In other words, the button needs to call functions in an unknown type. But he knows that it will be inserted inside a dialog or some class derived from dialog.

The simple solution is to use std::function and bind.

```cpp

struct Button {
 Dialog* parent;
 std::function<void (void)> onclick;
};

struct MyDialog : public Dialog {
 Button btn;
 MyDialog()  {
   btn.parent = this;
   btn.onclick = &std::bind(MyDialog::OnBtnClick, this);
 }
 void OnBtnClick() {}
};

```

The std::function will cost 24 bytes plus 24 bytes of bind dynamic
allocation (using VC++).


Instead of to keep one pointer for each event I would like to use the pointer I already have in Button to call all events in MyDialog.



Solution:

The button class doesn't known "MyDialog", but it knowns a function signature that can make the call casting from Dialog to MyDialog.

If the class Dialog is polimorphic we can use dynamic_cast and return do MyDialog pointer.

For non polimorphic classes, the programmer must ensure that the pointer will point do some object of the type MyDialog. The static_cast will set the pointer correctly if the classes have correlation.

```cpp

template<class T, class KnownType, void (T::*pmf)(void)>
void call(KnownType* pobject)
{
 // programer responsability
 T* p = static_cast<T*>(pobject);

 //runtime check if avaiable (polimorphic type)
 //p = dynamic_cast<T*>(pobject);

 (p->*pmf)();
}

typedef void (*OnClickEvent)(Dialog*);

struct Button {
 Dialog* parent;
 OnClickEvent onclick;
};

struct MyDialog : public Dialog {
 Button btn;
 MyDialog()  {
   btn.parent = this;
   btn.onclick = &call<MyDialog, Dialog, &MyDialog::OnBtnClick>;
 }
 void OnBtnClick() {}
};

Button::FireEvent()
{
  btn.onclick(parent);
}

```

This way, each event will cost 4 bytes with no dynamic memory allocation.

Using std::function I could call different objects
but most of the time the call is just for parent.
