'use strict';

var _            = require('lodash');
var util         = require('util');
var EventEmitter = require('events').EventEmitter;

function FlushQueue () {
  this.events = [];
}

FlushQueue.prototype.push = function () {
  var self = this;
  this.events.push.apply(this.events, _.toArray(arguments).map(function (event) {
    if (typeof event === 'function') {
      event = {
        fn: event
      };
    }
    return new FlushEvent(event.fn, event.context, event.sourceData)
      .once('done', function (event) {
        self.events.splice(self.events.indexOf(event), 1);
      });
  }));
};

FlushQueue.prototype.flush = function (delay) {
  var self = this;
  if (!this.events.length) {
    throw new Error('No deferred tasks to be flushed');
  }
  function process () {
    while (self.events.length && !self.events[0].isRunning) {
      self.events[0].run();
    }
  }
  if (_.isNumber(delay)) {
    setTimeout(process, delay);
  }
  else {
    process();
  }
};

FlushQueue.prototype.getEvents = function () {
  return this.events.slice();
};

function FlushEvent (fn, context, sourceData) {
  this.fn = fn;
  this.context = context;
  // stores data about the event so that we can filter items in the queue
  this.sourceData = sourceData;
  this.isRunning = false;

  EventEmitter.call(this);
}

util.inherits(FlushEvent, EventEmitter);

FlushEvent.prototype.run = function () {
  this.isRunning = true;
  this.fn.call(this.context);
  this.emit('done', this);
};

FlushEvent.prototype.cancel = function () {
  this.emit('done', this);
};

exports.Queue = FlushQueue;
exports.Event = FlushEvent;
