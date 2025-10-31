##Multimethods in C++

The problem:
Let's say we have a polymorphic shape class with functions to calculate intersections with other shapes.
I want to choose in runtime the correct function based on the shape even using the base class shape. 
How to do it?
Here, I will present a way to do it using RTTI capabilities from C++.
```cpp

namespace shapes {

    struct shape 
    {
        virtual ~shape(){}
        virtual void collide(const shape &) const = 0;
    };

    struct rectangle;

    struct circle : public shape
    {
        void collide(const circle &) const { std::cout << "circle->circle" << std::endl; }
        void collide(const rectangle &) const { std::cout << "circle->rectangle" << std::endl; }
        void collide(const shape &) const { std::cout << "shape->shape" << std::endl;  }
    };

    struct rectangle : public shape
    {    
        void collide(const rectangle &) const { std::cout << "rectangle->rectangle" << std::endl; }
        void collide(const circle &) const { std::cout << "rectangle->circle" << std::endl; }
        void collide(const shape &) const { std::cout << "shape->shape" << std::endl;  }
    };
}

struct double_type_info_key
{
    const type_info* l_info;
    const type_info* r_info;
    double_type_info_key(const type_info* l, const type_info*r) :
    l_info(l),
    r_info(r)
    {}
};

bool operator < (const double_type_info_key &l,
                 const double_type_info_key &r)
{
    if ( *l.l_info == *r.l_info )
        return l.r_info->before(*r.r_info);
    return l.l_info->before(*r.l_info);
}

template<class T1, class T2>
struct do_cast {
   void operator()(const shapes::shape &l,
                   const shapes::shape &r) const
   {
      dynamic_cast<const T1&>(l).collide(dynamic_cast<const T2&>(r));
   }
};

typedef std::tr1::function< void (const shapes::shape&, const shapes::shape&) >  collide_fptr;
typedef std::map<double_type_info_key, collide_fptr> Map;
Map type_info_map;

void check_collision(const shapes::shape & l, const shapes::shape &r)
{
    Map::const_iterator it = type_info_map.find(double_type_info_key(&typeid(l), &typeid(r)));
    if (it == type_info_map.end())
    {
        l.collide(r);
        return;
    }

    (*it).second(l, r);
}

template<class T1, class T2>
std::pair<double_type_info_key, collide_fptr> make_key()
{
  return make_pair(double_type_info_key(&typeid(T1), &typeid(T2)),
                   collide_fptr(do_cast<T1, T2>()));
}

int main()
{
    type_info_map.insert( make_key<shapes::rectangle, shapes::circle> ());
    type_info_map.insert( make_key<shapes::circle, shapes::rectangle> ());
    type_info_map.insert( make_key<shapes::rectangle, shapes::rectangle> ());
    type_info_map.insert( make_key<shapes::circle, shapes::circle> ());
    type_info_map.insert( make_key<shapes::shape, shapes::shape> ());

    shapes::rectangle rectangle;
    shapes::circle circle;

    check_collision(rectangle, circle);
    check_collision(rectangle, rectangle);
    
    check_collision(circle, rectangle);
    check_collision(circle, circle);
}
```
