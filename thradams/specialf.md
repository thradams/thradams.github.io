

What is C++ special member function?

[[http://en.wikipedia.org/wiki/Special_member_functions|http://en.wikipedia.org/wiki/Special_member_functions]]

What I did is a javascript generator for creating the C special functions.

This is a working i progress. Today the configuration is json, but the ideia is the implement a small struct parser.

Here is the javascript generator. Today it works only for int and const char*.
[[http://www.thradams.com/codeblog/chelper.html|http://www.thradams.com/codeblog/chelper.html]]


For this struct...

```cpp
  struct obj
  { 
      int n;
      const char* text;
      const char* text2;
  };
```

The generated especial functions would be

Header

```cpp
/*forward declarations*/

#define OBJ_INIT {0, 0, 0}

int obj_init(struct obj* obj, 
             int n, 
             const char* text, 
             const char* text2);

void obj_swap(struct obj* obj, struct obj* other);

void obj_destroy(struct obj* obj);


struct obj* obj_create(int n,
                       const char* text,
                       const char* text2);

void obj_delete(struct obj* obj);
```

Source

```cpp
/*implementation*/

inline char* str_create(const char* text)
{
   size_t n = strlen(text);
   char *p = (char*) malloc (sizeof(char) * (n + 1));
   if (p)
   {
      strncpy(p, text, n);
   }
   return p;
}

int obj_init(struct obj* obj, 
             int n, 
             const char* text, 
             const char* text2)
{
   obj->n = n;
   obj->text = str_create(text);
   if (obj->text)
   {
       obj->text2 = str_create(text2);
       if (obj->text2)
       {
           return 1;
       }
       free(obj->text);
       obj->text = 0;
   }
   obj->n = 0;
   return 0;
}

void obj_swap(struct obj* obj, struct obj* other)
{
  int_swap(&obj->n, &other->n);
  ptr_swap(&obj->text, &other->text);
  ptr_swap(&obj->text2, &other->text2);
}

void obj_destroy(struct obj* obj)
{
   obj->n = 0;
   free(obj->text);
   obj->text = 0;
   free(obj->text2);
   obj->text2 = 0;
}


struct obj* obj_create(int n,
                       const char* text,
                       const char* text2)
{
  obj* p = (obj*) malloc(sizeof(struct obj));
  if (p)
  {
    if (obj_init(p, n, text, text2) == 0)
    {
      free(p);
      p = 0;
    }
  }
  return p;
}

void obj_delete(struct obj* obj)
{
  if (obj == 0)
  {
    assert(false);
    return;
  }
  obj_destroy(obj);
  free(obj);
}
```





```cpp
enum
{
  r_succeedeed,
  r_outofmemory,
  r_succeeded,
  r_failed
};

void int_swap(int* a, int* b)
{
  int t = *a;
  *a = *b; 
  *b = t;
}

void ptr_swap(void** a, void** b)
{
  void* t = a;
  *a = *b;
  *b = t;
}
```
