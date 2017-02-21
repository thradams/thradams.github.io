Some equations that can be used for x(t) and y(t) for moving objects with or without drag.

```
    F = m * a

        f
    a = -
        m

          f
 y''(t) = -
          m

```

If f is constant, then:

```
                            2
                         F*t
y(t) =  (c_2*t) + c_1 + -----
                        (2*m)

and

             F*t
y'(t): c_2 + ---
              m


y (0) = x0
y'(0) = v0

c_1 = x0
c_2 = v0

```

Now let's say we have const f plus some drag(k) depending on y'(y).

```
          f + k* y'(t)
 y''(t) = ------------
               m
```


Then

```
              k*t
     c_1*m*(e^---)
               m           f*t
y(t) ------------- + c_2 - ---
           k                k

                k*t     f
y'(t)=  (c_1*(e^---)) - -
                 m      k

y (0) = x0
y'(0) = v0


       f
 c_1 = - + v0
       k


            c_1*m
 c_2 = x0 - ------
              k

```


Drag (k != 0)

```
  y(t) = (c_1*m e^((k*t)/m))/k+c_2-(f*t)/k
 y'(t) = c_1*e^((k*t)/m)-f/k

  c_1 = f/k + v0
  c_2 = x0 - c_1*m/k
```

No drag (k = 0)
```

 y(t) = x0 + v0*t + f*t^2/2*m
 y'(t) = v0 + f/m * t

```


