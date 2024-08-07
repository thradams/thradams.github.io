

Sample:

```cpp

#include "UnitTest.h"

void Test1()
{
  Assert(1 > 2);
}

int main()
{
  using namespace UnitTest;
  ConsoleReport consoleReport;
  RunTest(&Test1, consoleReport, L"Test1");
}
```


Source Code: UnitTest.h

```cpp
#pragma once
#include <string>
#include <chrono>
#include <iostream>


namespace UnitTest
{
  enum class TestResult
  {
    Passed,
    Failed,
    Canceled,
  };

  inline const wchar_t* GetTestResultMsg(TestResult r)
  {
    switch (r)
    {
      case TestResult::Passed:
        return L"Passed";

      case TestResult::Failed:
        return L"Failed";

      case TestResult::Canceled:
        return L"Canceled";

      default:
        break;
    }

    return 0;
  }

  class TestResultException
  {
  public:
    int m_SourceLine;
    std::wstring m_FileName;
    std::wstring m_Message;
    TestResult m_TestResult;
    TestResultException(TestResult r,
                        const wchar_t* message,
                        const wchar_t* f,
                        int l)
    {
      m_Message = message;
      m_FileName = f;
      m_SourceLine = l;
      m_TestResult = r;
    }
  };

  //
  //Assertions to be used inside the test functions
  //

  inline void Cancel(const wchar_t* message = L"",
                     const wchar_t* file = L"",
                     int line = 0)
  {
    throw TestResultException(TestResult::Canceled, message, file, line);
  }

  inline void Assert(bool condition,
                     const wchar_t* message = L"assertion failed",
                     const wchar_t* file = L"",
                     int line = 0)
  {
    if (!condition)
      throw TestResultException(TestResult::Failed, message, file, line);
  }

  inline void IsTrue(bool condition,
                     const wchar_t* message = L"assertion IsTrue failed",
                     const wchar_t* file = L"",
                     int line = 0)
  {
    Assert(condition, message, file, line);
  }

  inline void Fail(const wchar_t* message = L"Test failed",
                   const wchar_t* file = L"",
                   int line = 0)
  {
    Assert(false, message, file, line);
  }

  inline void IsFalse(bool condition,
                      const wchar_t* message = L"assertion IsFalse failed",
                      const wchar_t* file = L"",
                      int line = 0)
  {
    Assert(!condition, message, file, line);
  }

  template<class T1, class T2>
  inline void AreEqual(const T1& v1,
                       const T2& v2,
                       const wchar_t* message = L"assertion AreEqual failed",
                       const wchar_t* file = L"",
                       int line = 0)
  {
    Assert(v1 == v2, message, file, line);
  }

  template<class T1, class T2>
  inline void AreNotEqual(const T1& v1,
                          const T2& v2,
                          const wchar_t* message = L"assertion AreNotEqual failed",
                          const wchar_t* file = L"",
                          int line = 0)
  {
    Assert(v1 != v2, message, file, line);
  }



  struct Report
  {
    // I will count this for you
    int m_PassedCount;
    int m_FailedCount;
    int m_CanceledCount;

    Report()
    {
      m_PassedCount = 0;
      m_FailedCount = 0;
      m_CanceledCount = 0;
    }

    virtual void ReportResultCore(const wchar_t* testName,
                                  std::chrono::high_resolution_clock::duration&,
                                  UnitTest::TestResult result,
                                  const wchar_t* pszMessage) = 0;

    void ReportResult(const wchar_t* testName,
                      std::chrono::high_resolution_clock::duration& duration,
                      UnitTest::TestResult result,
                      const wchar_t* pszMessage)
    {
      switch (result)
      {
        case TestResult::Passed:
          m_PassedCount++;
          break;

        case TestResult::Failed:
          m_FailedCount++;
          break;

        case TestResult::Canceled:
          m_CanceledCount++;
          break;
      }

      ReportResultCore(testName,
                       duration,
                       result,
                       pszMessage);
    }
  };


  struct ConsoleReport : public Report
  {
    virtual void ReportResultCore(const wchar_t* testName,
                                  std::chrono::high_resolution_clock::duration& duration,
                                  TestResult result,
                                  const wchar_t* pszMessage) override
    {
      std::wcout << testName << L" ";
      std::wcout << pszMessage;

      typedef std::chrono::duration<int, std::ratio<1, 1000>> MS;
      int ms = std::chrono::duration_cast<MS>(duration).count();
      std::wcout << ms << L" ms";
    }
  };

  void RunTest(void (*PF)(void), Report& report, const wchar_t* psz)
  {
    auto startTime = std::chrono::high_resolution_clock::now();

    try
    {
      (*PF)();
      auto duration = std::chrono::high_resolution_clock::now() - startTime;
      report.ReportResult(psz, duration, TestResult::Passed, L"succeeded");
    }
    catch (const std::exception&)
    {
      auto duration = std::chrono::high_resolution_clock::now() - startTime;
      report.ReportResult(psz, duration, TestResult::Failed, L"failed");
    }
    catch (const TestResultException& e)
    {
      auto duration = std::chrono::high_resolution_clock::now() - startTime;
      report.ReportResult(psz, duration, TestResult::Failed, e.m_Message.c_str());
    }
    catch (...)
    {
      auto duration = std::chrono::high_resolution_clock::now() - startTime;
      report.ReportResult(psz, duration, TestResult::Failed, L"failed");
    }
  }
} //namespace UnitTest

#define WIDEN2(x) L ## x
#define WIDEN(x) WIDEN2(x)
#define __WFILE__ WIDEN(__FILE__)

// Auto generate comments, file and line numbers
#define Assert(x) UnitTest::Assert((x), L#x, __WFILE__, __LINE__)
#define IsTrue(x) UnitTest::IsTrue((x), L#x, __WFILE__, __LINE__)
#define IsFalse(x) UnitTest::IsFalse((x), L#x, __WFILE__, __LINE__)
#define AreEqual(x, y) UnitTest::AreEqual((x), (y), L"AreEqual " L#x L", " L#y, __WFILE__, __LINE__)
#define AreNotEqual(x, y) UnitTest::AreNotEqual((x), (y), L"AreNotEqual " L#x L", " L#y, __WFILE__, __LINE__)
#define Fail() UnitTest::Fail(L"Test Failed", __WFILE__, __LINE__)




```
