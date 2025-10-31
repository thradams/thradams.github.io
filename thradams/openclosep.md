
==Open and Closed Polymorphism==

Polymorphism allow us to use a set of types using a common interface for all of them. 
This is traditional object oriented programming.

For instance, we can have the base class **Plugin** and derived classes like **JavaPlugin** and **CSharpPlugin**.
The common interface in this case is the **Plugin** class.

The set of types that can be used as **Plugin** are.

{{{
Set of possible plugins
+--------------+
+ JavaPlugin   +
+              +
+ CSharpPlugin +
+--------------+
}}}

But, let's say we are writing an IDE and we will allow other people write their own plugins using dynamic libraries.
Anyone could create a new type derived from Plugin and this type could be added to the set of types.
This is what I call "open polymorphism". The set of types is open.

Now let's say our IDE have some base class **Control** and derived classes **ButtonControl** and **EditControl**.
{{{
Set of possible Commands
+---------------+
+ ButtonControl +
+               +
+ EditControl   +
+---------------+
}}}
These types are not supposed to be used by any plugins.\
So this set are determined and closed when the program compiles.\
This situation I call closed polymorphism.

You may have hurt about "static polymorphism".\
This is not the same. With static polymorphism the type used by a template instantiation is known at the compile type ate the point of use.
With the closed polymorphism the type is not know, but the set of all possible types are.

The way how polirosh is implemented in C++, allow the "open" caracteristics even if you don't need it.\
The vtable model adopted allow this behaviour.

Im my experience most cases don't need the open polirmosh, because we don't need plugins all the time. 
The closed polimorpihm allow diferent ways of implementations without virtual tables.
The implementation could be for instance based on an compiled type switch for all types. 

The closed polimorhis allow us to think in the problem diferentlly, and this I think would be the most impornt caracteristic.


For instace, in our sample, we have the Control class. Probably this control class would be like:

{{{cpp
   class Control
   {
      ~Control()=0;
      virtual void Draw() = 0;
      virtual void OnKeyDown()=0;
      virtual void OnMouseDown() = 0;
      virtual void Serialize()=0;
   }
}}}

So, we have to managed the interface name and all possible common behaviur betteen all types.

Whould I have created the KeybordEvent onterface and/or the 
the MouseEvent interface and/or the Serializable interface and/or the Drawable interface, or
just put everthing inside the control interface?

If you have worked with OOP for years you will know what I am talking about.
Even if you are begginer, how many times have you asked yourself or our collegues about the best set of functions of one interface?
These problem, don't solve automatically when you design your class diagrams. This problem will be with you for many months until your design stabilzes. And the stabilization can be broken at any time by a new custumer requirements.
Even when the stabilization is done, the program is working and everone is happly, you will realize that all the class ierquies are customized for the current software and the re-use of code will be hard becase each set of interface was created to satifiy the necessity of your current problem.

Well, I think resumes one of the biggest problems of OOP. I use OOP, but I am aware of these drawbacks.


So how closed polimorsh could help this problem?

We need a new concept that is the type sets.

I think a new concept would be usefull. 
It tell us what sets of types can be used with the same interface, but without to informa what interface is.
I belease we need some compiler suport for this.

So Let's say I want to create the set Control

type set Control = { ButtonControl, EditControl };

set can have other sets. for instance

type set ControlsWithKeyboard = { Control};


Now, I can use these sets in colletions. For insance, I can create an collection of Controls.

vector<controls> c;

in this case the compiler should generate some functions for us. For isntce, the push back would accpet onle Button Control and EditControl.

The interesting on this model we dont need to say anithing in button or editcotnrol. The information of sets are separeted from types.

Now lets se we want to draw all controls

{{{
vector<Controls> controls;

for each control in controls
{
   control.draw();
}
}}}
We need compiler supert againg. Now the compiler must call the proper draw function based on the runtime type of the control
The implmenetation could be switch.

How this model would help? Hwat are the advantages?

This model makes very esy to play with the interfaces and makes the class reause much more easier.
We don't need to thinkg in big hierachies and make a lot of rounds of design. The design will be archived naturraly



or
{{{
vector< {ButtonControl, EditControl}> controls;

for each control in controls sub set Keyboard
{
   control.draw();
}


}}}


The push back would be a template function and would accept only ButtonControl and EditControl Types.
We don't have any base classe anymore.
We dont have sets of functions to worry about. We can create new set at any time if we want.


