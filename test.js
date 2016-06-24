var streamArray = require('stream-array')
var crypto = require('crypto')
var tape = require('tape')
var compact = require('./')

tape('Example 1', function(test) {
  var log =
    [ makePut('a', 1),
      makePut('b', 2),
      { key: 'b', deleted: true },
      makePut('c', 3),
      makePut('d', 4),
      makePut('e', 5) ]

  test.test('sha1', function(test) {
    var hash = crypto.createHash('sha1')
    var stream = streamArray(log)
    compactLog(stream, hash, function(error, compacted) {
      test.ifError(error, 'no error')
      test.deepEqual(
        compacted,
        [ { key: 'c', value: 3 },
          { key: 'a', value: 1 },
          { key: 'd', value: 4 },
          { key: 'e', value: 5 } ],
        'expected compaction')
      test.end() }) })

  test.test('sha256', function(test) {
    var hash = crypto.createHash('sha256')
    var stream = streamArray(log)
    compactLog(stream, hash, function(error, compacted) {
      test.ifError(error, 'no error')
      test.deepEqual(
        compacted,
        [ { key: 'd', value: 4 },
          { key: 'c', value: 3 },
          { key: 'a', value: 1 },
          { key: 'e', value: 5 } ],
        'expected compaction')
      test.end() }) }) })

function keyOf(argument) { return argument.key }

function valueOf(argument) { return argument.value }

function isDelete(argument) { return ( argument.deleted === true ) }

function makePut(key, value) { return { key: key, value: value } }

function compactLog(log, hash, callback) {
  compact(log, keyOf, valueOf, isDelete, makePut, hash, callback) }
