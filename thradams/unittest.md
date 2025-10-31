## Simple Unit Test Framework for C++

This is a simple unit test (header only) framework that helps to registry and call unit test functions.

A Visual C++ project Wizard is included to make faster and easy to generate new Unit Tests projects.

Features: 

* Custom Report. A console report is included as sample 
* Extensible in many ways 
* Simple and easy to use
* Grouped (Fixtures) or single tests 
* Time calculation 
* Many useful Asserts
* Handles windows structured exceptions 
* Visual C++ Wizard included

Download the wizard for Visual C++ 

[UnitTestWizard.zip](download)

##Instructions:

# Unzip the file.
# Run the Appropriate setup: setup90 (VC++ 2009) or setup90x (VC++2009 express) or setup80x (VC++ 2005 express) or setup80 (VC++ 2005)
# Run the VC++ and go to the New project menu. The entry UnitTestWizard will be there is the installation was successful.

###Documentation

To make a simple test, here is what you do:
Create a function test with no arguments, for instance:
```cpp
TEST_FUNCTION(TestOne)()
{
}
```



At this point this function will always succeeded. To check values you can use the Assert function.
```cpp
TEST_FUNCTION(TestOne)()
{
   int a = 2;
   int b = 2;
   UnitTest::AreEqual(a, b);
}
```

In case of failure the Assert will abort this test and write a diagnostic. (Also: IsTrue, IsFalse, AreNotEqual etc...)
You can implement your report, or use a existing one, for instance ConsoleReport.

To run all the tests all you need to do is to call the function RunAll.
```cpp
int main()
{
  UnitTest::ConsoleReport rep;
  UnitTest::RunAll(rep);
}
```
You also can group a set of functions and use a test fixture
The group is defined by a common argument between functions. For instance:
```cpp

class Group1
{
  int a;
  int b;

public:
    Group1()
    {
      a = 1;
      b = 1;
    }
    ~Group1()
    {
    }
    
    void Test1()
    {
      AreEqual(a, b);
    }

    void Test2()
    {
      IsTrue_(a + b == 4);
    }
};
GROUP_TEST_ENTRY(Test1, Group1);
GROUP_TEST_ENTRY(Test2, Group1);
```

Here, TestOne and TestTwo are tests from the same group. The class used as an argument can be used as a tag, or it can hold some variables for your test.

The default constructor of Group1 will be called before the first test function of this group and the destructor will be called after the last function called in this this group. 

You can run test groups separately like this:

```cpp
RunGroup(report, L"Group1");
```



###Source code

unittest.h

