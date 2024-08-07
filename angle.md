```cpp

#include <type_traits>

struct Deg {};
struct Rad {};

template<class ValueType, class AngleType>
class Angle
{
public:
    explicit Angle(ValueType v) : m_value(v) {}
    Angle(const Angle& other) : m_value(other.value) {}

    template<class T>
    Angle& operator = (const Angle<T, AngleType>& other)
    {
        m_value = other.value();
        return *this;
    }
    
    ValueType value() const
    {
        return m_value;
    }

private:
    ValueType m_value;
};


template <class ValueType>
typename  Angle<ValueType, Rad> AngleRad(const Angle<ValueType, Deg>& deg)
{
    return Angle<ValueType, Rad>(static_cast<ValueType>(deg.value() * 0.01745329251994329576923690768489));
}

template <class ValueType>
typename  Angle<ValueType, Deg> AngleDeg(const Angle<ValueType, Rad>& rad)
{
    return Angle<ValueType, Deg>(static_cast<ValueType>(rad.value() * 57.295779513082320876798154814105));
}

template <class ValueType> typename Angle<ValueType, Rad> AngleRad(const ValueType& v)
{
    return Angle<ValueType, Rad>(v);
}

template <class ValueType> typename Angle<ValueType, Deg> AngleDeg(const ValueType& v)
{
    return Angle<ValueType, Deg>(v);
}

template<class LeftValueType, class RightValueType, class AngleType>
auto operator + (const Angle<LeftValueType, AngleType>& left,
                 const Angle<RightValueType, AngleType>& right) 
  -> Angle < decltype(left.value() + right.value()), AngleType >
{
    return Angle < decltype(left.value() + right.value()), AngleType > (left.value() + right.value());
}

int main()
{
    Angle<double, Rad> angleRad1(4);
    Angle<float, Rad> angleRad2(AngleRad(Angle<float, Deg>(3)));
    Angle<float, Deg> angleDeg1(1);
    Angle<double, Deg> angleDeg2(1);
    angleDeg1 = AngleDeg(angleRad1);
    angleRad1 = AngleRad(1);
    angleRad1 = AngleRad(1);
    angleRad1 = angleRad1;
    angleRad1 = angleRad2;
    angleRad2 = AngleRad(angleDeg1);
    angleRad2 = AngleRad(angleDeg2);
    angleRad2  = angleRad2 + angleRad1;
    return 0;
}



```