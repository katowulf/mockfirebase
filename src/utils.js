'use strict';

var Snapshot = require('./snapshot');
var _        = require('lodash');

exports.makeRefSnap = function makeRefSnap(ref) {
  return new Snapshot(ref, ref.getData(), ref.priority);
};

exports.mergePaths = function mergePaths (base, add) {
  return base.replace(/\/$/, '')+'/'+add.replace(/^\//, '');
};

exports.cleanData = function cleanData(data) {
  var newData = _.clone(data);
  if(_.isObject(newData)) {
    if(_.has(newData, '.value')) {
      newData = _.clone(newData['.value']);
    }
    if(_.has(newData, '.priority')) {
      delete newData['.priority'];
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

exports.isServerTimestamp = function isServerTimestamp (data) {
  return _.isObject(data) && data['.sv'] === 'timestamp';
};

function isInt(n){
  return /^-?\d+$/.test(n);
}

function orderByKey(ref1, ref2) {
  var key1 = ref1.key();
  var key2 = ref2.key();

  var isN1 = isInt(key1);
  var isN2 = isInt(key2);
  if (isN1 || isN2) {
    if (isN1 && isN2) {
      key1 = parseInt(key1);
      key2 = parseInt(key2);
    }
    else if (isN1) {
      return -1;
    }
    else {
      return 1;
    }
  }

  if (key1 === key2) return 0;
  return key1 < key2 ? -1 : 1;
}
exports.orderByKeyComparator = orderByKey;

exports.orderByPriorityComparator = function(ref1, ref2){
  var comp = exports.priorityComparator(ref1.priority,ref2.priority);
  return comp === 0 ? orderByKey(ref1,ref2) : comp;
};

function rank(val){
  if(val === null) return 1;
  if(val === false) return 2;
  if(val === true) return 3;
  if(_.isNumber(val)) return 4;
  if(_.isString(val)) return 5;
  return 6;
}

exports.orderByChildComparator = function(child){
  return function(ref1,ref2){
    var val1 = ref1.child(child).getData();
    var val2 = ref2.child(child).getData();
    if(val1 === val2) return orderByKey(ref1, ref2);
    var rank1 = rank(val1);
    var rank2 = rank(val2);
    if(rank1 != rank2){
      return rank1 > rank2 ? 1 : -1;
    }
    if(rank1 === 6) return orderByKey(ref1, ref2);
    return val1 > val2 ? 1 : -1;
  };
};
