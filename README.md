MockFirebase
============

*This is an experimental library and is not supported by Firebase*

## Casetext Fork

Casetext's fork of mockfirebase has the following improvements over the latest upstream branch:
 * It allows storing of the value `false`
 * It uses updated versions of some dependencies whose old versions are not compatible with at least Node 4.2.x
 * The snapshot passed to a `ref.transaction()` callback will be a snapshot of the post-transaction data, not merely what the update function returned. Specifically, if the transaction update function sets a timestamp using `ServerValue.TIMESTAMP`, the snapshot will have the actual timestamp in it instead of just the tombstone value.
 * It supports deep updates, including deep updates with priority.

## Setup

### Node/Browserify

```bash
$ npm install mockfirebase
```

```js
var MockFirebase = require('mockfirebase').MockFirebase;
```

### AMD/Browser

```bash
$ bower install mockfirebase
```

```html
<script src="./bower_components/mockfirebase/browser/mockfirebase.js"></script>
```

## API

MockFirebase supports the normal [Firebase API](https://www.firebase.com/docs/web/api/) plus a small set of utility methods documented fully in the [API Reference](API.md). Rather than make a server call that is actually asynchronous, MockFirebase allow you to either trigger callbacks synchronously or asynchronously with a specified delay ([`ref.flush`](API.md#flushdelay---ref)).

## Tutorials

* [Basic](tutorials/basic.md)
* [Authentication](tutorials/authentication.md)
* [Simulating Errors](tutorials/errors.md)
* [Overriding `window.Firebase`](tutorials/override.md)
* [Overriding `require('firebase')`](tutorials/proxyquire.md)
