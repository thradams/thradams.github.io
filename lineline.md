
## Line segment intersection formula

Given the lines segment a and b.

```
 line a
 (ax0, ay0)--------(ax1, ay1)

 line b
 (bx0, by0)--------(bx1, by1)
```

And the parametric equation for line a and b.

```

  ax(ta) = ax0 + (ax1 - ax0) * ta;
  ay(ta) = ay0 + (ay1 - ay0) * ta;

  bx(tb) = bx0 + (bx1 - bx0) * tb;
  by(tb) = by0 + (by1 - by0) * tb;
  
```

Renaming
```
  (ax1 - ax0) for adx 
  (ay1 - ay0) for ady
  (bx1 - bx0) for bdx
  (by1 - by0) for bdy
```

```
  ax(ta) = ax0 + adx * ta;
  ay(ta) = ay0 + ady * ta;

  bx(tb) = bx0 + bdx * tb;
  by(tb) = by0 + bdy * tb;  
```

Making 

```
  ax(ta) = bx(tb);
  ay(ta) = by(tb);
```

```
  ax0 + adx * ta = bx0 + bdx * tb;  #1
  ay0 + ady * ta = by0 + bdy * tb;  #2
```

Isolating ta in #1
```
         (bx0 + (bdx*tb) - ax0)
    ta = ----------------------
                  adx
```

Now replace ta in #2
```
          ady*(bx0 + (bdx*tb) - ax0)
     ay0 + -------------------------- = by0 + (bdy*tb)
                     adx
```

Isolation tb

```
         ((adx*(by0 - ay0)) + (ady*(ax0 - bx0)))
    tb = ---------------------------------------
                 ((ady*bdx) - (bdy*adx))
```




Now we have everthing.

The lines will intercept if    0 >= ta <= 1 and    0 >= tb <= 1


```cpp

    var adx = (ax1 - ax0);
    var ady = (ay1 - ay0);

    var bdx = (bx1 - bx0);
    var bdy = (by1 - by0);

    if (((ady * bdx) - (bdy * adx)) == 0)
    {
       //no intersection 
    }


    if (adx == 0)
    {
       //no intersection 
    }

    var tb = ((adx * (by0 - ay0)) + (ady * (ax0 - bx0))) / ((ady * bdx) - (bdy * adx));
    var ta = (bx0 + (bdx * tb) - ax0) / adx;

    
    // intersection position 
    var ax = ax0 + adx * ta;
    var ay = ay0 + ady * ta;

```
