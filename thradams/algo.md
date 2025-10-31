```c
 if (a && b || c)
 {
   //what are the possible values of a, b and c here?
 }
 else
 {
 //what are the possible values of a, b and c here?
 }
```


```cpp
#include <stdio.h>
#include <stdbool.h>

enum E
{
    TRUE_FLAG = 1 << 0,
    FALSE_FLAG = 1 << 1
};

struct var
{
    const char * name; //name of the variable
    bool value; //value

    enum E true_branch;   //possible values at true branch
    enum E false_branch;  //possible values at else branch
};

//List of variables used by expression
struct var vars[] = { {"a"}, {"b"} };

bool expression(struct var vars[], int l)
{    
    l;

    //a && b
     return vars[0].value || vars[1].value;

    //a && b || c
    //return vars[0].value && vars[1].value || vars[2].value;
}

void visit(int k, struct var  vars[], int l)
{
    if (k == l)
    {
        for (int i = 0; i < l; i++)
        {
            if (i > 0) printf(",");
            printf("%s:%s", vars[i].name, (vars[i].value ? "T" : "F"));
        }

        bool r = expression(vars, l);
        printf(" = %s\n", r ? "T" : "F");


        for (int i = 0; i < l; i++)
        {
            if (r)
            {
                vars[i].true_branch |= (vars[i].value ? TRUE_FLAG : FALSE_FLAG);
            }
            else
            {
                vars[i].false_branch |= (vars[i].value ? TRUE_FLAG : FALSE_FLAG);
            }
        }

        return;
    }

    vars[k].value = true;
    visit(k + 1, vars, l);
    vars[k].value = false;
    visit(k + 1, vars, l);
}


int main()
{
    int l = (sizeof(vars) / sizeof(vars[0]));
    visit(0, vars, l);
    
    printf("\nAt true branch..\n");
    for (int i = 0; i < l; i++)
    {
        printf("%s can be : %s %s\n",
            vars[i].name,
            (vars[i].true_branch & TRUE_FLAG) ? " T" : "",
            (vars[i].true_branch & FALSE_FLAG) ? " F" : "");
    }

    printf("\nAt else branch..\n");
    for (int i = 0; i < l; i++)
    {
        printf("%s can be : %s %s\n",
            vars[i].name,
            (vars[i].false_branch & TRUE_FLAG) ? " T" : "",
            (vars[i].false_branch & FALSE_FLAG) ? " F" : "");
    }
}
```


