
See:

http://en.wikipedia.org/wiki/Levenshtein_distance

And 

[Array M*N]array2d.md)

```cpp


template<class T>
int LevenshteinDistance(const T& s1, const T& s2, Array<int>& d)
 {
   const size_t m = s1.size();
   const size_t n = s2.size();
  
   // for all i and j, d[i,j] will hold the Levenshtein distance between
   // the first i characters of s1 and the first j characters of s2;
   // note that d has (m+1)x(n+1) values
   d.ResizeConservative(m + 1, n + 1);
  
   // the distance of any first string to an empty second string
   for (size_t i = 0; i < m; i++)
       d.At(i, 0) = i; 

   // the distance of any second string to an empty first string
   for (size_t j = 0; j < n; j++)
     d.At(0, j) = j; 
  
   for (size_t j = 1; j <=  n; j++)
   {
     for (size_t i = 1; i <= m; i++)
     {
       if (s1[i] == s2[j])
       {
         // no operation required
         d.At(i, j) = d.At(i-1, j-1);
       }
       else
       {
         d.At(i, j) = (std::min)((std::min)(d.At(i - 1, j) + 1,  // a deletion
                                  d.At(i, j - 1) + 1),  // an insertion
                                  d.At(i - 1, j - 1) + 1 // a substitution
                                 );
       }
     }
   }
  
   return d.At(m, n);
 }
```

