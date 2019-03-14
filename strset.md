
```c

#include <stdbool.h>

struct StringSetEntry
{
	struct StringSetEntry* pNext;
	unsigned int HashValue;
	const char Key[];
};

struct StringSet
{
	struct StringSetEntry** pHashTable;
	unsigned int nHashTableSize;
	int Count;
};

#define STRING_SET_INIT \
  { NULL, 100, 0 }


bool StringSet_Find(struct StringSet* pMap, const char* Key);
bool StringSet_Remove(struct StringSet* pMap, const char* Key);
void StringSet_RemoveAll(struct StringSet* pMap);
int StringSet_Add(struct StringSet* pMap, const char* Key);
void StringSet_Destroy(struct StringSet* pMap);
```

```c
#include "StringSet.h"
#include <stdlib.h>
#include <string.h>

static unsigned int String2_HashKey(const char* Key)
{
	// hash key to unsigned int value by pseudorandomizing transform
	// (algorithm copied from STL string hash in xfunctional)
	unsigned int uHashVal = 2166136261U;
	unsigned int uFirst = 0;
	unsigned int uLast = (unsigned int) strlen(Key);
	unsigned int uStride = 1 + uLast / 10;

	for (; uFirst < uLast; uFirst += uStride)
	{
		uHashVal = 16777619U * uHashVal ^ (unsigned int) Key[uFirst];
	}

	return (uHashVal);
}

void StringSet_RemoveAll(struct StringSet* pMap)
{
	if (pMap->pHashTable != NULL)
	{
		for (unsigned int nHash = 0; nHash < pMap->nHashTableSize; nHash++)
		{
			struct StringSetEntry* pKeyValue = pMap->pHashTable[nHash];

			while (pKeyValue != NULL)
			{
				struct StringSetEntry* pKeyValueCurrent = pKeyValue;
				pKeyValue = pKeyValue->pNext;
				free(pKeyValueCurrent);
			}
			pMap->pHashTable[nHash] = NULL;
		}
		
		pMap->Count = 0;
	}
}

void StringSet_Destroy(struct StringSet* pMap)
{
	StringSet_RemoveAll(pMap);
	free(pMap->pHashTable);
	pMap->pHashTable = NULL;
}

static struct StringSetEntry* StringSet_GetAssocAt(struct StringSet* pMap,
	const char* Key,
	unsigned int* nHashBucket,
	unsigned int* HashValue)
{
	if (pMap->pHashTable == NULL)
	{
		*HashValue = 0;
		*nHashBucket = 0;
		return NULL;
	}

	*HashValue = String2_HashKey(Key);
	*nHashBucket = *HashValue % pMap->nHashTableSize;

	struct StringSetEntry* pResult = NULL;

	struct StringSetEntry* pKeyValue = pMap->pHashTable[*nHashBucket];

	for (; pKeyValue != NULL; pKeyValue = pKeyValue->pNext)
	{
		if (pKeyValue->HashValue == *HashValue &&
			strcmp(pKeyValue->Key, Key) == 0)
		{
			pResult = pKeyValue;
			break;
		}
	}

	return pResult;
}

bool StringSet_Find(struct StringSet* pMap, const char* Key)
{
	bool bResult = false;

	unsigned int nHashBucket, HashValue;
	struct StringSetEntry* pKeyValue = StringSet_GetAssocAt(pMap, Key, &nHashBucket, &HashValue);

	return pKeyValue != NULL;
}


bool StringSet_Remove(struct StringSet* pMap, const char* Key)
{
	bool bResult = false;

	if (pMap->pHashTable != NULL)
	{
		unsigned int HashValue = String2_HashKey(Key);

		struct StringSetEntry** ppKeyValuePrev =
			&pMap->pHashTable[HashValue % pMap->nHashTableSize];

		struct StringSetEntry* pKeyValue = *ppKeyValuePrev;

		for (; pKeyValue != NULL; pKeyValue = pKeyValue->pNext)
		{
			if ((pKeyValue->HashValue == HashValue) &&
				(strcmp(pKeyValue->Key, Key) == 0))
			{
				// remove from list
				*ppKeyValuePrev = pKeyValue->pNext;
				free(pKeyValue);
				bResult = true;
				pMap->Count--;
				break;
			}

			ppKeyValuePrev = &pKeyValue->pNext;
		}
	}

	return bResult;
}

int StringSet_Add(struct StringSet* pMap, const char* Key)
{
	int result = 0;

	if (pMap->pHashTable == NULL)
	{
		if (pMap->nHashTableSize < 1)
		{
			pMap->nHashTableSize = 1000;
		}

		struct StringSetEntry** pHashTable =
			(struct StringSetEntry**) malloc(sizeof(struct StringSetEntry*) * pMap->nHashTableSize);

		if (pHashTable != NULL)
		{
			memset(pHashTable, 0, sizeof(struct StringSetEntry*) * pMap->nHashTableSize);
			pMap->pHashTable = pHashTable;
		}
	}

	if (pMap->pHashTable != NULL)
	{
		unsigned int nHashBucket, HashValue;
		struct StringSetEntry* pKeyValue =
			StringSet_GetAssocAt(pMap, Key, &nHashBucket, &HashValue);

		if (pKeyValue == NULL)
		{
			pKeyValue = (struct StringSetEntry*)malloc(sizeof(struct StringSetEntry) + strlen(Key) * sizeof(char) + 1);
			pKeyValue->HashValue = HashValue;
			strcpy((char*) pKeyValue->Key, Key);

			pKeyValue->pNext = pMap->pHashTable[nHashBucket];
			pMap->pHashTable[nHashBucket] = pKeyValue;
			pMap->Count++;
			result = 1; //inserted
		}
		else
		{
			//already exist
		}
	}
	else
	{
		result = -1;//out of memory
	}

	return result;
}
```

