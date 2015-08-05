# Tutorial: Testing AngularFire Using MockFireBase

MockFirebase can be used to test both `$firebaseArray` and `$firebaseObject`.
Below are code snippets of how you'd go  about it.



Here we have our simple controller. Some of the code is better placed in a service.
I will leave you to work on refactoring that. We are going to use both $firebaseObject
and $firebaseArray to save and read some data on firebase.

Our test will simply:

1. For the write operation, our tests will check if some data has actually been "written" to
firebase.
2. For the read operation, we will use our tests to "write" some data that we later read and store
it in our controller's scope.

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

    var firebaseRef, scope;

    beforeEach(function (){
        module("firebase.app")
        inject(["$scope", "$controller", "$firebaseObject"
        function ($scope, $controller, $firebaseObject){
            scope = $scope;

            var ctrlData = {
                $scope: scope,
                $firebaseObject: $firebaseObject
            };

            $controller("firebase.app.controller", ctrlData);

            //the url used here must be the same as the one used on the controller
            firebaseRef = new Firebase("https://myurl.firebaseio.com/somechild");
        }]);

        it("should read data from firebase", function (){
            //save some data that our controller will read
            var student = {
                "name":"John Doe",
                "studentNo":"P15/8293/2015"
            };

            firebaseRef.set(student);
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

    var firebaseRef, scope;

    beforeEach(function (){
        module("firebase.app")
        inject(["$scope", "$controller", "$firebaseObject"
        function ($scope, $controller, $firebaseObject){
            scope = $scope;

            var ctrlData = {
                $scope: scope,
                $firebaseObject: $firebaseObject
            };

            $controller("firebase.app.controller", ctrlData);

            //the url used here must be the same as the one used on the controller
            firebaseRef = new Firebase("https://myurl.firebaseio.com/somechild");
        }]);

        it("should save data to firebase", function (){

            var response;

            firebaseRef.on("value", function (data) {
                response = data.val();
            });

            firebaseRef.flush();
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

    var firebaseRef, scope;

    beforeEach(function (){
        module("firebase.app")
        inject(["$scope", "$controller", "$firebaseArray"
        function ($scope, $controller, $firebaseArray){
            scope = $scope;

            var ctrlData = {
                $scope: scope,
                $firebaseArray: $firebaseArray
            };

            $controller("firebase.app.controller", ctrlData);

            //the url used here must be the same as the one used on the controller
            firebaseRef = new Firebase("https://myurl.firebaseio.com/somechild");
        }]);

        it("should read data from firebase", function (){
            //save some data that our controller will read
            var student = {
                "name":"John Doe",
                "studentNo":"P15/8293/2015"
            };

            firebaseRef.push(student);
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

    var firebaseRef, scope;

    beforeEach(function (){
        module("firebase.app")
        inject(["$scope", "$controller", "$firebaseArray"
        function ($scope, $controller, $firebaseArray){
            scope = $scope;

            var ctrlData = {
                $scope: scope,
                $firebaseArray: $firebaseArray
            };

            $controller("firebase.app.controller", ctrlData);
            //the url used here must be the same as the one used on the controller
            firebaseRef = new Firebase("https://myurl.firebaseio.com/somechild");
        }]);

        it("should save data to firebase", function (){
            var response;

            firebaseRef.on("value", function (data) {
                response = data.val();
            });

            firebaseRef.flush();
            scope.$digest();

            var keys = _.keys(response); //underscorejs
            expect(keys.length).toEqual(1);

        });

    });
});

```