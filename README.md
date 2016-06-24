Given a log in which each entry is a _put_ or _delete_ operation affecting
a key-value store:

1. _Compact_ the log, producing a new log containing only _put_ operations
   for still-existing keys with latest values.

2. _Shuffle_ the log using a provided one-way function (hash function)
   to seed a pseudo-random number generator.

This package was motivated by the need to replicate a grow-only set using
a log while obscuring the ordering of operations.  Replicating peers can
independently verify that a log compacted in this way reflects the state
resulting from a slice of the shared log.  Future peers can replicate
the compacted log, rather than the entire log.
