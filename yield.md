```c


#include "stdafx.h"

#define CO_YIELD(N) *state = N; return true; Label##N: state;

#define COROTINE_1 if (*state == 1) goto Label1;
#define COROTINE_2 COROTINE_1 else if (*state == 2) goto Label2;
#define COROTINE_3 COROTINE_2 else if (*state == 3) goto Label3;
#define COROTINE_4 COROTINE_3 else if (*state == 4) goto Label4;


bool get_values(int *result, int *state)
{
    COROTINE_4

    *result = 1;
    CO_YIELD(1)

    *result = 2;
    CO_YIELD(2)

    *result = 3;
    CO_YIELD(3)

    *result = 4;
    CO_YIELD(4)

    return false;
}




bool even(unsigned int* number, int* state, size_t max)
{
    COROTINE_1

    for (*number = 2; *number < max; ++(*number))
    {
        if (*number % 2 == 0)
        {
            CO_YIELD(1)
        }
    }
    return false;
}


int main()
{
    int state = 0;
    int result;
    while (get_values(&result, &state))
    {
        printf("%d ", result);
    }

    printf("\n");

    state = 0;
    unsigned int number = 0;
    while (even(&number, &state, 30))
    {
        printf("%d ", number);
    }

    return 0;
}

```
