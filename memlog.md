
Two implementations for memory log.

First is a circular buffer of char.

Second is a circular buffer of blocks of chars.

Second is fast to print from new to old but some memory
is wasted.


```cpp
#include <stdio.h>
#include <assert.h>


#define MAX_SIZE 10

struct circular_buffer
{
    char text[MAX_SIZE];
    int head;
    int isFull;
};

void push(struct circular_buffer* cb, const char* text)
{
    const char* p = text;
    for (;;)
    {
        cb->text[cb->head] = *p;
        cb->head++;
        if (cb->head >= MAX_SIZE)
        {
            cb->isFull = 1;
            cb->head = 0;
        }
        if (*p == 0)
            break;
        p++;
    }
}

char get(struct circular_buffer* c, int index)
{
    if (c->isFull)
    {
        if (c->head + index < MAX_SIZE)
        {
            index = c->head + index;
        }
        else
        {
            index = index - (MAX_SIZE - c->head);
        }
    }
    assert(index >= 0 && index < MAX_SIZE);
    return c->text[index];
}

void print_old_to_new(struct circular_buffer* cb)
{
    if (cb->isFull)
    {
        for (int i = cb->head; i < MAX_SIZE; i++)
        {
            if (cb->text[i] == 0)
            {
                printf(" ");
            }
            else
                printf("%c", cb->text[i]);
        }
    }

    for (int i = 0; i < cb->head; i++)
    {
        if (cb->text[i] == 0)
        {
            printf(" ");
        }
        else
            printf("%c", cb->text[i]);
    }
    printf("\n");
}


void print_new_to_old(struct circular_buffer* cb)
{
    int len = cb->isFull ? MAX_SIZE : cb->head;
    
    for (int i = len - 1; i >= 0; i--)
    {
        char ch;
        if (i >0 )
          ch = get(cb, i-1);

        if (i == 0 || ch == '\0')
        {
            for (int k = i; ;k++)
            {
                ch = get(cb, k);
                if (ch == 0)
                {
                    printf(" ");
                    break;
                }
                else
                    printf("%c", ch);
            }
        }
    }

 
    printf("\n");
}

int main()
{
    struct circular_buffer cb = { 0 };
    push(&cb, "123456");
    push(&cb, "abcde");
    print_old_to_new(&cb);
    print_new_to_old(&cb);
}



```


