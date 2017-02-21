
```cpp

void quick_sort_string(const char* *unsorted_array,
  int first_index,
  int last_index)
{
  int pivot, j, i;
  const char * temp;

  if (first_index < last_index)
  {
    pivot = first_index;
    i = first_index;
    j = last_index;

    while (i < j)
    {
      while (strcmp(unsorted_array[i], unsorted_array[pivot]) <= 0 && 
            i < last_index)
      {
        i++;
      }

      while (strcmp(unsorted_array[j], unsorted_array[pivot]) > 0)
      {
        j--;
      }

      if (i < j)
      {
        /*swap*/
        temp = unsorted_array[i];
        unsorted_array[i] = unsorted_array[j];
        unsorted_array[j] = temp;
      }
    }

    /*swap*/
    temp = unsorted_array[pivot];
    unsorted_array[pivot] = unsorted_array[j];
    unsorted_array[j] = temp;

    quick_sort_string(unsorted_array, first_index, j - 1);
    quick_sort_string(unsorted_array, j + 1, last_index);
  }
}

```


```cpp

void quick_sort_int(int *unsorted_array,
  int first_index,
  int last_index)
{
  int pivot, j, i;
  int temp;

  if (first_index < last_index)
  {
    pivot = first_index;
    i = first_index;
    j = last_index;

    while (i < j)
    {
      while (/*compare int*/(unsorted_array[i] - unsorted_array[pivot]) <= 0 && i < last_index)
      {
        i++;
      }

      while (/*compare int*/(unsorted_array[j] - unsorted_array[pivot])> 0)
      {
        j--;
      }

      if (i < j)
      {
        /*swap*/
        temp = unsorted_array[i];
        unsorted_array[i] = unsorted_array[j];
        unsorted_array[j] = temp;          
      }
    }

    /*swap*/
    temp = unsorted_array[pivot];
    unsorted_array[pivot] = unsorted_array[j];
    unsorted_array[j] = temp;

    quick_sort_int(unsorted_array, first_index, j - 1);
    quick_sort_int(unsorted_array, j + 1, last_index);
  }
}
```

```cpp

int binary_search_int(int* sorted_array,
  int n_elements,
  int searchItem)
{
  int mid;
  int c = 0;
  int l = 0;
  int u = n_elements - 1;

  while (l <= u)
  {
    mid = (l + u) / 2;

    int cmp = searchItem - sorted_array[mid];

    if (cmp == 0)
    {
      c = 1;
      break;
    }
    else if (cmp < 0)
    {
      u = mid - 1;
    }
    else
    {
      l = mid + 1;
    }
  }

  return c == 0 ? -1 : mid;
}
```

```cpp
int binary_search_str(const char** sorted_array,
  int n_elements,
  const char* searchItem)
{
  int mid;
  int c = 0;
  int l = 0;
  int u = n_elements - 1;

  while (l <= u)
  {
    mid = (l + u) / 2;

    int cmp = strcmp(searchItem, sorted_array[mid]);

    if (cmp == 0)
    {
      c = 1;
      break;
    }
    else if (cmp < 0)
    {
      u = mid - 1;
    }
    else
    {
      l = mid + 1;
    }
  }

  return c == 0 ? -1 : mid;
}
```

```cpp

struct str_array
{
  size_t    size;
  size_t    capacity;
  char**   data;
};

#define STR_ARRAY_INIT {0,0,0}

void str_array_destroy(struct str_array* p);
void str_array_push(struct str_array* p, const char*);


static size_t str_array_reserve(struct str_array* p, size_t nelements)
{
  void *pnew = 0;
  if (nelements > p->capacity)
  {
    pnew = realloc((void*)p->data, nelements * sizeof(p->data[0]));
    if (pnew)
    {
      p->data = (const char**)pnew;
      p->capacity = nelements;
    }
  }

  return (pnew != 0) ? nelements : 0;
}

size_t str_array_grow(struct str_array* p, size_t nelements)
{
  if (nelements > p->capacity)
  {
    size_t newCap = p->capacity == 0 ? 4 : p->capacity;
    while (newCap < nelements)
    {
      newCap *= 2;
      if (newCap < nelements ||
        newCap >(size_t)(UINT_MAX / sizeof(p->data[0])))
      {
        newCap = (size_t)(UINT_MAX / sizeof(p->data[0]));
      }
    }
    return str_array_reserve(p, newCap);
  }
  return p->capacity;
}

void str_array_destroy(struct str_array* p)
{
  for (size_t i = 0; i < p->size; i++)
  {
    free(p->data[i]);
  }
}

void str_array_push(struct str_array* p, const char* psz)
{
  size_t result = type_ptr_array_grow(p, p->size + 1);

  if (result == 0)
  {
    free(psz);
    return;
  }
  
  int l = strlen(psz);
  const char * ptemp = malloc(sizeof(p->data[0]) * (l + 1));
  strcpy(ptemp, psz);

  if (ptemp == 0)
  {
    return;
  }
  
  p->data[p->size] = ptemp;
  p->size += 1;
}
```

```cpp
int main(int argc, char* argv[])
{
  int a[] = { 5, 1, 2, 3, 4 };
  quick_sort_int(a, 0, 4);
  for (int i = 0; i < 5; i++)
  {
    printf("%d\n", binary_search_int(a, 5, a[i]));
  }
  printf("%d\n", binary_search_int(a, 5, 9));

  char * s[] = { "a", "ds", "db", "c" , "e"};
  quick_sort_string(s, 0, 4);
  
  for (int i = 0; i < 5; i++)
  {
    printf("%d\n", binary_search_str(s, 5, s[i]));
  }
  printf("%d\n", binary_search_int(s, 5, "outro"));

  struct str_array sa = STR_ARRAY_INIT;
  str_array_push(&sa, "asd");
  str_array_push(&sa, "afgfsd");
  str_array_push(&sa, "asfdgdfd");

  quick_sort_string(sa.data, 0, sa.size - 1);

  for (int i = 0; i < sa.size; i++)
  {
    printf("%s\n", sa.data[i]);
  }

  for (int i = 0; i < sa.size; i++)
  {
    printf("%d\n", binary_search_str(sa.data, sa.size, sa.data[i]));
  }
  binary_search_str(sa.data, sa.size, "outro");

  str_array_destroy(&sa);

  return 0;
}

```


