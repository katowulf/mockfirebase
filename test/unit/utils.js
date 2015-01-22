'use strict';

var sinon               = require('sinon');
var expect              = require('chai').use(require('sinon-chai')).expect;
var Mock                = require('../../');
var Firebase            = Mock.MockFirebase;
var utils               = require('../../src/utils');

describe('utils',function(){
  describe('#orderByKey',function(){
    function testKeys(a,b,expected){
      it('"' + a + '","' + b + '" == ' + expected,function() {
        expect(compareKeys(a,b)).to.equal(expected);
      });
    }

    function compareKeys(a,b){
      var root = new Firebase();
      return utils.orderByKeyComparator(root.child(a),root.child(b));
    }

    describe('strings compared lexographically',function(){
      testKeys("a","a",0);
      testKeys("b","b",0);
      testKeys("b","a",1);
      testKeys("B","a",-1);
      testKeys("a","b",-1);
    });

    describe('numbers compared by numeric value',function(){
      testKeys("1","1",0);
      testKeys("2","2",0);
      testKeys("1","2",-1);
      testKeys("2","1",1);
      testKeys("2","12",-1);
      testKeys("12","2",1);
      testKeys("-2","-1",-1);
      testKeys("-1","-2",1);
      testKeys("-1","1",-1);
    });

    describe('numbers before strings',function(){
      testKeys("1","a",-1);
      testKeys("-1","a",-1);
      testKeys("a","1",1);
      testKeys("a","-1",1);
    });

    describe('scientific notation is considered a string',function(){
      testKeys("15e1","1",1);
      testKeys("-15e1","1",1);
    });

    describe('any spaces are considered strings',function(){
      testKeys(" 2","1",1);
      testKeys("2 ","1",1);
    });
  });

  describe('#orderByPriority', function(){
    function name(key,priority){
      if(typeof priority === 'string'){
        priority = '"' + priority + '"';
      }
      return key + '[' + priority + ']';
    }

    function testPriorities(key1,priority1,key2,priority2,expected){
      it(name(key1,priority1) + ', ' + name(key2,priority2) +' == ' + expected,function() {
        expect(comparePriorities(key1,priority1,key2,priority2)).to.equal(expected);
      });
    }

    function comparePriorities(key1,priority1,key2,priority2){
      var root = new Firebase();
      root.child(key1).setWithPriority('a',priority1);
      root.child(key2).setWithPriority('a',priority2);
      root.flush();
      return utils.orderByPriorityComparator(root.child(key1),root.child(key2));
    }

    describe('null priority comes before string or number', function () {
      testPriorities('a',null,'b',1,-1);
      testPriorities('a',1,'b',null,1);
      testPriorities('a',null,'b','z',-1);
      testPriorities('a','z','b',null,1);
    });

    describe('number priority comes before string', function () {
      testPriorities('a',1,'b','1',-1);
      testPriorities('a','1','b',1,1);
    });

    describe('numerical priorities are in ascending order',function(){
      testPriorities('a',1,'b',2,-1);
      testPriorities('b',1,'a',2,-1);
      testPriorities('a',2,'b',1,1);
      testPriorities('b',2,'a',1,1);
      testPriorities('a',1.5,'b',1,1);
      testPriorities('a',1,'b',1.5,-1);
      testPriorities('a',-2,'b',1,-1);
    });

    describe('string priorities are sorted lexicographically',function(){
      testPriorities('a','a','b','b',-1);
      testPriorities('a','b','b','a',1);
      testPriorities('a','a','b','B',1);
      testPriorities('a','B','b','a',-1);
    });

    describe('equal priorities are then sorted by key',function(){
      testPriorities('a',1,'b',1,-1);
      testPriorities('b',1,'a',1,1);
    });
  });

  describe('#orderByChild',function(){
    function name(child,key,val){
      if(typeof val === 'string'){
        val = '"' + val + '"';
      }
      return key + ':{' + child + ':' + val + '}';
    }

    function testByChild(child,key1,val1,key2,val2,expected){
      it(name(child,key1,val1) + ', ' + name(child,key2,val2) + ' == ' + expected, function(){
        expect(compareByChild(child,key1,val1,key2,val2)).to.equal(expected);
      });
    }

    function compareByChild(child,key1,val1,key2,val2){
      var root = new Firebase();
      var d1 = {};
      var d2 = {};
      d1[child] = val1;
      d2[child] = val2;
      root.child(key1).set(d1);
      root.child(key2).set(d2);
      root.flush();
      return utils.orderByChildComparator(child)(root.child(key1),root.child(key2));
    }

    describe('null comes before everything else',function(){
      testByChild('a','b',null,'c',false,-1);
      testByChild('b','b',false,'c',null,1);
      testByChild('c','b',null,'c',true,-1);
      testByChild('d','b',true,'c',null,1);
      testByChild('e','b',null,'c',3,-1);
      testByChild('f','b',3,'c',null,1);
      testByChild('g','b',null,'c','d',-1);
      testByChild('h','b','d','c',null,1);
      testByChild('i','b',null,'c',{d:true},-1);
      testByChild('j','b',{d:true},'c',null,1);
    });
    
    describe('false comes before true, numbers, strings and objects',function(){
      testByChild('a','b',false,'c',true,-1);
      testByChild('b','b',true,'c',false,1);
      testByChild('c','b',false,'c',3,-1);
      testByChild('d','b',3,'c',false,1);
      testByChild('e','b',false,'c','d',-1);
      testByChild('f','b','d','c',false,1);
      testByChild('g','b',false,'c',{d:true},-1);
      testByChild('h','b',{d:true},'c',false,1);
    });
    
    describe('true comes before numbers, strings, and objects',function(){
      testByChild('a','b',true,'c',3,-1);
      testByChild('b','b',3,'c',true,1);
      testByChild('c','b',true,'c','d',-1);
      testByChild('d','b','d','c',true,1);
      testByChild('e','b',true,'c',{d:true},-1);
      testByChild('f','b',{d:true},'c',true,1);
    });
    
    describe('numbers come before strings and bojects',function(){
      testByChild('a','b',3,'c','d',-1);
      testByChild('b','b','d','c',3,1);
      testByChild('c','b',3,'c',{d:true},-1);
      testByChild('d','b',{d:true},'c',3,1);
    });

    describe('strings come before objects',function(){
      testByChild('a','b','3','c',{d:true},-1);
      testByChild('b','b',{d:true},'c','3',1);
    });

    describe('equal values and values of type object are ordered by key',function(){
      testByChild('a','b',null,'c',null,-1);
      testByChild('b','c',null,'b',null,1);
      testByChild('c','b',false,'c',false,-1);
      testByChild('d','c',false,'b',false,1);
      testByChild('e','b',true,'c',true,-1);
      testByChild('f','c',true,'b',true,1);
      testByChild('g','b',3,'c',3,-1);
      testByChild('h','c',3,'b',3,1);
      testByChild('i','b','d','c','d',-1);
      testByChild('j','c','d','b','d',1);
      testByChild('k','b',{d:true},'c',{e:false},-1);
      testByChild('l','c',{d:true},'b',{e:false},1);
    });

    describe('numbers and string values are ordered',function(){
      testByChild('a','b',1,'c',2,-1);
      testByChild('b','b',2,'c',1,1);
      testByChild('a','b','a','c','b',-1);
      testByChild('b','b','b','c','a',1);
    });
  });
});