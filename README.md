NameSet:

This was my final project for my CS 343 -- Application Development class.
I've cleaned it up a little bit and put it on here.

This project takes in a name and gives back the "personal" Lego set for this name (hence, NameSet).

To do this, it connects the Agify API with the Rebrickable Lego set API. The Agify API takes in a name and returns the average age of people with that name. We aren't using that! Instead, we use the other field returned, the "count" (assumedly, the number of entries with that name in their database).

We then use that count as a Lego set ID and query the Rebrickable API for an associated LEGO set. Thus, a user's name is turned into a personal Lego set!

NOTE: in order to increase the likelihood of finding a Lego set with the specified count, we reduce the count field to a four digit number. There are relatively few sets with a five digit ID, and so most searches to the Rebrickable API with a five digit ID will return nothing.

Speaking of nothing: if you don't have an associated Lego set (i.e. your count, even when manipulated, doesn't map to a set), you get the 2008 clone trooper battle pack. Seems like a fair consolation to me!

See online: https://willmo3.github.io/NameSet/
