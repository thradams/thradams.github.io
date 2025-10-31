##Why the pair review is not the best option?

1) The author has already reviewed his own code

Before the check-in the code must be reviewed and tested by the author. In pair reviews, the author is present and he shows the differences to the reviewer. This is not productive; the author could be working in new defects instead of reviewing his own code again.

2) The reviewer must understand the code without the author.

The code must be clear and documented. If the reviewer asks a question to the author in the pair review, this is an indication that the author should have added the comment in the code. In some cases the email can be used to send questions to the author.

3) The reviewer is influenced by the author's verbal comments.

In pair review, sometimes, the reviewer is influenced by the author verbal comments and he does the same mental error or agrees with something that could be incorrect.

4) The reviewer should review the code using the "find" tool.

When a problem is found, there is a big chance of finding the same problem in a different part of the code. In pair programming only the differences are reviewed. The reviewer should have the project open to perform a "find" and check for more occurrences and consequences of the code change.

5) The reviewer(s) can choose the best time to review.

To review the code, it is not necessary to meet for 2 hours in pair review. Using offline reviews, the reviewer can choose the best time to review and he can divide the review into small reviews along the day. For example, during one build of 25 minutes is possible to review small differences in many files. Small reviews are better that long ones, because the reviewer's attention decreases with time.

6) The offline review requires notes of the defects

Not all defects of the code must be fixed at the same time. For example, if the code is not clear and is not optimized but it was working fine so it is not a priority to change it. However, in the future is a good idea to improve the code, so is important to make note of the suggestion.

7) In the offline review more people can review the code

Each programmer has a different experience. This is good, because each one can contribute and find different types of errors.

8) Is difficult to do a pair review with people in different locations

First because of the difference of time, secondly because it is not productive. 
