##How to declare a const function pointer?


In other words, where "const" goes? :D

Anwser:

```cpp
 void (* const fptr)(argument&);

void (* const Button::Draw)(Button&) = DrawButton;
```
