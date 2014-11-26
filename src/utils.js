'use strict';

var _ = require('lodash');

var SERIAL_VALUE_KEY = '.value';
var SERIAL_PRIORITY_KEY = '.priority';

exports.makeSnap = function makeSnap (ref, data, pri) {
  data = _.cloneDeep(data);
  if (_.isObject(data) && _.isEmpty(data)) { data = null; }
  return {
    val: function () { return data; },
    ref: function () { return ref; },
    name: function () {
      console.warn('DataSnapshot.name() is deprecated. Use DataSnapshot.key()');
      return this.key.apply(this, arguments);
    },
    key: function () { return ref.key(); },
    getPriority: function () { return pri; },
    forEach: function(cb, scope) {
      if (!_.isObject(data)) {
        return;
      }
      var self = this;
      _.each(data, function (v, k) {
        var res = cb.call(scope, self.child(k));
        return res !== true;
      });
    },
    child: function (key) {
      return makeSnap(ref.child(key), this.hasChild(key)? data[key] : null, ref.child(key).priority);
    },
    hasChild: function (key) {
      return _.isObject(data) && _.has(data, key);
    },
    hasChildren: function () {
      return this.numChildren() > 0;
    },
    numChildren: function () {
      if (_.isObject(data)) {
        return _.size(data);
      }
      return 0;
    },
    exportVal: function () {
      var isPrimitive = !_.isObject(data);
      var priority = this.getPriority();
      var hasPriority = _.isNumber(priority) || _.isString(priority);
      var exportData;
      if (hasPriority) {
        exportData = {};
        exportData[SERIAL_PRIORITY_KEY] = priority;
      }
      if (isPrimitive) {
        if (_.isObject(exportData)) {
          exportData[SERIAL_VALUE_KEY] = data;
        } else {
          exportData = data;
        }
      } else {
        if (!_.isObject(exportData)) {
          exportData = {};
        }
        _.reduce(data, function (memo, v, k) {
          memo[k] = this.child(k).exportVal();
          return memo;
        }, exportData, this);
      }
      return exportData;
    }
  };
};

exports.makeRefSnap = function makeRefSnap(ref) {
  return exports.makeSnap(ref, ref.getData(), ref.priority);
};

exports.mergePaths = function mergePaths (base, add) {
  return base.replace(/\/$/, '')+'/'+add.replace(/^\//, '');
};

exports.cleanData = function cleanData(data) {
  var newData = _.clone(data);
  if(_.isObject(newData)) {
    if(_.has(newData, SERIAL_VALUE_KEY)) {
      newData = _.clone(newData[SERIAL_VALUE_KEY]);
    }
    if(_.has(newData, SERIAL_PRIORITY_KEY)) {
      delete newData[SERIAL_PRIORITY_KEY];
    }
//      _.each(newData, function(v,k) {
//        newData[k] = cleanData(v);
//      });
    if(_.isEmpty(newData)) { newData = null; }
  }
  return newData;
};

exports.getMeta = function getMeta (data, key, defaultVal) {
  var val = defaultVal;
  var metaKey = '.' + key;
  if (_.isObject(data) && _.has(data, metaKey)) {
    val = data[metaKey];
    delete data[metaKey];
  }
  return val;
};

exports.assertKey = function assertKey (method, key, argNum) {
  if (!argNum) argNum = 'first';
  if (typeof(key) !== 'string' || key.match(/[.#$\/\[\]]/)) {
    throw new Error(method + ' failed: '+ argNum+' was an invalid key "'+(key+'')+'. Firebase keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"');
  }
};

exports.priAndKeyComparator = function priAndKeyComparator (testPri, testKey, valPri, valKey) {
  var x = 0;
  if (!_.isUndefined(testPri)) {
    x = exports.priorityComparator(testPri, valPri);
  }
  if (x === 0 && !_.isUndefined(testKey) && testKey !== valKey) {
    x = testKey < valKey? -1 : 1;
  }
  return x;
};

exports.priorityComparator = function priorityComparator (a, b) {
  if (a !== b) {
    if (a === null || b === null) {
      return a === null? -1 : 1;
    }
    if (typeof a !== typeof b) {
      return typeof a === 'number' ? -1 : 1;
    } else {
      return a > b ? 1 : -1;
    }
  }
  return 0;
};
