# Permutations
February 2020

Given a string (for instance "abcd") and a group size (for instance 2) we generate all combinations.

```
ab
ac
ad
ba
bc
bd
ca
cb
cd
da
db
dc
```

Because the order matters we have for instance ab and also ba.

The number of items generate is:
```

 N!
-----
(G-1)!

or 

N * (N-1) * (N-2) ...


4*3 = 12

   4!
 ----- = 12
 (2-1)
 
```



```cpp
#include <stdio.h>
#include <stdlib.h>

_Bool NotUsed(int used[], int s, int index)
{
  for (int i = 0; i < s; i++)
  {
    if (used[i] == index)
      return 0;
  }
  return 1;
}

void f2(const char* s, int indexesUsed[], int usedCount, int count, int groupSize)
{
  if (usedCount == groupSize)
  {
    for (int i = 0; i < usedCount; i++)
    {
      printf("%c", s[indexesUsed[i]]);
    }
    printf("\n");
    return;
  }
  for (int i = 0; i < count; i++)
  {
    if (NotUsed(indexesUsed, usedCount, i))
    {
      indexesUsed[usedCount] = i; //insert on the set of used indexes
      f2(s, indexesUsed, usedCount + 1, count, groupSize);
    }
  }
}

int NumCombinations(int size, int groupSize)
{
  int result = 1;
  for (int i = 0; i < groupSize; i++)
  {
    result = result * (size - i);
  }
  return result;
}


int main()
{
  int used[8] = {-1};
  f2("abcd", used, 0, sizeof("abcd") - 1, 2);
}

```

Bit set

```cpp
#include <stdio.h>
#include <stdlib.h>


void f2(const char* s,
        int indexesUsed[],
        int usedSet, 
        int usedCount, 
        int count, 
        int groupSize)
{
    if (usedCount == groupSize)
    {
        for (int i = 0; i < usedCount; i++)
        {
            printf("%c", s[indexesUsed[i]]);
        }
        printf("\n");
        return;
    }
    for (int i = 0; i < count; i++)
    {
        if (!((usedSet & (1 << i)) != 0))
        {
            usedSet = usedSet | (1 << i) ;
            indexesUsed[usedCount] = i;
            f2(s, indexesUsed, usedSet, usedCount + 1, count, groupSize);
            usedSet &= ~(1 << i);
        }
    }
}

int NumCombinations(int size, int groupSize)
{
    int result = 1;
    for (int i = 0; i < groupSize; i++)
    {
        result = result * (size - i);
    }
    return result;
}


int main()````
{
    int used[32] = { -1 };
    int usedSet = 0;
    f2("abcd", used, usedSet,0 , sizeof("abcd") - 1, 4);
 }

```

If the ordern does not matter:
From this site:
https://www.geeksforgeeks.org/print-all-possible-combinations-of-r-elements-in-a-given-array-of-size-n/

```cpp
// Program to print all combination of size r in an array of size n 
#include <stdio.h> 
void combinationUtil(int arr[], int data[], int start, int end,  
                     int index, int r); 
  
// The main function that prints all combinations of size r 
// in arr[] of size n. This function mainly uses combinationUtil() 
void printCombination(int arr[], int n, int r) 
{ 
    // A temporary array to store all combination one by one 
    int data[r]; 
  
    // Print all combination using temprary array 'data[]' 
    combinationUtil(arr, data, 0, n-1, 0, r); 
} 
  
/* arr[]  ---> Input Array 
   data[] ---> Temporary array to store current combination 
   start & end ---> Staring and Ending indexes in arr[] 
   index  ---> Current index in data[] 
   r ---> Size of a combination to be printed */
void combinationUtil(int arr[], int data[], int start, int end, 
                     int index, int r) 
{ 
    // Current combination is ready to be printed, print it 
    if (index == r) 
    { 
        for (int j=0; j<r; j++) 
            printf("%d ", data[j]); 
        printf("\n"); 
        return; 
    } 
  
    // replace index with all possible elements. The condition 
    // "end-i+1 >= r-index" makes sure that including one element 
    // at index will make a combination with remaining elements 
    // at remaining positions 
    for (int i=start; i<=end && end-i+1 >= r-index; i++) 
    { 
        data[index] = arr[i]; 
        combinationUtil(arr, data, i+1, end, index+1, r); 
    } 
} 
  
// Driver program to test above functions 
int main() 
{ 
    int arr[] = {1, 2, 3, 4, 5}; 
    int r = 3; 
    int n = sizeof(arr)/sizeof(arr[0]); 
    printCombination(arr, n, r); 
} 
```