{{{
vector< {ButtonControl, EditControl}> controls;

==Open and Closed Polymorphism==

Polymorphism allow us to use a set of types using a common interface for all of them. 
This is traditional object oriented programming.

For instance, we can have the base class **Plugin** and derived classes like **JavaPlugin** and **CSharpPlugin**.
The common interface in this case is the **Plugin** class.

The set of types that can be used as **Plugin** are.

{{{
Set of possible plugins
+--------------+
+ JavaPlugin   +
+              +
+ CSharpPlugin +
+--------------+
}}}

But, let's say we are writing an IDE and we will allow other people write their own plugins using dynamic libraries.
Anyone could create a new type derived from Plugin and this type could be added to the set of types.
This is what I call "open polymorphism". The set of types is open.

Now let's say our IDE have some base class **Control** and derived classes **ButtonControl** and **EditControl**.
{{{
Set of possible Commands
+---------------+
+ ButtonControl +
+               +
+ EditControl   +
+---------------+
}}}
These types are not supposed to be used by any plugins.\
So this set are determined and closed when the program compiles.\
This situation I call closed polymorphism.

You may have hurt about "static polymorphism".\
This is not the same. With static polymorphism the type used by a template instantiation is known at the compile type ate the point of use.
With the closed polymorphism the type is not know, but the set of all possible types are.

The way how polirosh is implemented in C++, allow the "open" caracteristics even if you don't need it.\
The vtable model adopted allow this behaviour.

Im my experience most cases don't need the open polirmosh, because we don't need plugins all the time. 
The closed polimorpihm allow diferent ways of implementations without virtual tables.
The implementation could be for instance based on an compiled type switch for all types. 

The closed polimorhis allow us to think in the problem diferentlly, and this I think would be the most impornt caracteristic.


For instace, in our sample, we have the Control class. Probably this control class would be like:

{{{cpp
   class Control
   {
      ~Control()=0;
      virtual void Draw() = 0;
      virtual void OnKeyDown()=0;
      virtual void OnMouseDown() = 0;
      virtual void Serialize()=0;
   }
}}}

So, we have to managed the interface name and all possible common behaviur betteen all types.

Whould I have created the KeybordEvent onterface and/or the 
the MouseEvent interface and/or the Serializable interface and/or the Drawable interface, or
just put everthing inside the control interface?

If you have worked with OOP for years you will know what I am talking about.
Even if you are begginer, how many times have you asked yourself or our collegues about the best set of functions of one interface?
These problem, don't solve automatically when you design your class diagrams. This problem will be with you for many months until your design stabilzes. And the stabilization can be broken at any time by a new custumer requirements.
Even when the stabilization is done, the program is working and everone is happly, you will realize that all the class ierquies are customized for the current software and the re-use of code will be hard becase each set of interface was created to satifiy the necessity of your current problem.

Well, I think resumes one of the biggest problems of OOP. I use OOP, but I am aware of these drawbacks.


So how closed polimorsh could help this problem?

We need a new concept that is the type sets.

I think a new concept would be usefull. 
It tell us what sets of types can be used with the same interface, but without to informa what interface is.
I belease we need some compiler suport for this.

So Let's say I want to create the set Control

type set Control = { ButtonControl, EditControl };

set can have other sets. for instance

type set ControlsWithKeyboard = { Control};


Now, I can use these sets in colletions. For insance, I can create an collection of Controls.

vector<controls> c;

in this case the compiler should generate some functions for us. For isntce, the push back would accpet onle Button Control and EditControl.

The interesting on this model we dont need to say anithing in button or editcotnrol. The information of sets are separeted from types.

Now lets se we want to draw all controls

{{{
vector<Controls> controls;

for each control in controls
{
   control.draw();
}
}}}
We need compiler supert againg. Now the compiler must call the proper draw function based on the runtime type of the control
The implmenetation could be switch.

How this model would help? Hwat are the advantages?

This model makes very esy to play with the interfaces and makes the class reause much more easier.
We don't need to thinkg in big hierachies and make a lot of rounds of design. The design will be archived naturraly



or
{{{
vector< {ButtonControl, EditControl}> controls;

for each control in controls sub set Keyboard
{
   control.draw();
}


}}}


The push back would be a template function and would accept only ButtonControl and EditControl Types.
We don't have any base classe anymore.
We dont have sets of functions to worry about. We can create new set at any time if we want.


{{{
vector< {ButtonControl, EditControl}> controls;

for each control in controls
{
   control.draw();
}


}}}




for each control in controls
{
   control.draw();
}


}}}



