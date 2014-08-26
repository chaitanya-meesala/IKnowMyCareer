/**
 * Created by sudheerkumarmeesala on 7/29/14.
 */
var authenticationModule = angular.module('authenticationModule',[]);

authenticationModule.factory('authInterceptor',['$rootScope','$window',function($rootScope,$window){
    return {
        request: function(config){
            config.headers = config.headers || {};
            if($window.sessionStorage.token){
            config.headers.Authorization = 'Bearer '+ $window.sessionStorage.token;
            }
            return config;
        }
    };
}]);

authenticationModule.config(['$httpProvider',function($httpProvider){
    $httpProvider.interceptors.push('authInterceptor');
}]);


authenticationModule.controller('loginController',['$scope','$rootScope','$http','$window',function($scope,$rootScope,$http,$window){
    $scope.loginCredentials = {
        username: null,
        password: null
    };
    $scope.form ={
      username: null,
      password: null,
      firstName: null,
      lastName: null,
      emailId: null,
      phoneNumber: null,
      collegeName: null,
      departmentName: null
    };
    $scope.submit = function(){
        alert("Hi");
        $http.post('http://58.146.113.33:8080/login',$scope.loginCredentials).then(function(success){
            $window.sessionStorage.token = success.data.token;
            console.log(success);
            alert("Success: "+ success.data.token);
        },function(error){
            alert("Failure");
        });
    };

    $scope.register = function(){
        $http.post('http://58.146.113.33:8080/register',$scope.form).then(function(success){
            console.log(success.data);
            alert("Success");
        },function(error){
            console.log(error);
                alert("Error");
        });
    }

    $scope.getData = function(){
        $http.get('http://58.146.113.33:8080/api/getData').then(function(success){
            alert(success.data);
        },function(error){});;
    }

    $scope.getAdminData = function(){
        $http.get('http://58.146.113.33:8080/admin/getData').then(function(success){
            alert(success.data);
        },function(error){});;
    }

}]);