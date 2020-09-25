
```cpp
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <stddef.h>

typedef long Align; /* for alignment to long boundary */

union header {		/* block header: */
    struct {
        union header* pnext;	/* next block if on free list */
        unsigned size;		/* size of this block */
    } s;
    Align x;		/* force alignment of blocks */
};

typedef union header Header;


static Header base;		/* empty list to get started */
static Header* freep = NULL;	/* start of free list */
Header* morecore(unsigned);

/* malloc: general-purpose storage allocator */
void* malloc2(unsigned nbytes)
{
    unsigned nunits = (nbytes + sizeof(Header) - 1) / sizeof(Header) + 1;

    Header* prevp = freep;

    if (prevp == NULL)
    {	/* no free list yet */
        freep = &base;
        base.s.pnext = freep;
        prevp = freep;
        base.s.size = 0;
    }

    for (Header* p = prevp->s.pnext; ; prevp = p, p = p->s.pnext)
    {
        if (p->s.size >= nunits)
        {	/* big enough */
            if (p->s.size == nunits)	/* exactly */
            {
                prevp->s.pnext = p->s.pnext;
            }
            else
            {			/* allocate tail end */
                p->s.size -= nunits;
                p += p->s.size;
                p->s.size = nunits;
            }
            freep = prevp;
            return (void*)(p + 1);
        }

        if (p == freep)		/* wrapped around free list */
        {
            if ((p = morecore(nunits)) == NULL)
                return NULL;	/* none left */
        }
    }
}

#define NALLOC 1024	/* minimum units to request */
void free2(void* ap);

/* morecore: ask system for more memory */
static Header* morecore(unsigned nu)
{



    if (nu < NALLOC)
        nu = NALLOC;
    char* cp = malloc(nu * sizeof(Header));
    if (cp == 0)	/* no space at all */
        return NULL;
    Header* up = (Header*)cp;
    up->s.size = nu;
    free2((void*)(up + 1));
    return freep;
}

/* free: put block ap in free list */
void free2(void* ap)
{
    Header* p;

    Header* bp = (Header*)ap - 1;
    for (p = freep; !(bp > p && bp < p->s.pnext); p = p->s.pnext)
    {
        if (p >= p->s.pnext && (bp > p || bp < p->s.pnext))
            break;
    }

    if (bp + bp->s.size == p->s.pnext) {
        bp->s.size += p->s.pnext->s.size;
        bp->s.pnext = p->s.pnext->s.pnext;
    }
    else {
        bp->s.pnext = p->s.pnext;
    }

    if (p + p->s.size == bp) {
        p->s.size += bp->s.size;
        p->s.pnext = bp->s.pnext;
    }
    else {
        p->s.pnext = bp;
    }
    freep = p;
}

struct Person {
    char* name;
};

char* strdup2(const char* s)
{
    int sz = strlen(s);
    char* r = malloc2(sz + 1);
    if (r)
        memcpy(r, s, sz + 1);
    return r;
}




struct Block {
    struct Block* pNext;
    char data[];
};

struct Allocator {
    struct Block* pHead, *pTail;
    unsigned bytesUsed; /*bytes used at the tail block*/
    unsigned BLOCK_SIZE;
};

#define ALLOCATOR_INIT {0,0,0, 1024} 


void* allocator_aligned_alloc(struct Allocator* allocator, unsigned alignment, unsigned size)
{
    void* pointer = NULL;

    int alignedPos = allocator->bytesUsed;
    if (allocator->bytesUsed % alignment != 0)
    {
        /*fixing aligment*/
        alignedPos = ((allocator->bytesUsed / alignment) + 1) * alignment;
    }

    if (allocator->pHead == NULL) {
        
        /*creating the first block*/

        struct Block* pNew = 
            malloc(sizeof(struct Block) + (size < allocator->BLOCK_SIZE ? allocator->BLOCK_SIZE : size));

        if (pNew)
        {
            pNew->pNext = 0;
            allocator->bytesUsed = size;
            pointer = pNew->data + alignedPos;
            allocator->pHead = pNew;
            allocator->pTail = pNew;
        }
    }
    else
    {
        if (allocator->bytesUsed < allocator->BLOCK_SIZE &&
            allocator->BLOCK_SIZE - alignedPos > size)
        {
            /*we have space at the current tail block*/
            pointer = allocator->pTail->data + alignedPos;
            allocator->bytesUsed = alignedPos + size;
        }
        else
        {
            /*we dont have space at the current tail block*/
            if (size > allocator->BLOCK_SIZE)
            {
                struct Block* pNew = malloc(sizeof(struct Block) + size);
                if (pNew)
                {
                    /*new block is created without changing the tail block*/
                    pNew->pNext = allocator->pHead;
                    allocator->pHead = pNew;
                    pointer = pNew + 1;
                }
            }
            else
            {
                /*
                 new tail block is created and some memory is wasted at the previous
                 tail block
                */
                struct Block* pNew = malloc(sizeof(struct Block) + allocator->BLOCK_SIZE);
                if (pNew)
                {
                    pNew->pNext = 0;
                    allocator->pTail->pNext = pNew;
                    pointer = pNew + 1;
                    allocator->bytesUsed = size;
                }
            }
        }
    }

    return pointer;
}

void* allocator_malloc(struct Allocator* allocator, int sz)
{
    return allocator_aligned_alloc(allocator, 8 /*default aligment*/, sz);
}

char* StrDup(struct Allocator* allocator, const char* s)
{
    int sz = strlen(s);
    char* r = allocator_malloc(allocator, sz + 1);
    if (r)
        memcpy(r, s, sz + 1);
    return r;
}

void allocator_free(struct Allocator* allocator) {
    
    for (struct Block* p = allocator->pHead; p; ) {
        struct Block* temp = p;
        p = p->pNext;
        free(temp);
    }
}

void Test1()
{
    struct Allocator allocator = { .BLOCK_SIZE = 8 };
    char* s = allocator_malloc(&allocator, 4);
    assert(allocator.pHead != NULL);
    assert(allocator.pTail != NULL);
    assert(allocator.pHead == allocator.pTail);
    assert(allocator.bytesUsed == 4);

    allocator_free(&allocator);
}

int main()
{
    struct Allocator allocator = ALLOCATOR_INIT;
    char* text = 0;
    text = StrDup(&allocator, "1");
    text = StrDup(&allocator, "1234567890ABCD");
    text = StrDup(&allocator, "test2");

    allocator_free(&allocator);
}
```

