

```cpp
#pragma once

struct map_str_ptr;
typedef struct map_str_ptr_node map_str_ptr_node_t;

struct map_str_ptr
{
  map_str_ptr_node_t * root;
};

#define MAP_STR_PTR_INIT { 0 };

void map_str_ptr_add(struct map_str_ptr*,
                     const char* key, void* p);

void* map_str_ptr_get(struct map_str_ptr*,
                      const char* key);

void map_str_ptr_destroy(struct map_str_ptr* map,
                         void(*destroy_proc)(void*));

```


```cpp
#include "map_str_ptr.h"
#include <stdlib.h>
#include <assert.h>
#include <string.h>


typedef struct map_str_ptr_node
{
  const char* key;
  void *data;

  struct map_str_ptr *     tree;
  struct map_str_ptr_node* parent;
  struct map_str_ptr_node* left;
  struct map_str_ptr_node* right;

} map_str_ptr_node_t;

void map_str_ptr_node_destroy(map_str_ptr_node_t* node,
                              void (*destroy)(void*))
{
  free(node->key);
  if (destroy)
  {
    destroy(node->data);
  }
}

void map_str_ptr_node_delete(map_str_ptr_node_t* node,
  void(*destroy)(void*))
{
  map_str_ptr_node_destroy(node, destroy);
  free(node);  
}


void map_str_ptr_node_t_init(map_str_ptr_node_t* p,
                           map_str_ptr_node_t* parent,
                           struct map_str_ptr* tree,
                           const char* key,
                           void* data)
{
  p->key = key;
  p->data = data;

  p->tree = tree;
  p->parent = parent;
  p->left = NULL;
  p->right = NULL;
}


map_str_ptr_node_t* map_str_ptr_node_t_create(map_str_ptr_node_t* parent,
                                          struct map_str_ptr* tree,
                                          const char* key,
                                          void* data)
{
  map_str_ptr_node_t *p = malloc(sizeof(map_str_ptr_node_t));
  map_str_ptr_node_t_init(p, parent, tree, key, data);
  return p;
}

map_str_ptr_node_t * map_str_ptr_node_t_add_left(map_str_ptr_node_t* node,
                            const char* key,
                            void *data)
{
  map_str_ptr_node_t* left = map_str_ptr_node_t_create(node, node->tree, key,data);
  assert(node->left == NULL);
  node->left = left;
  return left;
}

map_str_ptr_node_t *
  map_str_ptr_node_t_add_right(map_str_ptr_node_t* node,
  const char* key, 
  void *data)
{
  map_str_ptr_node_t* right = map_str_ptr_node_t_create(node, node->tree, key, data);
  assert(node->right == NULL);
  node->right = right;
  return right;
}

map_str_ptr_node_t* map_str_ptr_add_root(struct map_str_ptr* tree, 
                                              const char* key, 
                                              void *data)
{
  map_str_ptr_node_t* node = map_str_ptr_node_t_create(NULL, tree, key, data);
  assert(tree->root == NULL);
  tree->root = node;
  return node;
}


void destroy_subtree(map_str_ptr_node_t* node,
                     void(*destroy_proc)(void*))
{
  if (node->left != NULL)
  {
    destroy_subtree(node->left, destroy_proc);
  }

  if (node->right != NULL)
  {
    destroy_subtree(node->right, destroy_proc);
  }

  map_str_ptr_node_destroy(node, destroy_proc);

  if (node == node->tree->root)
  {
    node->tree->root = NULL;
  }
  else if (node == node->parent->left)
  {
    node->parent->left = NULL;
  }
  else if (node == node->parent->right)
  {
    node->parent->right = NULL;
  }
  else
  {
    assert(0);
  }

  free(node);  
}


void add(const char* key,
         void* data,
         map_str_ptr_node_t* node)
{
  map_str_ptr_node_t* next_node = NULL;
  
  int strc = strcmp(key, node->key);

  assert(strc != 0);

  if (strc < 0)
  {
    next_node = node->left;
    if (next_node == NULL)
    {
      map_str_ptr_node_t_add_left(node, key, data);
    }
    else
    {
      add(key, data, next_node);
    }
  }
  else
  {
    next_node = node->right;
    if (next_node == NULL)
    {
      map_str_ptr_node_t_add_right(node, key, data);
    }
    else
    {
      add(key, data, next_node);
    }
  }
}

void map_str_ptr_add(struct map_str_ptr* map,
  const char* key, void* p)
{
  if (map->root == NULL)
  {
    map_str_ptr_add_root(map, key, p);
  }
  else
  {
    add(key, p, map->root);
  }
}

static void* get_pos(const char *key,
  map_str_ptr_node_t* node)
{
  map_str_ptr_node_t* next_node = NULL;

  int strc = 0;
  void* rcode = NULL;

  strc = strcmp(key, node->key);

  if (strc == 0)
  {
    rcode = node->data;
  }
  else if (strc < 0)
  {
    next_node = node->left;
    if (next_node != NULL)
    {
      rcode = get_pos(key, next_node);
    }
  }
  else
  {
    next_node = node->right;
    if (next_node != NULL)
    {
      rcode = get_pos(key, next_node);
    }
  }
  return rcode;
}

void* map_str_ptr_get(struct map_str_ptr* map,
  const char* key)
{
  if (map->root == NULL)
    return NULL;
  return get_pos(key, map->root);
}

void map_str_ptr_destroy(struct map_str_ptr* map,
                         void(*destroy_proc)(void*))
{
  destroy_subtree(map->root, destroy_proc);
  map->root = NULL;
}
```


