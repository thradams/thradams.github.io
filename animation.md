## Kinect Animations

Nowadays is very common to find inertia animations 
in screens elements in multi-touch devices like 
tablets and smart phones.
One of these animations is a page sliding. When you
move the virtual page it goes like it had mass and 
because of the effect of friction it stop after some 
seconds.


This article will show the equations to simulate 
this animation, including impact in a spring-damper 
border.

```
         ->  
        v0,  x0        |
     .--.     
.----' m '--.          /\/\/\--| spring
'-()-----()-'          ----]===| damper
----------------------------------------------
                       |
                     xborder
```


## Equations

A body sliding on a floor will be by effect of a 
force called kinetic friction. This force is against 
the movement and it will slow the body until it 
stops.

We are not considering the effect of air, because we
want to simulate objects likes a paper and the air
efect in this case is very low.

Because the force of the kinetic friction is 
constant the movement will have a constant 
acceleration.


(The acceleration will have the opposite sign of 
initial velocity. v0)

For this simulation we can specify the acceleration 
directly.

The equations of this movement are:

```
                          2
                       a t
#1  x(t) = x0 + v0 t + ----
                        2

#2  v(t) = v0 + a t

```

Where:

```

 v(t) : velocity
 x(t) : position
 x0   : initial position
 v0   : initial velocity
 a    : acceleration
 t    : time

```

Some other results are useful:

### When does it stop? (tstop)

```
v(t) = v0 + a t

0    = v0 + a t

           v0
tstop = - ---
           a
```

### Where does it stop? (xstop) 

Replace t by tstop in #1

```

               2
             v0
xstop = x0 - ----
             2a

```

If xstop is before the xborder it means the page 
will not collide.

### When collision occurs? (tborder)

if xstop > xborder it means we will have collision 
with the border.

To find out when the collision occurs we solve for t in

equation #1
```
                          2
                       a t
xborder = x0 + v0 t + -----
                        2
```

solving for t give us:

```
                 ----------------------------
            +   |    2
         v0 -  \|  V0 - 2 a (x0 + xborder)
tborder = -------------------------------------
                         a
```

We have two solutions. The correct solution is when 
tborder > 0 and < tstop.

This solution must exist when xstop > xborder so be 
aware of numeric rounding errors.


###  is the speed on collision ? (vborder)

Replace tborder in #2

```
vborder = v0 + a tborder
```

## What will happen after collision?

We use a spring and damper to stop the page.
The main equation (Newton second law) is

```
Force = m x''

spring force = -k x
damper force = -b x'

```
Then the equation is:
```
x'' + b x' + k x = 0
```

Dividing by m

```
       b       k
x'' + --- x'+ --- x = 0
       m       m
```

Where:

```
 k  : spring constant
 b  : viscous damping coefficient
 m  : mass
 x  : x(t) position
 x'  : v(t) velocity
 x'' : a(t) acceleration
```
The following parameters are then defined:
```
      -------
      |  k
w0 =  | ---
     \|  m
```

w0 is called the natural frequency of the system

```
       b
Z = --------
      ------
   2 \|  m k
```

The second parameter, Z, is called the damping 
ratio.

The differential equation now becomes
```
                    2
x'' + 2 Z w0 x' + w0 x = 0
```

The value of Z determines the behavior of the 
system.

When Z = 1, the system is said to be critically 
damped. A critically damped system converges to zero 
as fast as possible without oscillating.

When Z > 1, the system is over-damped. An over-damped 
door closer will take longer to close than a 
critically damped door would.


Finally, when 0 <= Z < 1, the system is under-
damped.
In this situation, the system will oscillate at the 
natural damped frequency.


The system we will choose is critically damped. It 
means we have some combination of k, m, b, that 
results Z = 1;

The solution for this system (z = 1) is:

```
        -w0 t
x(t) = e      (C1 + C2 t)

C1 = x(0)

C2 = x'(0) + w0 x(0)

x'(0) = v(0) = vborder
```

## Putting all together 

Given the initial velocty v0, initial position x0, 
and xborder (see picture) the algorithm will produce 
an equation x(t) for the movement.


(a, m, k will be constants)

### In case of no collision:

From t = 0 to t < tstop.
```
                          2
                       a t
#1  x(t) = x0 + v0 t + ----
                        2

```
### Before and After collision

The page started before the border ant hit the 
border at tborder.

From t = 0 to t < tborder.
```
                          2
                       a t
#1  x(t) = x0 + v0 t + ----
                        2
```
After tborder
```
       -w0 t
x(t) = e      (C1 + C2 t)

C1 = x(0)

C2 = vborder + w0 x(0)

      ------
      |  k
w0 =  | ---
     \|  m

```

The system of coordinates is in the border in this 
case.
You can change values for w0 to modify the response.

Some criteria to stop is missing here.

### After the border x0 > xborder

The page started after the border.
The spring-damper acts in the page.

```

       -w0 t
x(t) =  e      (C1 + C2 t)


C1 = x(0)
C2 = v0 + w0 C1

      -------
      |  k
w0 =  | ----
     \|  m
```

The system of coordinates is at xborder.
Some criteria to stop is missing here.



## Details

Some details are missing to create a complete 
simulation.


Please note the system of coordinates moved in the 
border equations. Time is also reset.



## References

[[http://en.wikipedia.org/wiki/Damping]]

## History

* 14/02/2012 Appendix added
* 29/01/2012 reviewed
* 28/01/2012 published


## Appendix

Using the same equations we can solve the following
system to create a page simulation.

The view is fixed and the page moves.

In this case the aceleration will have two 
components in x and y.

```


               _________________
              |    ________     |
              |   |        |    |
  |/\/\/      |   |        |    |    /\/\/\| spring 
  |===[--     |   |View    |    |    --]===| damper
              |   |________|    |
              |_________________|
                     Page


                   _________________
                  |________         |
                  |        |        |
  |/\/\/          |        |        |/\/\/\| spring 
  |===[--         |View    |        |--]===| damper
                  |________|        |
                  |_________________|
                         Page



          _________________
         |         ________|
         |        |        |
  |/\/\/\|        |        |         /\/\/\| spring 
  |===[--|        | View   |         --]===| damper
         |        |________|
         |_________________|
               Page


```

