
```cpp

#define BLOCK_SIZE 10 //1024

struct Block {
    struct Block* pNext;
    char  data[]; /*TODO align*/
};

struct Allocator {
    struct Block* pHead;
    struct Block* pTail;
    unsigned bytesUsed; /*bytes used on tail block*/
};

void* Malloc(struct Allocator* allocator, int sz)
{
    void* result = NULL;

    assert(sz > 0 && sz < BLOCK_SIZE);

    if (allocator->pHead == NULL) {
        /*first use*/
        struct Block* pNew = malloc(sizeof(struct Block) + BLOCK_SIZE);
        if (pNew == NULL)
            return NULL;
        pNew->pNext = 0;

        allocator->pHead = pNew;                
        allocator->pTail = pNew;
        allocator->bytesUsed = 0;        
    }

    if (BLOCK_SIZE - allocator->bytesUsed < sz) {

        /*need a new block*/

        struct Block* pNew = malloc(sizeof(struct Block) + BLOCK_SIZE);
        if (pNew == NULL)
            return NULL;
        pNew->pNext = 0;

        allocator->pTail->pNext = pNew;
        allocator->pTail = pNew;
        allocator->bytesUsed = 0;
    }

    if (allocator->pTail != NULL)
    {
        result = allocator->pTail->data + allocator->bytesUsed;

        /*alignment*/
        unsigned n = allocator->bytesUsed + sz / sizeof(max_align_t);
        allocator->bytesUsed = (n + 1) * sizeof(max_align_t);
    }

    return result;
}

char* StrDup(struct Allocator* allocator, const char* s)
{
    int sz = strlen(s);
    char* r = Malloc(allocator, sz + 1);
    if (r)
        memcpy(r, s, sz + 1);
    return r;
}

void Free(struct Allocator* allocator) {
    struct Block* p = allocator->pHead;
    while (p) {
        struct Block* temp = p;
        p = p->pNext;
        free(temp);
    }
}

int main()
{
    struct Allocator allocator = { 0 };

    char* text = StrDup(&allocator, "123489");
    text = StrDup(&allocator, "test2");

    Free(&allocator);
}
```

