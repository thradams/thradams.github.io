
# Maps string to struct item*

[Make container](makecontainer.md)




```cpp

#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>

#define strdup _strdup

struct item {
    int i;
};

void item_delete(struct item* p) {
    free(p);
}

struct hashmap {

    struct mapentry {
        struct mapentry* next;
        unsigned int hash;
        char* key;
        struct item* p;
    };

    struct mapentry** table;
    unsigned int capacity;
    int  size;
};


unsigned int stringhash(const char* key)
{
    // hash key to unsigned int value by pseudorandomizing transform
    // (algorithm copied from STL char hash in xfunctional)
    unsigned int uHashVal = 2166136261U;
    unsigned int uFirst = 0;
    unsigned int uLast = (unsigned int)strlen(key);
    unsigned int uStride = 1 + uLast / 10;

    for (; uFirst < uLast; uFirst += uStride)
    {
        uHashVal = 16777619U * uHashVal ^ (unsigned int)key[uFirst];
    }

    return (uHashVal);
}


void hashmap_remove_all(struct hashmap* pMap) 
{
    if (pMap->table != NULL)
    {
        for (unsigned int i = 0; i < pMap->capacity; i++)
        {
            struct mapentry* pentry = pMap->table[i];

            while (pentry != NULL)
            {
                struct mapentry* pentryCurrent = pentry;

                item_delete(pentryCurrent->p);

                pentry = pentry->next;                
                free(pentryCurrent->key);
                free(pentryCurrent);
            }
        }

        free(pMap->table);
        pMap->table = NULL;
        pMap->size = 0;
    }
}

void hashmap_destroy(struct hashmap* pMap)
{
    hashmap_remove_all(pMap);
}

struct item* hashmap_find(struct hashmap* pMap, const char* key)
{
    struct item* p = NULL;
    
    unsigned int hash = stringhash(key);
    int index = hash % pMap->capacity;

    struct mapentry* pentry = pMap->table[index];

    for (; pentry != NULL; pentry = pentry->next) 
    {
        if (pentry->hash == hash && strcmp(pentry->key, key) == 0) {
            p = pentry->p;
            break;
        }
    }

    return p;
}


struct item* hashmap_remove(struct hashmap* map, const char* key)
{
    struct item* p = 0;

    if (map->table != NULL)
    {
        unsigned int hash = stringhash(key);
        struct mapentry** preventry = &map->table[hash % map->capacity];
        struct mapentry* pentry = *preventry;

        for (; pentry != NULL; pentry = pentry->next)
        {
            if ((pentry->hash == hash) && (strcmp(pentry->key, key) == 0))
            {
                *preventry = pentry->next;
                p = pentry->p;
                free(pentry->key);
                free(pentry);
                break;
            }
            preventry = &pentry->next;
        }
    }

    return p;
}

int hashmap_set(struct hashmap* pMap, const char* key, struct item* pNew)
{
    int result = 0;

    if (pMap->table == NULL)
    {
        if (pMap->capacity < 1) {
            pMap->capacity = 1000;
        }

        pMap->table = calloc(pMap->capacity, sizeof(pMap->table[0]));        
    }

    if (pMap->table != NULL)
    {
        unsigned int hash = stringhash(key);
        int index = hash % pMap->capacity;

        struct mapentry* pentry = pMap->table[index];

        for (; pentry != NULL; pentry = pentry->next) {
            if (pentry->hash == hash && strcmp(pentry->key, key) == 0){
                break;
            }
        }

        if (pentry == NULL)
        {
            pentry = calloc(1, sizeof(*pentry));
            pentry->hash = hash;
            pentry->p = pNew;
            pentry->key = strdup(key);
            pentry->next = pMap->table[index];
            pMap->table[index] = pentry;
            pMap->size++;
            result = 0;
        }
        else
        {
            result = 1;         
            pentry->p = pNew;
        }
    }

    return result;
}

```

```cpp

int main()
{
    struct hashmap map = { .capacity = 100 };

    struct item* p = calloc(1, sizeof*p);

    hashmap_set(&map, "a", p);
    hashmap_set(&map, "a", p);
    assert(hashmap_find(&map, "a") != NULL);
    assert(hashmap_find(&map, "b") == NULL);
    
    p = hashmap_remove(&map, "a");
    item_delete(p);

    hashmap_destroy(&map);
}

```
