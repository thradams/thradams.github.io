
## Header

```cpp
#pragma once
#include <stdint.h> 
#include <stdbool.h>

typedef struct Bucket
{
  struct Bucket* pNext;
  unsigned int   Hash;
  uint32_t       Key;
  void*          pValue;
} Bucket;

typedef struct
{
  Bucket**     pBuckets;
  unsigned int HashTableSize;
  size_t       Count;
} Map;


#define MAP_INIT_100 { NULL, 100, 0 }

void Map_Init(Map* p);
void Map_Destroy(Map* p, void (*PF)(void*));

int Map_SetAt(Map* pMap,
              uint32_t Key,
              void* pNewValue,
              void** ppPreviousValue);

bool Map_Lookup(Map* pMap,
                uint32_t  Key,
                void** ppValue);

bool Map_RemoveKey(Map* pMap,
                   uint32_t Key,
                   void** ppValue);
```
## Source

```c
#include "Map.h"
#include <string.h>
#define ASSERT(X)
#include <stdlib.h>

void Map_Reset(Map* pMap, void(*PF)(void*));

void Map_Init(Map * p)
{
  Map temp = MAP_INIT_100;
  *p = temp;
}

void Map_Destroy(Map* pMap, void(*PF)(void*))
{
  Map_Reset(pMap, PF);
}


static Bucket* FindBucket(
  Map* pMap,
  uint32_t Key,
  unsigned int* nHashBucket,
  unsigned int* HashValue);


inline unsigned int HashKey(uint32_t  Key)
{
  // hash key to unsigned int value by pseudorandomizing transform
  // (algorithm copied from STL string hash in xfunctional)
  unsigned int uHashVal = 2166136261U;
  unsigned int uFirst = 0;
  unsigned int uLast = (unsigned int)sizeof(Key);
  unsigned int uStride = 1 + uLast / 10;

  for (; uFirst < uLast; uFirst += uStride)
  {
    uHashVal = 16777619U * uHashVal ^ (unsigned int) ((char*) &Key)[uFirst];
  }

  return (uHashVal);
}


void Map_Reset(Map* pMap, void(*PF)(void*))
{
  if (pMap->pBuckets != NULL)
  {
    for (unsigned int i = 0;
      i < pMap->HashTableSize;
      i++)
    {
      Bucket* pBucket =
        pMap->pBuckets[i];

      while (pBucket != NULL)
      {
        Bucket* pCurrentBucket = pBucket;
        pBucket = pBucket->pNext;
        
        if (PF) 
        {
          //call destructor of pValue
          PF(pCurrentBucket->pValue);
        }

        //Delete Bucket pCurrentBucket
        free(pCurrentBucket);
      }
    }

    free(pMap->pBuckets);
    pMap->pBuckets = NULL;
    pMap->Count = 0;
  }
}


static Bucket* FindBucket(
  Map* pMap,
  uint32_t Key,
  unsigned int* nHashBucket,
  unsigned int* HashValue)
{
  Bucket* pResult = NULL;

  if (pMap->pBuckets == NULL)
  {
    *HashValue = 0;
    *nHashBucket = 0;
  }
  else
  {
    *HashValue = HashKey(Key);
    *nHashBucket = *HashValue % pMap->HashTableSize;

    Bucket* pKeyValue =
      pMap->pBuckets[*nHashBucket];

    for (; pKeyValue != NULL; pKeyValue = pKeyValue->pNext)
    {
      if (pKeyValue->Hash == *HashValue &&
        pKeyValue->Key == Key)
      {
        pResult = pKeyValue;
        break;
      }
    }
  }

  return pResult;
}

bool Map_Lookup(Map* pMap,
  uint32_t  Key,
  void** ppValue)
{
  bool bResult = false;

  unsigned int nHashBucket, HashValue;
  Bucket* pBucket = FindBucket(pMap,
    Key,
    &nHashBucket,
    &HashValue);

  if (pBucket != NULL)
  {
    *ppValue = pBucket->pValue;
    bResult = true;
  }

  return bResult;
}

bool Map_RemoveKey(Map* pMap,
  uint32_t  Key,
  void** ppValue)
{
  *ppValue = NULL;
  bool bResult = false;

  if (pMap->pBuckets != NULL)
  {
    unsigned int HashValue = HashKey(Key);

    Bucket** ppBucketPrev =
      &pMap->pBuckets[HashValue % pMap->HashTableSize];

    Bucket* pBucket = *ppBucketPrev;

    for (; pBucket != NULL; pBucket = pBucket->pNext)
    {
      if ((pBucket->Hash == HashValue) &&
        (pBucket->Key == Key))
      {
        // remove from list
        *ppBucketPrev = pBucket->pNext;
        *ppValue = pBucket->pValue;

        //Delete Bucket pKeyValue
        free(pBucket);

        bResult = true;
        break;
      }

      ppBucketPrev = &pBucket->pNext;
    }
  }

  return bResult;
}

int Map_SetAt(Map* pMap,
  uint32_t Key,
  void* newValue,
  void** ppPreviousValue)
{
  int result = 0;
  *ppPreviousValue = NULL;

  if (pMap->pBuckets == NULL)
  {
    if (pMap->HashTableSize < 1)
    {
      pMap->HashTableSize = 1;
    }

    Bucket** pNewBuckets =
      (Bucket**)malloc(sizeof(Bucket*) * pMap->HashTableSize);

    if (pNewBuckets != NULL)
    {
      memset(pNewBuckets, 0, sizeof(Bucket*) * pMap->HashTableSize);
      pMap->pBuckets = pNewBuckets;
    }
  }

  if (pMap->pBuckets != NULL)
  {
    unsigned int nHashBucket, HashValue;
    Bucket* pBucket =
      FindBucket(pMap,
        Key,
        &nHashBucket,
        &HashValue);

    if (pBucket == NULL)
    {
      pBucket = (Bucket*)malloc(sizeof(Bucket) * 1);
      pBucket->Hash = HashValue;
      pBucket->pValue = newValue;
      pBucket->Key = Key;
      pBucket->pNext = pMap->pBuckets[nHashBucket];
      pMap->pBuckets[nHashBucket] = pBucket;
      pMap->Count++;
      result = 0;
    }

    else
    {
      result = 1;
      *ppPreviousValue = pBucket->pValue;
      pBucket->pValue = newValue;
      pBucket->Key = Key;
    }
  }

  return result;
}

```