```cpp

#include <stdio.h>
#include <assert.h>

#define LINE_LEN 4
#define MAX_LINES 3

struct circular_buffer
{
    char lines[MAX_LINES][LINE_LEN]; //ten lines of 4 chars
    int head;
    int isFull;
};

void push(struct circular_buffer* cb, const char* text)
{
    int count = 0;
    const char* p = text;
    for (;;)
    {
        if (count == LINE_LEN)
        {
            /*new*/
            cb->head++;            
            if (cb->head == MAX_LINES)
            {
                cb->isFull = 1;
                cb->head = 0;
            }
            count = 0;
        }
        cb->lines[cb->head][count] = *p;

        if (*p == 0)
        {
            cb->lines[cb->head][LINE_LEN - 1] = '\0';
            break;
        }
        p++;
        count++;
    }


    cb->head++;
    if (cb->head >= MAX_LINES)
        cb->head = 0;
}

void print_raw(struct circular_buffer* cb)
{
    for (int i = 0; i < MAX_LINES; i++)
    {
        for (int k = 0; k < LINE_LEN; k++)
        {
            if (cb->lines[i][k] == 0)
            {
                for (; k < LINE_LEN; k++)
                {
                    if (cb->lines[i][k] == 0)
                        printf(".");
                    else
                        printf("%c", cb->lines[i][k]);
                }
                break;
            }
            printf("%c", cb->lines[i][k]);
        }
        printf(" ");
    }
    printf("(%d)", cb->head);
    printf("\n");
}

void print_old_to_new(struct circular_buffer* cb)
{
    if (cb->isFull)
    {
        for (int i = cb->head; i < MAX_LINES; i++)
        {
            for (int k = 0; k < LINE_LEN; k++)
            {
                if (cb->lines[i][k] == 0)
                {
                    break;
                }
                printf("%c", cb->lines[i][k]);
            }
        }
    }

    for (int i = 0; i < cb->head; i++)
    {
        for (int k = 0; k < LINE_LEN; k++)
        {
            if (cb->lines[i][k] == 0)
            {
                break;
            }
            printf("%c", cb->lines[i][k]);
        }
    }
    printf("\n");
}

char* get(struct circular_buffer* c, int index)
{
    if (c->isFull)
    {
        if (c->head + index < MAX_LINES)
        {
            index = c->head + index;
        }
        else
        {
            index = index - (MAX_LINES - c->head);
        }
    }
    assert(index >= 0 && index < MAX_LINES);
    return c->lines[index];    
}

void print_new_to_old(struct circular_buffer* cb)
{
    int len = cb->isFull ? MAX_LINES : cb->head;
    //andar para tras
    for (int i = len - 1; i >= 0; i--)
    {
        char* p;
        if (i > 0)
           p = get(cb, i - 1);
        else
           p = get(cb, 0);

        if (i == 0 || p[LINE_LEN - 1] == 0)
        {
            int j = i;
            for (;;)
            {
                char* p2 = get(cb, j);
                int k = 0;
                for (; k < LINE_LEN; k++)
                {
                    if (p2[k] == '\0')
                        break;
                    printf("%c", p2[k]);
                }
                if (p2[k] == '\0')
                {
                    printf(" ");
                    break;
                }
                j++;
            }
        }
    }
    printf("\n");
}

char* getline(void) {
    char* line = malloc(100), * linep = line;
    size_t lenmax = 100, len = lenmax;
    int c;

    if (line == NULL)
        return NULL;

    for (;;) {
        c = fgetc(stdin);
        if (c == EOF)
            break;

        if (--len == 0) {
            len = lenmax;
            char* linen = realloc(linep, lenmax *= 2);

            if (linen == NULL) {
                free(linep);
                return NULL;
            }
            line = linen + (line - linep);
            linep = linen;
        }

        if ((*line++ = c) == '\n')
            break;
    }
    *(line -1)= '\0';
    *line = '\0';
    return linep;
}

int main()
{
    struct circular_buffer cb = { 0 };
    push(&cb, "123456");
    print_raw(&cb);
    push(&cb, "abcde");
    print_raw(&cb);
    print_old_to_new(&cb);
    print_new_to_old(&cb);
    push(&cb, "novo");
    print_raw(&cb);
    print_new_to_old(&cb);
    push(&cb, "casa");
    print_raw(&cb);
    print_new_to_old(&cb);

    for (;;)
    {
        char* line = getline();
        
        push(&cb, line);
        
        free(line);
        print_raw(&cb);
        print_new_to_old(&cb);
    }
}


```
two buffers one for chars and other for indexes


