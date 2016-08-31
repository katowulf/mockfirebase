;(function (window) {
  'use strict';
  if (typeof window !== 'undefined' && window.mockfirebase) {
    window.MockFirebase = window.mockfirebase.MockFirebase;
    window.MockFirebaseSimpleLogin = window.mockfirebase.MockFirebaseSimpleLogin;

    var originals = false;
    window.MockFirebase.override = function () {
      originals = {
        firebase3: window.firebase,
        firebase: window.Firebase,
        login: window.FirebaseSimpleLogin
      };
      window.firebase = {
        database: function() {
          return {
            ref: function(path) {
              return new window.mockfirebase.MockFirebase(path);
            },
            refFromURL: function(url) {
              return new window.mockfirebase.MockFirebase(url);
            }
          };
        }
      };
      window.Firebase = window.mockfirebase.MockFirebase;
      window.FirebaseSimpleLogin = window.mockfirebase.MockFirebaseSimpleLogin;
    };
    window.MockFirebase.restore = function () {
      if (!originals) return;
      window.firebase = originals.firebase3;
      window.Firebase = originals.firebase;
      window.FirebaseSimpleLogin = originals.login;
    };
  }
})(window);
