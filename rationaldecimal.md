This algorithm shows how to convert rational numbers
using bitints to decimal form.

```js
function DecimalForm(numerator, denominator, ndigits) {

    var quotient = numerator / denominator;
    var decimalText = quotient.toString();

    var remainder = numerator - quotient * denominator;

    //has remainder?
    if (remainder != 0n)
    {
        decimalText += ".";
        var digits = 0;
        while (remainder != 0n)
        {
            remainder = remainder * 10n;
            quotient = remainder / denominator;
            decimalText += quotient.toString();
            remainder = remainder - quotient * denominator;
            digits++;
            if (digits > ndigits) {
                break;
            }
        }
    }

    return decimalText;
}
```
