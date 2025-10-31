## Performance test std::visitor x switch 
June 2020

```cpp


#define MAXCOUNT 10000000

#ifndef __cplusplus

#include <assert.h>
#include <stdio.h>
#include <time.h>

struct circle {
    double radius;
};
#define CIRCLE_TAG 1

struct square {
    double side;
};
#define SQUARE_TAG 2

struct rectangle {
    double width;
    double height;
};
#define RECTANGLE_TAG 3

struct shape {
    int tag;
    union {
        struct circle circle;
        struct square square;
        struct rectangle rectangle;
    };
};

double shape_area(struct shape* s) {
    switch (s->tag) {
        case CIRCLE_TAG:
            return 3.14 * s->circle.radius * s->circle.radius;
        case SQUARE_TAG:
            return s->square.side * s->square.side;
        case RECTANGLE_TAG:
            return s->rectangle.width * s->rectangle.height;
        default:
            assert(0);
            break;
    }
    return 0;
}

int run_test(const char* message, int (*test)(void)) {
    time_t start = clock();
    int r = test();
    printf("%s %d\n", message, (int)(clock() - start));
    return r;
}

void TestC() {}

int main() {
    struct shape s[] = {
        {.tag = CIRCLE_TAG, .circle.radius = 5},
        {.tag = SQUARE_TAG, .square.side = 2},
        {.tag = RECTANGLE_TAG, .rectangle.width = 4, .rectangle.height = 5},
        {.tag = CIRCLE_TAG, .circle.radius = 5},
        {.tag = SQUARE_TAG, .square.side = 2},
        {.tag = RECTANGLE_TAG, .rectangle.width = 4, .rectangle.height = 5},
        {.tag = CIRCLE_TAG, .circle.radius = 5},
        {.tag = SQUARE_TAG, .square.side = 2},
        {.tag = RECTANGLE_TAG, .rectangle.width = 4, .rectangle.height = 5} };

    double area = 0;
    time_t start = clock();
    for (int j = 0; j < MAXCOUNT; j++) {
        area = 0;
        for (int i = 0; i < sizeof(s) / sizeof(s[0]); i++) {
            area += shape_area(&s[i]);
        }
    }
    printf("%d\n", (int)(clock() - start));
    printf("%f", area);

    return 0;
}
#else

#include <ctime>
#include <iostream>
#include <memory>
#include <variant>
#include <vector>

struct circle {
    circle(double const radius_) : radius(radius_) {}
    double  radius;
};

struct square {
    square(double const side_) : side(side_) {}
    double  side;
};

struct rectangle {
    rectangle(double width_, double height_)
        : width(width_), height(height_) {}
    double  width;
    double  height;
};

double area(circle const& c) {
    return 3.14 * c.radius * c.radius;
}
double area(square const& s) {
    return s.side * s.side;
}
double area(rectangle const& r) {
    return r.width * r.height;
}

using shape = std::variant<circle, square, rectangle>;

int main() {
    shape shapes[] = { circle(5), square(2), rectangle(4, 5),
                      circle(5), square(2), rectangle(4, 5),
                      circle(5), square(2), rectangle(4, 5) };

    double total_area = 0;

    time_t start = clock();
    for (int j = 0; j < MAXCOUNT; j++) {
        total_area = 0;
        for (int i = 0; i < sizeof(shapes) / sizeof(shapes[0]); i++) {
            std::visit([&](auto const& shape) { total_area += area(shape); },
                       shapes[i]);
        }
    }
    printf("time: %d\n\n", (int)(clock() - start));
    std::cout << "Area total: " << total_area << std::endl;
    return 0;
}

#endif


```



