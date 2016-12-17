var Promise = require('bluebird');
var paper = require('paper');
var List = require('collections/list');
var Map = require('collections/map');

var mapOfViewsToListOfSequences = new Map();

module.exports = function(item, animationRoutine, view) {
  var listOfSequences;
  if(view == null) {
    view = paper.view;
  }

  if(mapOfViewsToListOfSequences.has(view)) {
    listOfSequences = mapOfViewsToListOfSequences.get(view);
  } else {
    listOfSequences = new List();
    mapOfViewsToListOfSequences.add(view, listOfSequences);
    view.on('frame', function(event) {
      listOfSequences.forEach(function(entry) {
        var finished = entry.routine(
          item,
          event,
          (Date.now() - entry.timeInMilliseconds) / 1000
        );
        if(finished) {
          listOfSequences.delete(entry); //safe per collection js docs
          entry.promise.resolve();
        }
      });
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