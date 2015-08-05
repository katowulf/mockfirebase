# Tutorial: Testing Angular Fire Using MockFireBase

MockFirebase can be used to test both `$firebaseArray` and `$firebaseObject`.
Below are code snippets of how you'd go  about it.



Here we have our simple controller. Some of the code is better placed in a service.
I will leave you to work on refactoring that. We are going to use both $firebaseObject
and $firebaseArray to save and read some data on firebase.

Our test will simply:
1. For the write operation, our tests will check if some data has actually been "written" to
firebase.
2. For the read operation, we will use our tests to "write" some data that we later read in
our controller.

## FirebaseObject


### Testing reads
```js
angular.module("firebase.app", ["firebase"])

.controller("firebase.app.controller",
["$scope","$firebaseObject", function($scope, $firebaseObject){

    var ref = new Firebase("https://myurl.firebaseio.com/somechild");
    $scope.obj = $firebaseObject(ref);
}]);
```
Test

``` js
describe("Unit Tests:", function (){
    window.MockFirebase.override();

    var firebase_ref, scope;

    beforeEach(function (){
        module("firebase.app")
        inject(["$scope", "$controller", "$firebaseObject"
        function ($scope, $controller, $firebaseObject){
            scope = $scope;

            var ctrl_data = {
                $scope: scope,
                $firebaseObject: $firebaseObject
            };

            $controller("firebase.app.controller", ctrl_data);

            //Mockfirebase doesnt support angular directly so we need to go crazy
            //on the bare bones javascript implementation of firebase
            firebase_ref = new Firebase("https://myurl.firebaseio.com/somechild");
        }]);

        it("should read data from firebase", function (){
            //save some data that our controller will read
            var student = {
                "name":"John Doe",
                "studentNo":"P15/8293/2015"
            };

            firebase_ref.set(student);
            firebase.flush()
            scope.$digest;

            expect(scope.obj).toBe(student);

        });

    });
});

```

### Testing writes


```js
angular.module("firebase.app", ["firebase"])

.controller("firebase.app.controller",
["$scope","$firebaseObject", function($scope, $firebaseObject){

    //an object we are to save
    var student = {
        "name":"John Doe",
        "studentNo":"P15/8293/2015"
    };

    var ref = new Firebase("https://myurl.firebaseio.com/somechild");
    $scope.obj = $firebaseObject(ref);
    $scope.obj.name = student.name;
    $scope.obj.studentNo = student.studentNO
    $scope.obj.$save();

}]);
```
Test

``` js
describe("Unit Tests:", function (){
    window.MockFirebase.override();

    var firebase_ref, scope;

    beforeEach(function (){
        module("firebase.app")
        inject(["$scope", "$controller", "$firebaseObject"
        function ($scope, $controller, $firebaseObject){
            scope = $scope;

            var ctrl_data = {
                $scope: scope,
                $firebaseObject: $firebaseObject
            };

            $controller("firebase.app.controller", ctrl_data);

            //Mockfirebase doesnt support angular directly so we need to go crazy
            //on the bare bones javascript implementation of firebase
            firebase_ref = new Firebase("https://myurl.firebaseio.com/somechild");
        }]);

        it("should save data to firebase", function (){

            firebase_ref.on("value", function (data) {
                response = data.val();
            });

            firebase_ref.flush();
            scope.$digest();

            var keys = _.keys(response); //underscorejs
            expect(keys.length).toEqual(1);

        });

    });
});

```

## FirebaseArray

### Testing reads

```js
angular.module("firebase.app", ["firebase"])

.controller("firebase.app.controller",
["$scope","$firebaseArray", function($scope, $firebaseArray){

    var ref = new Firebase("https://myurl.firebaseio.com/somechild");
    $scope.obj = $firebaseArray(ref);

}]);
```
This is how to test the controller above.

``` js
describe("Unit Tests:", function (){
    window.MockFirebase.override();

    var firebase_ref, scope;

    beforeEach(function (){
        module("firebase.app")
        inject(["$scope", "$controller", "$firebaseArray"
        function ($scope, $controller, $firebaseArray){
            scope = $scope;

            var ctrl_data = {
                $scope: scope,
                $firebaseArray: $firebaseArray
            };

            $controller("firebase.app.controller", ctrl_data);

            //Mockfirebase doesnt support angular directly so we need to go crazy
            //on the bare bones javascript implementation of firebase
            firebase_ref = new Firebase("https://myurl.firebaseio.com/somechild");
        }]);

        it("should read data from firebase", function (){
            //save some data that our controller will read
            var student = {
                "name":"John Doe",
                "studentNo":"P15/8293/2015"
            };

            firebase_ref.push(student);
            firebase.flush()
            scope.$digest;

            expect(scope.obj).toBe(student);

        });

    });
});

```

### Testing writes

```js
angular.module("firebase.app", ["firebase"])

.controller("firebase.app.controller",
["$scope","$firebaseArray", function($scope, $firebaseArray){

    //an object we are to save
    var student = {
        "name":"John Doe",
        "studentNo":"P15/8293/2015"
    };

    var ref = new Firebase("https://myurl.firebaseio.com/somechild");
    var obj = $firebaseArray(ref);
    obj.$add(student);

}]);
```

Test

``` js
describe("Unit Tests:", function (){
    window.MockFirebase.override();

    var firebase_ref, scope;

    beforeEach(function (){
        module("firebase.app")
        inject(["$scope", "$controller", "$firebaseArray"
        function ($scope, $controller, $firebaseArray){
            scope = $scope;

            var ctrl_data = {
                $scope: scope,
                $firebaseArray: $firebaseArray
            };

            $controller("firebase.app.controller", ctrl_data);

            //Mockfirebase doesnt support angular directly so we need to go crazy
            //on the bare bones javascript implementation of firebase
            firebase_ref = new Firebase("https://myurl.firebaseio.com/somechild");
        }]);

        it("should save data to firebase", function (){

            firebase_ref.on("value", function (data) {
                response = data.val();
            });

            firebase_ref.flush();
            scope.$digest();

            var keys = _.keys(response); //underscorejs
            expect(keys.length).toEqual(1);

        });

    });
});

```