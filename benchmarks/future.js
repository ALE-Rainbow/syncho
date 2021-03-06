(function () {
  "use strict";
  var Sync = require('sync')
    , async = require('async')
    , sync = require('synchronize')
    , t = 0, n = 100000
    ;

  Sync(function () {

    function asyncFn (i, cb) {
      setTimeout(function () {
        cb(null, 'foo' + i);
      }, t)
    }

    function runAsync (i) {
      return function (cb) {
        asyncFn(i, cb);
      }
    }

    console.time('sync-future');
    for (var i = 0, batch = []; i < n; i++) {
      batch.push(asyncFn.future(null, i));
    }
    for (var i = 0; i < n; i++) {
      batch[i].result;
    }
    console.timeEnd('sync-future');

    Sync = require('../lib/syncho');
    asyncFn.future(null, 0).wait();

    console.time('syncho-future');
    for (var i = 0, batch = []; i < n; i++) {
      batch.push(asyncFn.future(null, i));
    }
    for (var i = 0; i < n; i++) {
      batch[i].wait();
    }
    console.timeEnd('syncho-future');

    console.time('async.parallel');
    for (var i = 0, batch = []; i < n; i++) {
      batch.push(runAsync(i));
    }
    async.parallel(batch, function (err, res) {
      for (var i = 0; i < n; i++)
        res[i];
      console.timeEnd('async.parallel');
    });

    var Future = require('fibers/future'), wait = Future.wait, future = Future.wrap(asyncFn);
    console.time('future');
    for (var i = 0, batch = []; i < n; i++) {
      batch.push(future(i));
    }
    wait(batch);
    console.timeEnd('future');

  });
})();

