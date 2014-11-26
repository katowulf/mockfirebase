'use strict';

var sinon    = require('sinon');
var _        = require('lodash');
var expect   = require('chai').use(require('sinon-chai')).expect;
var Firebase = require('../../').MockFirebase;
var utils    = require('../../src/utils');

describe('utils', function () {

  var fb;
  beforeEach(function () {
    fb = new Firebase().child('data');
  });

  describe('#makeSnap', function () {

    var snapshot;
    describe('of string primitive with no priority', function () {

      beforeEach(function () {
        var data = 'foo';
        var priority;
        snapshot = utils.makeSnap(fb, data, priority);
      });

      describe('#val', function () {

        it('should return data', function () {
          expect(snapshot.val()).to.equal('foo');
        });

      });

      describe('#ref', function () {

        it('should return a firebase object', function () {
          expect(snapshot.ref()).to.be.instanceOf(Firebase);
        });

      });

      describe('#key', function () {

        it('should return key of given firebase object', function () {
          expect(snapshot.key()).to.equal('data');
        });

      });

      describe('#getPriority', function () {

        it('should return undefined', function () {
          expect(snapshot.getPriority()).to.be.an('undefined');
        });

      });

      describe('#forEach', function () {

        it('should not invoke callback', function () {
          var spy = sinon.spy();
          snapshot.forEach(spy);
          expect(spy).not.called;
        });

      });

      describe('#hasChild', function () {

        it('should be false', function () {
          expect(snapshot.hasChild('bar')).to.be.false;
        });

      });

      describe('#hasChildren', function () {

        it('should be false', function () {
          expect(snapshot.hasChildren()).to.be.false;
        });

      });

      describe('#numChildren', function () {

        it('should be zero', function () {
          expect(snapshot.numChildren()).to.equal(0);
        });

      });

      describe('#exportVal', function () {

        it('should be just the original primitive', function () {
          expect(snapshot.exportVal()).to.equal('foo');
        });

      });

    });

    describe('of numeric primitive with priority', function () {

      beforeEach(function () {
        var data = 5;
        var priority = 2;
        snapshot = utils.makeSnap(fb, data, priority);
      });

      describe('#getPriority', function () {

        it('should return given priority', function () {
          expect(snapshot.getPriority()).to.equal(2);
        });

      });

      describe('#numChildren', function () {

        it('should be zero', function () {
          expect(snapshot.numChildren()).to.equal(0);
        });

      });

      describe('#exportVal', function () {

        it('should return object with value and priority', function () {
          var exportedVal = snapshot.exportVal();
          expect(exportedVal).to.have.property('.priority', 2);
          expect(exportedVal).to.have.property('.value', 5);
        });

      });

    });

    describe('of object with priority', function () {

      beforeEach(function () {
        var data = {
          'alpha': 'foo',
          'bravo': 10,
          'charlie': {
            'bar': 'baz'
          }
        };
        var priority = '3';
        snapshot = utils.makeSnap(fb, data, priority);
      });

      describe('#getPriority', function () {

        it('should return given priority', function () {
          expect(snapshot.getPriority()).to.equal('3');
        });

      });

      describe('#hasChild', function () {

        it('should be true for valid key', function () {
          expect(snapshot.hasChild('alpha')).to.be.true;
        });

        it('should be false for invalid key', function () {
          expect(snapshot.hasChild('sierra')).to.be.false;
        });

      });

      describe('#hasChildren', function () {

        it('should be true', function () {
          expect(snapshot.hasChildren()).to.be.true;
        });

      });

      describe('#numChildren', function () {

        it('should be equal to number of entries in data', function () {
          expect(snapshot.numChildren()).to.equal(3);
        });

      });

      describe('#exportVal', function () {

        it('should return object with value and priority', function () {
          var exportedVal = snapshot.exportVal();
          expect(exportedVal).to.have.property('.priority', '3');
          expect(exportedVal).to.have.property('alpha', 'foo');
          expect(exportedVal).to.have.property('bravo', 10);
          expect(exportedVal).to.have.deep.property('charlie.bar', 'baz');
        });

      });

    });

  });

});