```cpp

#include <stdio.h>

#define MAX_SIZE 6


struct ring_int {
    int size;
    int tail; /*mais antigo*/
    int head; /*prix*/
    int buffer[MAX_SIZE];
};

struct ring_chars {
    int size;
    int tail; /*mais antigo*/
    int head; /*prix*/
    char buffer[MAX_SIZE];
};


void ring_chars_push(struct ring_chars* ring, char item)
{
    if (item == '\0')
        item = '*';

    if (ring->head == ring->tail &&
        ring->size == MAX_SIZE)
    {
        ring->tail++;
        if (ring->tail == MAX_SIZE)
            ring->tail = 0;
    }

    ring->buffer[ring->head] = item;
    ring->head++;
    if (ring->head == MAX_SIZE)
        ring->head = 0;

    if (ring->size < MAX_SIZE) {
        ring->size++;
    }
}


void ring_int_push(struct ring_int* ring, int item)
{
    if (ring->head == ring->tail &&
        ring->size == MAX_SIZE)
    {
        ring->tail++;
        if (ring->tail == MAX_SIZE)
            ring->tail = 0;
    }

    ring->buffer[ring->head] = item;
    ring->head++;
    if (ring->head == MAX_SIZE)
        ring->head = 0;

    if (ring->size < MAX_SIZE) {
        ring->size++;
    }
}

int ring_int_pop(struct ring_int* ring)
{
    if (ring->size < 1) return -1;

    int item = ring->buffer[ring->tail];
    ring->buffer[ring->tail] = -1;
    ring->size--;

    ring->tail++;
    if (ring->tail == MAX_SIZE)
        ring->tail = 0;
    return item;
}

void ring_text(struct ring_int* ring_int, struct ring_chars* ring, const char* text)
{
    const char* p = text;
    int start = ring->head;

    for (;;)
    {
        

        if (ring_int->size > 0 && ring->size == MAX_SIZE)
        {
            if (ring->head >= ring_int->buffer[ring_int->tail])
            {
                ring_int_pop(ring_int);
            }
        }

        ring_chars_push(ring, *p);

        if (*p == 0)
            break;
        p++;
    }

    ring_int_push(ring_int, start);
}

int get_index(struct ring_int* ring_int, int index)
{
    index = (ring_int->tail + index) % MAX_SIZE;
    return ring_int->buffer[index];
}

void print_new_to_old(struct ring_int* ring_int, struct ring_chars* ring)
{
    for (int i = ring_int->size - 1; i >= 0; i--)
    {
        int j = get_index(ring_int, i);
        while (ring->buffer[j] != '*')
        {
            printf("%c", ring->buffer[j]);
            j++;
            if (j == MAX_SIZE)
                j = 0;
        }
        printf("\n");
    }
}

void print_old_to_new(struct ring_int* ring_int, struct ring_chars* ring)
{
    //printf("%d %d\n", ring->size, ring->head);
    for (int i = 0; i < MAX_SIZE; i++)
    {
        if (i < ring->size)
            printf("%c", ring->buffer[i]);
        else
            printf(".");
    }
    printf("\n");
    
    for (int i = 0; i < MAX_SIZE; i++)
    {
        if (i == ring->head)
            printf("^");
        else if (i == ring->tail)
            printf("~");
        else
            printf(" ");
    }
    printf("\n");

    printf("[");
    for (int i = 0; i < ring_int->size; i++)
    {
        int j = get_index(ring_int, i);
        printf("%d ", j);
    }
    printf("]\n");

    for (int i = 0; i < ring_int->size; i++)
    {
        int j = get_index(ring_int, i);
        while (ring->buffer[j] != '*')
        {
            printf("%c", ring->buffer[j]);
            j++;
            if (j == MAX_SIZE)
                j = 0;
        }
        printf("\n");

    }
}

int main()
{
    struct ring_int ring_int = { 0 };
    struct ring_chars ring_chars = { 0 };
     //ring_text(&ring_int, &ring_chars, "a");
     //ring_text(&ring_int, &ring_chars, "123");
     //ring_text(&ring_int, &ring_chars, "AB");
     //ring_text(&ring_int, &ring_chars, "Z");
     //print_old_to_new(&ring_int, &ring_chars);
     //ring_text(&ring_int, &ring_chars, "45");
     //print_old_to_new(&ring_int, &ring_chars);
     
     

    for (;;)
    {
        char string[256] = { 0 };
        printf("--------------------------------\n");
        printf(">");
        scanf("%s", string);
        ring_text(&ring_int, &ring_chars, string);
        print_old_to_new(&ring_int, &ring_chars);
    }
    //ring_chars_push(&c, 'a');
    //ring_chars_push(&c, 'b');
    //ring_chars_push(&c, 'c');
    //ring_chars_push(&c, 'd');
    //ring_chars_push(&c, 'e');
}


```
