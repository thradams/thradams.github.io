# Search engine

Simple search engine to find words in documents.

### How it works?

We have a list of indexed documents. Each document has a text.
In our sample I have two documents:

```
Index | Text
------|------------
0     |"document 1"
1     |"document 2"
```

We also have a hash map data structure mapping each word (from any document) to a bitset.
When the bit N is ON that means that the word is present at document index N.

For instance

```

Word          BITSET
------------------------------
"document" [11000000...]         
"1"        [10000000...]
"2"        [01000000...]

```


The *find_docs* algorithm will return a bitset where each
bit N ON means all words are inside the document N.

For instance, for word "1" it will find [10000000...] then
we do  logical AND with the others words we have.


To print the result we walk on the bit set and if we find bit N ON
we print the document index N.

Searching for "1" it returns just the first document. But seaching
for "document" it returns document 0 and 1.

```cpp

#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <stdio.h>
#include <stdbool.h>

#define strdup _strdup

struct document
{
    const char* text;
};


#define BITSET_NUM_BITS_PER_WORD (CHAR_BIT * (int)sizeof(unsigned long))

struct bitset
{
    unsigned long* bits;
    int size;
};

inline bool bitset_getbit(struct bitset* bitset, int index)
{
    assert(index / BITSET_NUM_BITS_PER_WORD < bitset->size);
    return (bitset->bits[index / BITSET_NUM_BITS_PER_WORD] &
        (1ul << index % BITSET_NUM_BITS_PER_WORD)) != 0;
}

int bitset_resize(struct bitset* p, int newSize);

struct search_index_entry {
    struct search_index_entry* next;
    unsigned int hash;
    char* key;
    struct bitset bitset;
};

struct search_index {

    struct search_index_entry** table;
    unsigned int capacity;
    int  size;
};

int bitset_resize(struct bitset* p, int newSize)
{
    if (newSize > p->size)
    {
        int oldsize = p->size;
        unsigned long* pnew = realloc(p->bits, newSize * sizeof(p->bits[0]));
        if (pnew)
        {
            memset(pnew + oldsize, 0, sizeof(p->bits[0]) * (newSize - oldsize));
            p->bits = pnew;
            p->size = newSize;
        }
        else
        {
            return 0; /*out of mem*/
        }
    }

    return p->size;
}

void bitset_setbit(struct bitset* bitset, int index, bool b)
{
    int wordindex = index / BITSET_NUM_BITS_PER_WORD;

    if ((wordindex + 1) > bitset->size)
    {
        if (bitset_resize(bitset, wordindex + 1) == 0)
            return;
    }

    unsigned long bit = 1ul << index % BITSET_NUM_BITS_PER_WORD;
    if (b)
        bitset->bits[wordindex] |= bit;
    else
        bitset->bits[wordindex] &= ~bit;
}

void bitset_destroy(struct bitset* p)
{
    free(p->bits);
}

void search_index_remove_all(struct search_index* pMap) {

    if (pMap->table != NULL)
    {
        for (unsigned int i = 0; i < pMap->capacity; i++)
        {
            struct search_index_entry* pentry = pMap->table[i];

            while (pentry != NULL)
            {
                struct search_index_entry* pentryCurrent = pentry;

                bitset_destroy(&pentryCurrent->bitset);

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

void search_index_destroy(struct search_index* pMap)
{
    search_index_remove_all(pMap);
}

unsigned int stringhash(const char* key)
{
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

struct bitset* search_index_find(struct search_index* pMap, const char* key)
{
    struct bitset* p = NULL;

    unsigned int hash = stringhash(key);
    int index = hash % pMap->capacity;

    struct search_index_entry* pentry = pMap->table[index];

    for (; pentry != NULL; pentry = pentry->next)
    {
        if (pentry->hash == hash && strcmp(pentry->key, key) == 0)
        {
            p = &pentry->bitset;
            break;
        }
    }

    return p;
}


int search_index_set(struct search_index* pMap, const char* key, int docindex)
{
    int result = 0;

    if (pMap->table == NULL)
    {
        if (pMap->capacity < 1)
        {
            pMap->capacity = 1000;
        }

        pMap->table = calloc(pMap->capacity, sizeof(pMap->table[0]));
    }

    if (pMap->table != NULL)
    {
        unsigned int hash = stringhash(key);
        int index = hash % pMap->capacity;

        struct search_index_entry* pentry = pMap->table[index];

        for (; pentry != NULL; pentry = pentry->next)
        {
            if (pentry->hash == hash && strcmp(pentry->key, key) == 0)
            {
                break;
            }
        }

        if (pentry == NULL)
        {
            pentry = calloc(1, sizeof(*pentry));
            pentry->hash = hash;

            pentry->key = strdup(key);
            pentry->next = pMap->table[index];
            pMap->table[index] = pentry;
            pMap->size++;
            result = 0;
            bitset_setbit(&pentry->bitset, docindex, 1);
        }
        else
        {
            result = 1;
            bitset_setbit(&pentry->bitset, docindex, 1);
        }
    }

    return result;
}


void find_docs(int nwords,
    const char* words[/*nwords*/],
    struct search_index* search_index,
    struct bitset* result)
{
    bool bFirst = true;
    for (int i = 0; i < nwords; i++)
    {
        struct bitset* bitset = search_index_find(search_index, words[i]);
        if (bitset)
        {
            if (bFirst)
            {
                for (int j = 0; j < bitset->size; j++)
                {
                    if ((j + 1) > result->size)
                    {
                        bitset_resize(result, j + 1);
                    }
                    result->bits[j] = bitset->bits[j];
                }
                bFirst = false;
            }
            else
            {
                for (int j = 0; j < bitset->size; j++)
                {
                    if (j > result->size)
                    {
                        bitset_resize(result, j + 1);
                    }
                    result->bits[j] &= bitset->bits[j];
                }
            }
        }
    }
}

void print_results(struct bitset* bitset, struct document* documents)
{
    for (int i = 0; i < bitset->size * BITSET_NUM_BITS_PER_WORD; i++)
    {
        if (bitset_getbit(bitset, i))
        {
            printf("%s\n", documents[i].text);
        }
    }
}

int main(void) {

    struct document documents[] = {
        {.text = "document 1"},
        {.text = "document 2"}
    };

    struct search_index search_index = { 0 };

    /*manually creating index with first document*/
    search_index_set(&search_index, "1", 0 /*index 0*/);
    search_index_set(&search_index, "document", 0 /*index 0*/);

    /*manually creating index with second document*/
    search_index_set(&search_index, "2", 1 /*index 1*/);
    search_index_set(&search_index, "document", 1 /*index 1*/);

    struct bitset bitset = { 0 };
    find_docs(1, (const char* []) { "1" }, & search_index, & bitset);
    print_results(&bitset, &documents);
    bitset_destroy(&bitset);

    printf("---\n");

    struct bitset bitset2 = { 0 };
    find_docs(1, (const char* []) { "document" }, & search_index, & bitset2);
    print_results(&bitset2, &documents);
    bitset_destroy(&bitset2);
    search_index_destroy(&search_index);
}

```




### What is missing here?

 We need a way to sort the best results first.

 One alternative is to create a index for the title of the document 
 and other for the body. Then first we print the documents that have the words on the title.

 We also can have a number in each document representing its importance.
 At the end we sort the result with the best first.
 This number can be the number of visualization for each document, or the number
 of references or the number of clicks for instance.


### Improvements?
We also can make changes where we accept documents with just one word missing.
The index should normalized with lowercase for instance.

### Data structures

* Hashmap for word index
* dynamic bit set that can expanded automatically



