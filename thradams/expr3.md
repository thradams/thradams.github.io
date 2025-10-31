
```cpp

#include "stdafx.h"
#include <cassert>
#include <iostream>
#include <string>
#include <vector>
#include "Array2D.h"

using namespace std;

bool IsOperator(wchar_t ch)
{
    switch (ch)
    {
        case L'N':
        case L'^':
        case L'*':
        case L'/':
        case L'-':
        case L'+':
            return true;
    }

    return false;
}

int OperatorPop(wchar_t ch)
{
    switch (ch)
    {
        case L'N':
            return 1;

        case L'^':
            return 2;

        case L'*':
        case L'/':
            return 2;

        case L'-':
        case L'+':
            return 2;
    }

    //letras
    if (ch >= L'a' && ch <= 'z')
    {
        return 0;
    }

    assert(false);
    return 0;
}
int GetPrecedence(wchar_t ch)
{
    switch (ch)
    {
        case L'P':
        case L'N':
            return 20;

        case L'^':
            return 10;

        case L'*':
        case L'/':
            return 30;

        case L'-':
        case L'+':
            return 40;
    }

    //letras
    if (ch >= L'a' && ch <= 'z')
    {
        return 0;
    }

    assert(false);
    return 0;
}

bool IsUnary(wchar_t ch)
{
    switch (ch)
    {
        case L'N':
            return true;
        case L'P':
            return true;
    }

    //letras
    if (ch >= L'a' && ch <= 'z')
    {
        return true;
    }

    return false;
}

bool IsBinaryOperator(wchar_t ch)
{
    switch (ch)
    {
        case L'-':
        case L'+':
        case L'*':
        case L'/':
        case L'^':
            return true;
    }

    return false;
}

wchar_t Unary(wchar_t ch)
{
    switch (ch)
    {
        case L'-':
            return L'N';

        case L'+':
            return L'P';
    }

    assert(false);
}

void Generate(std::vector<std::wstring>& result, wchar_t ch)
{
    ////////////////////////////////////////////////////////////
    if (IsBinaryOperator(ch))
    {
        std::wstring strA = result.back();
        result.pop_back();
        std::wstring strB = result.back();
        result.pop_back();
        result.push_back(strB + L" " + strA + L" " + ch) ;
    }
    else if (IsUnary(ch))
    {
        std::wstring strA = result.back();
        result.pop_back();
        result.push_back(strA + L" " + ch);
    }

    ////////////////////////////////////////////////////////////
}

template<class Iterator>
void F(Iterator& it,
       Iterator end,
       wchar_t close,
       std::wstring& out)
{
    std::vector<wchar_t> stack;
    std::vector<std::wstring> result;
    bool doNext = true;
    bool previousWorksLikeIndentifier = false;

    for (; it  != end && *it != close;)
    {
        wchar_t ch = *it;

        if (ch == L'(')
        {
            std::wstring outtemp;
            it++;
            F(it, end, L')', outtemp);
            result.push_back(outtemp);
            previousWorksLikeIndentifier = true;
        }
        else if (IsOperator(ch))
        {
            if (!previousWorksLikeIndentifier)
            {
                //unario
                stack.push_back(Unary(ch));
            }
            else if (!stack.empty() && GetPrecedence(stack.back()) <= GetPrecedence(ch))
            {
                Generate(result, ch);
                stack.pop_back();
                stack.push_back(ch);
            }
            else
            {
                stack.push_back(ch);
            }

            previousWorksLikeIndentifier = false;
        }
        else if (ch >= L'a' && ch <= 'z')
        {
            //tem que ver se o prox eh (
            //se for eh operator se nao for eh indentificador
            it++;
            wchar_t ch2 = *it;

            if (ch2 == L'(')
            {
                previousWorksLikeIndentifier = false;
                //operator
                stack.push_back(ch);
            }
            else
            {
                previousWorksLikeIndentifier = true;
                //identificador
                std::wstring s;
                s = ch;
                result.push_back(s);
            }

            doNext = false;
        }
        else
        {
            previousWorksLikeIndentifier = true;
            //numero
            std::wstring s;
            s = ch;
            result.push_back(s);
        }

        if (doNext)
        {
            it++;
        }

        doNext = true;
    }

    while (!stack.empty())
    {
        wchar_t ch = stack.back();
        Generate(result, ch);
        stack.pop_back();
    };

    if (result.empty())
    {
        out = L"";
    }
    else
    {
        out  = result.back();
    }

    //  result.pop_back();
}


void Print(Array<wchar_t>& a)
{
    for (int r = 0 ; r < a.Rows(); r++)
    {
        for (int c = 0 ; c < a.Cols(); c++)
        {
            std::wcout << a.At(r, c);
        }

        std::wcout << std::endl;
    }
}

void Print(std::wstring& ws)
{
    std::vector<Array<wchar_t>> stack;
    std::wstring::iterator it = ws.begin();

    for (; it != ws.end();     it++)
    {
        wchar_t ch = *it;

        if (ch == L' ')
        {
            continue;
        }

        if (IsOperator(ch))
        {
            if (IsBinaryOperator(ch))
            {
                Array<wchar_t> arLeft;
                stack.back().Swap(arLeft);
                stack.pop_back();
                Array<wchar_t> arRigh;
                stack.back().Swap(arRigh);
                stack.pop_back();

                if (ch == L'+' || ch == L'-' || ch == L'*')
                {
                    Array<wchar_t> r;
                    int h = arLeft.Rows() > arRigh.Rows() ? arLeft.Rows() : arRigh.Rows() ;
                    int w = arLeft.Cols() + arRigh.Cols() + 3; //" + "
                    r.Resize(w, h);
                    int h1 = (h - arLeft.Rows()) / 2;
                    int h2 = (h - arRigh.Rows()) / 2;
                }
            }
            else if (IsUnary(ch))
            {
            }
        }
        else
        {
            Array<wchar_t> ar(1, 1);
            ar.At(0, 0) = ch;
            Print(ar);
            stack.push_back(ar);
        }
    }
}

void Test(const wchar_t* pszIn, const wchar_t* pszOut)
{
    std::wstring s = pszIn;
    std::wstring out;
    F(s.begin(), s.end(), L'', out);
    assert(out == pszOut);
   // Print(out);
}

int _tmain(int argc, _TCHAR* argv[])
{
    Test(L"", L"");
    Test(L"+1", L"1 P");
    Test(L"++1", L"1 P P");
    Test(L"1", L"1");
    Test(L"--1", L"1 N N");
    Test(L"(1+2)^3", L"1 2 + 3 ^");
    Test(L"(1+2)^(3+4)", L"1 2 + 3 4 + ^");
    Test(L"1+2", L"1 2 +");
    Test(L"1*-(2+3)", L"1 2 3 + N *");
    Test(L"()", L"");
    Test(L"-1", L"1 N");
    Test(L"-e^(2+1)", L"e 2 1 + ^ N");
    Test(L"1+2*3", L"1 2 3 * +");
    Test(L"-s(2+1)", L"2 1 + s N");
    Test(L"2+6*8^2", L"2 6 8 2 ^ * +");
    Test(L"(2+1)*3", L"2 1 + 3 *");
    Test(L"3*(2+1)", L"3 2 1 + *");
    return 0;
}
```
