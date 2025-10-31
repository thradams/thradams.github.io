# Capture

We can place objects into some memory and remove then sequentially.

All objects are aligned in the maximum alignment type max_align_t.

```cpp

#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <stddef.h>
#include <stdio.h>

typedef long double max_align_t;

void* place(max_align_t** pmem, unsigned nbytes)
{
    unsigned nunits = nbytes / sizeof(*pmem[0]);
    if (nbytes % sizeof(*pmem[0]) != 0)
        nunits++;

    void* p = (void*)*pmem;
    *pmem += nunits;
    return p;
}

#define capture(V) max_align_t* pCapture = V
#define set(T) *((T*)place(&pCapture, 4, sizeof(T)))
#define var(T, name) T name = *((T*)place(&pCapture, sizeof(T)));


void F(max_align_t* data)
{
    capture(data);
    var(int, i);
    var(double, d);
    var(char, c);
   
    printf("%d ", i);
    printf("%f ", d);
    printf("%c ", c);
}


int main(void) {

    max_align_t data[4];

    capture(data);
    set(int) = 1;
    set(double) = 2.3;
    set(char) = 'a';

    F(data);

}

```
