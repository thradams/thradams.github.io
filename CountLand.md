
This algorithm counts how many boxes are islands.


## Description

will create an imaginary line for each box (minX, maxY)-(minX, infinity) and count the number of intersections from this line with the others boxes.
If the number of intersections is even then box is land otherwise it is sea.

```

          +      +            +
          |      |            |
          |      |            |
    minX, |axY   |            |
          |      |            |
          v------X-------+    |
          |      |       |    |
          |      |       |    |
          |      |       |    |
          |      |       |    |
          +------X-------+    |
                 v            |
          minX, maxX          |    +
                 +------------X------------+
                 |       minX,|maxY        |
                 |            v            |
                 |            +-------+    |
                 |            |       |    |
                 |            |       |    |
                 |            +-------+    |
                 |                         |
                 |                         |
                 +-------------------------+
```

I will apply an optimization and sort the list of boxes by maxY. Boxes with bigger maxY will have smaller indexes.


```

```

Using this optimization, each box will check intersection only with the boxes that have smaller indexes.

```c



#include <iostream>
#include <vector>
#include <algorithm>
#include <cassert>


struct Box {
	double minX;
	double minY;
	double maxX;
	double maxY;
};

int CountSorted(std::vector<Box>& boxes)
{
	//pre-condition - boxes sorted by maxY

	int landCount = 0;

	for (int i = 0; i < (int)boxes.size(); i++)
	{
		int intersectionCount = 0;
		
		const double x = boxes[i].minX;
		const double y = boxes[i].maxY;

		for (int k = i - 1; k >= 0; k--)
		{
			assert(boxes[k].maxY >= y);

			if (x >= boxes[k].minX && x <= boxes[k].maxX)
			{
				//check the intersection with maxY
				if (boxes[k].maxY > y)
				{
					intersectionCount++;
				}

				//check the intersection with minY				
				if (boxes[k].minY > y)
				{
					intersectionCount++;
				}
			}
		}
		if (intersectionCount % 2 == 0)
		{
			//if even then box is land 
			landCount++;
		}
	}
	return landCount;
}

int CountUnsorted(std::vector<Box>& boxes)
{
	//boxes will be sorted by maxY
	std::sort(boxes.begin(), boxes.end(), [](const Box& a, const Box& b)
	{
		return a.maxY > b.maxY;
	});
	return CountSorted(boxes);
}


void Test()
{
	std::vector<Box> boxes0;
	assert(CountUnsorted(boxes0) == 0);

	std::vector<Box> boxes1 = {
		{ 1.0, 1.0, 3.0, 3.0 }
	};
	assert(CountUnsorted(boxes1) == 1);

	std::vector<Box> boxes2 = {
		{ 1.0, 1.0, 3.0, 3.0 },
	    { 1.0, 4.0, 1.0, 5.0 }
	};
	assert(CountUnsorted(boxes2) == 2);

	std::vector<Box> boxes3 = {
		{ 5.0, 5.0, 6.0, 6.0 },
	    { 4.0, 4.0, 7.0, 7.0 }
	};
	assert(CountUnsorted(boxes3) == 1);

	std::vector<Box> boxes4 =
	{
		{ 1.0, 1.0, 10.0, 6.0 },
	    { 1.5, 1.5, 6.0, 5.0 },
	    { 2.0, 2.0, 3.0, 3.0 },
	    { 2.0, 3.5, 3.0, 4.5 },
	    { 3.5, 2.0, 5.5, 4.5 },
	    { 4.0, 3.5, 5.0, 4.0 },
	    { 4.0, 2.5, 5.0, 3.0 },
	    { 7.0, 3.0, 9.5, 5.5 },
	    { 7.5, 4.0, 8.0, 5.0 },
	    { 8.5, 3.5, 9.0, 4.5 },
	    { 3.0, 7.0, 8.0, 10.0 },
	    { 5.0, 7.5, 7.5, 9.5 },
	    { 5.5, 8.0, 6.0, 9.0 },
	    { 6.5, 8.0, 7.0, 9.0 }
	};
	assert(CountUnsorted(boxes4) == 9);
}


```