```cpp
// Copyright (C) 2009, Thiago Adams (thiago.adams@gmail.com)
// www.thradams.com
// http://www.thradams.com/codeblog/myunittest3.htm
// Version: 21 July 2009
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.
//

#ifndef __TRA_UNITTEST_H_
#define __TRA_UNITTEST_H_

#include <iostream>
#include <vector>
#include <ctime>
#include <string>
#include <algorithm>
#include <stdlib.h>

#ifdef _WIN32
#include <windows.h>
//comment this line to disable windows structured exceptions
//Project options must be: Yes With SEH Exceptions (/EHa)
#define _TRA_USE_STRUCTURED_EXCEPTIONS_
#endif


namespace UnitTest
{
    typedef std::wstring String;

    enum TestResult
    {
        TestResultPassed,
        TestResultFailed,
        TestResultCanceled,
    };

    inline const wchar_t* GetTestResultMsg(TestResult r)
    {
        switch (r)
        {
            case TestResultPassed:
                return L"Passed";
            case TestResultFailed:
                return L"Failed";
            case TestResultCanceled:
                return L"Canceled";
            default:
                break;
        }
        return 0;
    }

    namespace Detail
    {
        template<int max>
        String MakeString(const char* psz)
        {
            size_t origsize = strlen(psz) + 1;
            size_t convertedChars = 0;
            wchar_t wcstring[max];
            mbstowcs(wcstring, psz, max);
            return String(wcstring);
        }

        inline void FindReplace(String& in_this_string,
                                const String& find,
                                const String& replace)
        {
            String::size_type pos = 0;
            while (String::npos != (pos = in_this_string.find(find, pos)))
            {
                in_this_string.replace(pos, find.length(), replace);
                pos += replace.length();
            }
        }

#ifdef _WIN32
        inline const wchar_t * GetExceptionCodeMsg(unsigned int e)
        {
            switch (e)
            {
                case EXCEPTION_ACCESS_VIOLATION:
                    return L"The thread attempts to read from or write to a virtual address for which it does "
                           L"not have access.";
                case EXCEPTION_ARRAY_BOUNDS_EXCEEDED:
                    return L"The thread attempts to access an array element that is out of bounds, "
                           L"and the underlying hardware supports bounds checking.";
                case EXCEPTION_BREAKPOINT:
                    return L"A breakpoint is encountered.";
                case EXCEPTION_DATATYPE_MISALIGNMENT:
                    return L"The thread attempts to read or write data that is misaligned "
                           L"on hardware that does not provide alignment."
                           L" For example, 16-bit values must be aligned on 2-byte boundaries, "
                           L"32-bit values on 4-byte boundaries, and so on.";
                case EXCEPTION_FLT_DENORMAL_OPERAND:
                    return L"One of the operands in a floating point operation is denormal."
                           L" A denormal value is one that is too small to represent as a "
                           L"standard floating point value.";
                case EXCEPTION_FLT_DIVIDE_BY_ZERO:
                    return L"The thread attempts to divide a floating point value by a floating "
                           L"point divisor of 0 (zero).";
                case EXCEPTION_FLT_INEXACT_RESULT:
                    return L"The result of a floating point operation cannot be represented exactly "
                           L"as a decimal fraction.";
                case EXCEPTION_FLT_INVALID_OPERATION:
                    return L"A floating point exception that is not included in this list.";
                case EXCEPTION_FLT_OVERFLOW:
                    return L"The exponent of a floating point operation is greater than "
                           L"the magnitude allowed by the corresponding type.";
                case EXCEPTION_FLT_STACK_CHECK:
                    return L"The stack has overflowed or underflowed, because of "
                           L"a floating point operation.";
                case EXCEPTION_FLT_UNDERFLOW:
                    return L"The exponent of a floating point operation is less than the"
                           L" magnitude allowed by the corresponding type.";
                case EXCEPTION_GUARD_PAGE:
                    return L"The thread accessed memory allocated with the PAGE_GUARD modifier.";
                case EXCEPTION_ILLEGAL_INSTRUCTION:
                    return L"The thread tries to execute an invalid instruction.";
                case EXCEPTION_IN_PAGE_ERROR:
                    return L"The thread tries to access a page that is not present,"
                           L" and the system is unable to load the page."
                           L" For example, this exception might occur if a network "
                           L"connection is lost while running a program over a network.";
                case EXCEPTION_INT_DIVIDE_BY_ZERO:
                    return L"The thread attempts to divide an integer value "
                           L"by an integer divisor of 0 (zero).";
                case EXCEPTION_INT_OVERFLOW:
                    return L"The result of an integer operation causes a carry "
                           L"out of the most significant bit of the result.";
                case EXCEPTION_INVALID_DISPOSITION:
                    return L"An exception handler returns an invalid disposition "
                           L"to the exception dispatcher. Programmers using a high-level "
                           L"language such as C should never encounter this exception.";
                case EXCEPTION_INVALID_HANDLE:
                    return L"The thread used a handle to a kernel object that was "
                           L"invalid (probably because it had been closed.)";
                case EXCEPTION_NONCONTINUABLE_EXCEPTION:
                    return L"The thread attempts to continue execution after a "
                           L"non-continuable exception occurs.";
                case EXCEPTION_PRIV_INSTRUCTION:
                    return L"The thread attempts to execute an instruction with "
                           L"an operation that is not allowed in the current computer mode.";
                case EXCEPTION_SINGLE_STEP:
                    return L"A trace trap or other single instruction mechanism signals that "
                           L"one instruction is executed";
                case EXCEPTION_STACK_OVERFLOW:
                    return L"The thread uses up its stack";
                default:
                    break;
            }
            return 0;
        }
#else
        inline const wchar_t* GetExceptionCodeMsg(unsigned int e)
        {
            return L"";
        }
#endif //_WIN32

        class WinStructuredException
        {
            unsigned int m_Code;
            WinStructuredException();
        public:
            WinStructuredException(unsigned int n) : m_Code(n) {}
            unsigned int GetCode() const
            {
                return m_Code;
            }
        };

        struct ScopeSETranslator
        {
#ifdef _TRA_USE_STRUCTURED_EXCEPTIONS_
            _se_translator_function m_OldSE;

            static void trans_func(unsigned int u, PEXCEPTION_POINTERS)
            {
                throw WinStructuredException(u);
            }

            ScopeSETranslator()
            {
                m_OldSE = _set_se_translator(&trans_func);
            }

            ~ScopeSETranslator()
            {
                _set_se_translator(m_OldSE);
            }
#else
            ScopeSETranslator() {}
            ~ScopeSETranslator() {}
#endif // _TRA_USE_STRUCTURED_EXCEPTIONS_
        };

        class TestResultException
        {
        public:
            int m_SourceLine;
            String m_FileName;
            String m_Message;
            TestResult m_TestResult;
            TestResultException(TestResult r,
                                const String& message,
                                const String& f,
                                int l)
            {
                m_Message = message;
                m_FileName = f;
                m_SourceLine = l;
                m_TestResult = r;
            }
        };
    } //namespace Detail

    //
    //Assertions to be used inside the test functions
    //

    inline void Cancel(const String& message = L"",
                       const String& file = L"",
                       int line = 0)
    {
        throw Detail::TestResultException(TestResultCanceled, message, file, line);
    }

    inline void Assert(bool condition,
                       const String& message = L"assertion failed",
                       const String& file = L"",
                       int line = 0)
    {
        if (!condition)
            throw Detail::TestResultException(TestResultFailed, message, file, line);
    }

    inline void IsTrue(bool condition,
                       const String& message = L"assertion IsTrue failed",
                       const String& file = L"",
                       int line = 0)
    {
        UnitTest::Assert(condition, message, file, line);
    }

    inline void Fail(const String& message = L"Test failed",
                     const String& file = L"",
                     int line = 0)
    {
        UnitTest::Assert(false, message, file, line);
    }

    inline void IsFalse(bool condition,
                        const String& message = L"assertion IsFalse failed",
                        const String& file = L"",
                        int line = 0)
    {
        UnitTest::Assert(!condition, message, file, line);
    }

    template<class T1, class T2>
    inline void AreEqual(const T1& v1,
                         const T2& v2,
                         const String& message = L"assertion AreEqual failed",
                         const String& file = L"",
                         int line = 0)
    {
        UnitTest::Assert(v1 == v2, message, file, line);
    }

    template<class T1, class T2>
    inline void AreNotEqual(const T1& v1,
                            const T2& v2,
                            const String& message = L"assertion AreNotEqual failed",
                            const String& file = L"",
                            int line = 0)
    {
        UnitTest::Assert(v1 != v2, message, file, line);
    }

// Auto generate comments, file and line numbers
#define Assert_(x) UnitTest::Assert((x), L#x, __WFILE__, __LINE__)
#define IsTrue_(x) UnitTest::IsTrue((x), L#x, __WFILE__, __LINE__)
#define IsFalse_(x) UnitTest::IsFalse((x), L#x, __WFILE__, __LINE__)
#define AreEqual_(x, y) UnitTest::AreEqual((x), (y), L"AreEqual " L#x L", " L#y, __WFILE__, __LINE__)
#define AreNotEqual_(x, y) UnitTest::AreNotEqual((x), (y), L"AreNotEqual " L#x L", " L#y, __WFILE__, __LINE__)
#define Fail_() UnitTest::Fail(L"Test Failed", __WFILE__, __LINE__)

    struct GroupInfo
    {
        virtual ~GroupInfo() {}
        virtual void Call() = 0;
        virtual void GroupDataCreate() {}
        virtual void GroupDataDelete() {}
        virtual String GetGroupName()
        {
            return L"ungrouped";
        }
    };

    template<class T>
    struct GroupInfoImp : public GroupInfo
    {
        typedef void (*PF)(T&);
        PF m_Function;
        String m_Name;

        static T * & GetDataPtr()
        {
            static T * data = 0;
            return data;
        }

        virtual String GetGroupName()
        {
            return m_Name;
        }

        GroupInfoImp(PF f) : m_Function(f)
        {
          m_Name = Detail::MakeString<200>(typeid(T).name());
          Detail::FindReplace(m_Name, L"struct ", L"");
          Detail::FindReplace(m_Name, L"class ", L"");
        }

        ~GroupInfoImp()
        {
        }

        virtual void Call()
        {
            (*m_Function)(*GetDataPtr());
        }

        virtual void GroupDataCreate()
        {
            if (GetDataPtr() == 0)
            {
                GetDataPtr() = new T();
            }
        }

        virtual void GroupDataDelete()
        {
            delete GetDataPtr();
            GetDataPtr() = 0;
        }
    };

    struct GroupInfoNone: public GroupInfo
    {
        typedef void (*PF)(void);
        PF m_Function;

        GroupInfoNone(PF f) : m_Function(f)
        {
        }
        virtual void Call()
        {
            (*m_Function)();
        }
    };

    struct TestEntry;
    inline std::vector<TestEntry*> & GetTestEntryList()
    {
        static std::vector<TestEntry*> tests;
        return tests;
    }

    struct TestEntry
    {
        String m_TestName;
        String m_Source;
        String m_Message;
        int m_SourceLine;
        TestResult m_Result;
        std::clock_t m_StartTime;
        std::clock_t m_EndTime;
        std::auto_ptr<GroupInfo> m_GroupInfo;

        TestEntry(void (*f)(void),
                  const String& name,
                  const String& group,
                  const String& source,
                  int line)
        {
            m_GroupInfo.reset(new GroupInfoNone(f));
            m_Result = TestResultFailed;
            m_Source = source;
            m_SourceLine = line;
            m_TestName = name;
            GetTestEntryList().push_back(this);
            m_StartTime = std::clock();
            m_EndTime = m_StartTime;
        }

        template<class T>
        TestEntry(void (*f)(T&),
                  const String& name,
                  const String& group,
                  const String& source,
                  int line)
        {
            m_GroupInfo.reset(new GroupInfoImp<T>(f));
            m_Result = TestResultFailed;
            m_Source = source;
            m_SourceLine = line;
            m_TestName = name;
            GetTestEntryList().push_back(this);
            m_StartTime = std::clock();
            m_EndTime = m_StartTime;
        }

        bool Failed() const
        {
            return m_Result == TestResultFailed;
        }

        bool operator < (const TestEntry & te) const
        {
            return m_GroupInfo->GetGroupName() < te.m_GroupInfo->GetGroupName();
        }

        int GetDurationMs()
        {
            return (int)((m_EndTime - m_StartTime) / CLOCKS_PER_SEC * 1000.0);
        }
    };

#define WIDEN2(x) L ## x
#define WIDEN(x) WIDEN2(x)
#define __WFILE__ WIDEN(__FILE__)

#define TEST_ENTRY(class)\
  static UnitTest::TestEntry __objMap_##class(&class, L#class, L"", __WFILE__, __LINE__);

#define GROUP_TEST_ENTRY(F, groupname) \
inline void F(groupname& groupname_arg) { groupname_arg.F(); } \
TEST_ENTRY(F)

#define TEST_FUNCTION(X) void X(); TEST_ENTRY(X); void X

    class Report
    {
        // I will count this for you
        int m_PassedCount;
        int m_FailedCount;
        int m_CanceledCount;

        //Override this
        virtual void ReportResultCore(TestEntry&)
        {
        }

        //Override this
        virtual void GroupEnterCore(GroupInfo*)
        {
        }

        //Override this
        virtual void GroupExitCore(GroupInfo*)
        {
        }

        void DoCount(TestEntry& test)
        {
            switch (test.m_Result)
            {
                case TestResultPassed:
                    m_PassedCount++;
                    break;
                case TestResultFailed:
                    m_FailedCount++;
                    break;
                case TestResultCanceled:
                    m_CanceledCount++;
                    break;
            }
        }

    public:
        Report()
        {
            m_PassedCount = 0;
            m_FailedCount = 0;
            m_CanceledCount = 0;
        }

        int GetPassedCount() const
        {
            return m_PassedCount;
        }

        int GetFailedCount() const
        {
            return m_FailedCount;
        }

        int GetCanceledCount() const
        {
            return m_CanceledCount;
        }

        void GroupEnter(GroupInfo* p)
        {
            GroupEnterCore(p);
        }

        void GroupExit(GroupInfo* p)
        {
            GroupExitCore(p);
        }

        void ReportResult(TestEntry& test)
        {
            DoCount(test);
            ReportResultCore(test);
        }
    };

    //You can customize our own report like this
    class ConsoleReport : public UnitTest::Report
    {
        String m_Tab;
        virtual void GroupEnterCore(GroupInfo* p)
        {
            m_Tab = L"  ";
            std::wcout << p->GetGroupName() << std::endl;
        }

        virtual void GroupExitCore(GroupInfo* p)
        {
            m_Tab = L"";
            std::wcout << std::endl;
        }

        virtual void ReportResultCore(TestEntry& test)
        {
            std::wcout << m_Tab;
            std::wcout << test.m_TestName << " ";
            std::wcout << GetTestResultMsg(test.m_Result) << " (";
            std::wcout << test.GetDurationMs() << " ms) ";
            std::wcout << test.m_Message << std::endl;
        }
    };

    namespace Detail
    {
        inline TestResult RunTest(TestEntry* pEntry, Report& rep)
        {
            pEntry->m_Result = TestResultFailed;
            try
            {
                ScopeSETranslator st;
                pEntry->m_StartTime = std::clock();
                pEntry->m_EndTime = pEntry->m_StartTime;
                pEntry->m_GroupInfo->Call();
                pEntry->m_EndTime = std::clock();
                pEntry->m_Result = TestResultPassed;
                rep.ReportResult(*pEntry);
            }
            catch (const std::exception& e)
            {
                pEntry->m_EndTime = std::clock();
                String msg = L"Test aborted by unhandled std::exception";
                msg += L"\n";
                msg += MakeString<400>(e.what());
                pEntry->m_Message = msg;
                rep.ReportResult(*pEntry);
            }
            catch (const TestResultException& e)
            {
                pEntry->m_EndTime = std::clock();
                pEntry->m_Result = e.m_TestResult;
                pEntry->m_Message = e.m_Message;
                rep.ReportResult(*pEntry);
            }
            catch (const WinStructuredException& e)
            {
                pEntry->m_EndTime = std::clock();
                String msg = L"Test aborted by SE exception";
                msg += GetExceptionCodeMsg(e.GetCode());
                pEntry->m_Message = msg;
                rep.ReportResult(*pEntry);
            }
            catch (...)
            {
                pEntry->m_EndTime = std::clock();
                pEntry->m_Message =  L"Test aborted by unhandled exception";
                rep.ReportResult(*pEntry);
            }
            return pEntry->m_Result;
        }

        inline bool SortPred(TestEntry* pa, TestEntry *pb)
        {
            return *pa < *pb;
        }

        inline void Run(Report& rep, const String & groupName, bool runAll)
        {
            std::vector<TestEntry*> &tests = GetTestEntryList();
            std::sort(tests.begin(), tests.end(), SortPred);
            bool cancelGroup = true;
            String currentGroupName;
            for (unsigned int i = 0; i < tests.size(); i++)
            {
                TestEntry * pTestEntry = tests[i];
                // has the group changed?
                if (i == 0 || currentGroupName != pTestEntry->m_GroupInfo->GetGroupName())
                {
                    if (i > 0 && !cancelGroup)
                    {
                        GroupInfo * pPreviousGroupInfo = tests[i - 1]->m_GroupInfo.get();
                        pPreviousGroupInfo->GroupDataDelete();
                        rep.GroupExit(pPreviousGroupInfo);
                        cancelGroup = true;
                    }
                    currentGroupName = pTestEntry->m_GroupInfo->GetGroupName();
                    if (runAll || currentGroupName == groupName)
                    {
                        ScopeSETranslator st;
                        GroupInfo * pCurrentGroupInfo = pTestEntry->m_GroupInfo.get();
                        try
                        {
                            pCurrentGroupInfo->GroupDataCreate();
                            cancelGroup = false;
                            rep.GroupEnter(pCurrentGroupInfo);
                        }
                        catch (...)
                        {
                            cancelGroup = true;
                            std::wcout << currentGroupName << L" canceled by unhandled exception" << std::endl;
                        }
                    }
                }
                if (!cancelGroup)
                {
                    TestResult res = RunTest(pTestEntry, rep);
                }
            }
            if (tests.size() > 0 && !cancelGroup)
            {
                GroupInfo * pPreviousGroupInfo = tests.back()->m_GroupInfo.get();
                pPreviousGroupInfo->GroupDataDelete();
                rep.GroupExit(pPreviousGroupInfo);
            }
        }
    } //namespace Detail

    inline void RunAll(Report& rep)
    {
        Detail::Run(rep, L"", true);
    }

    inline void RunGroup(Report& rep, const String& groupName)
    {
        Detail::Run(rep, groupName, false);
    }
} // namespace UnitTest


//Sample of use:

//#include "unittest.h"
//
//void TestOne()
//{
//   int a = 2;
//   int b = 2;
//   UnitTest::Assert(a == b);
//}
//TEST_ENTRY(TestOne)
//
//class Group1
//{
//public:
//  Group1() {}
//  ~Group1() {}
//};
//
//void Test1Group1(Group1&){}
//TEST_ENTRY(Test1Group1)
//
//void Test2Group1(Group1&){}
//TEST_ENTRY(Test2Group1)
//
//int main()
//{
//   UnitTest::ConsoleReport rep;
//   UnitTest::RunAll(rep);
//   return 0;
//}

// OR

//
//TEST_FUNCTION(TestOne)()
//{
//    int a = 2;
//    int b = 2;
//    AreEqual(a, b);
//    IsTrue(a + b == 4);
//}
//
//class Group1
//{
//public:
//    Group1(){}
//    ~Group1(){}
//    void Test1(){}
//    void Test2(){}
//};
//GROUP_TEST_ENTRY(Test1, Group1);
//GROUP_TEST_ENTRY(Test2, Group1);


#endif // __TRA_UNITTEST_H_

```

###History

*18 Jan 2011 Review
*26 January 2009 - Header file version 3 published 
*20 July 2009 - VC++ Wizard Added
*21 July 2009 - New Macros to simplify
*22 July 2009 - Exceptions configured correctly into VC++ project

