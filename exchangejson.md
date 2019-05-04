
```cpp

#include <stdio.h>
#include <string.h>
#include <stdlib.h>


struct Data
{
	void (*ExchangeInt)(struct Data* data, const char* name, int* p);
};

void JsonLoad(const char* file, void (*Exchange)(struct Data* data, void* p), void* object);


struct ReadPropertyData
{
	struct Data data;
	const char* key;
	const char* value;
};


void ReadPropertyData_ExchangeInt(struct Data* data, const char* name, int* p)
{
	struct ReadPropertyData* pData = (struct ReadPropertyData*)data;
	if (strcmp(name, pData->key) == 0)
	{
		*p = atoi(pData->value);
	}
}



void JsonLoad(const char* file, void (*Exchange)(struct Data* data, void* p), void * object)
{
	struct ReadPropertyData data = { ReadPropertyData_ExchangeInt , "key1", "1" };
	data.value = "1";
	Exchange(&data.data, object);
}


struct X
{
	int i;
	int i2;
	char* text;
};


void ExchangeX(struct Data* data, void* p)
{
	struct X* x = (struct X*)p;
	data->ExchangeInt(data, "key1", &x->i);
	data->ExchangeInt(data, "key2", &x->i2);
}

int main()
{
	struct X x;
	JsonLoad("teste.json", ExchangeX, &x);
}

```