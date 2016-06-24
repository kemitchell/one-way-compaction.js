var MersenneTwister = require('mersenne-twister')
var once = require('once')
var shuffle = require('fisher-yates/inplace')

// Singleton object used to mark deleted key-value pairs.
var DELETED = { }

module.exports = function(log, keyOf, valueOf, isDelete, put, hash, callback) {
  once(callback)
  // The computer state of the key-value store updated by the log.
  var state = { }
  log
    .on('error', function(error) { callback(error) })
    .on('data', function(chunk) {
      var key = keyOf(chunk)
      hash.update(key)
      if (isDelete(chunk)) { state[key] = DELETED }
      else { state[key] = valueOf(chunk) } })
    .on('end', function() {
      // Use a one-way function to compute a seed for shuffling, based
      // on log entry keys, in order.
      var seed = hash.digest().readInt32LE()
      // Iterate the key-value pairs in state to create a compact list
      // of put operations that will produce the same state.
      var compacted = Object.keys(state)
        .reduce(
          function(compacted, key) {
            var value = state[key]
            return (
              ( value === DELETED )
                ? compacted
                : compacted.concat(put(key, value)) ) },
          [ ])
      // Reorder the compacted log, using the seed.
      reorder(compacted, seed)
      callback(null, compacted) }) }

function reorder(array, seed) {
  // Seed a Pseudo-Random Number Generator.
  var generator = new MersenneTwister(seed)
  // Use the PRNG to shuffle the array with Fisher-Yates.
  return shuffle(array, generator.random.bind(generator)) }
