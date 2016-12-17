var Promise = require('bluebird');
var paper = require('paper');

var mapOfViewsToListOfSequences = new Map();

module.exports = function(item, animationRoutine, view) {
  var listOfSequences;
  if(view == null) {
    view = paper.view;
  }

  if(mapOfViewsToListOfSequences.has(view)) {
    listOfSequences = mapOfViewsToListOfSequences.get(view);
  } else {
    listOfSequences = [];
    mapOfViewsToListOfSequences.set(view, listOfSequences);
    view.on('frame', function(event) {
      for(var i = listOfSequences.length - 1; i >= 0; i--) {
        var entry = listOfSequences[i];
        var finished = entry.routine(
          item,
          event,
          (Date.now() - entry.timeInMilliseconds) / 1000
        );
        if(finished) {
          listOfSequences.splice(i, 1);
          entry.promise.resolve();
        }
      }
    });
  }

  var promiseResolve = null;
  var promiseReject = null;
  var promise = new Promise(function(resolve, reject) {
    promiseResolve = resolve;
    promiseReject = reject;
  });
  promise.resolve = promiseResolve;
  promise.reject = promiseReject;
  listOfSequences.push({
    item: item,
    timeInMilliseconds: Date.now(),
    routine: animationRoutine,
    promise: promise
  });
  return promise;
};