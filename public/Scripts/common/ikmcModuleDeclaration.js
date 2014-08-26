/**
 * Created by sudheerkumarmeesala on 8/11/14.
 */
var ikmcApp = angular.module('ikmcApp',['ngRoute','ikmcControllersModule']);

ikmcApp.config(['$httpProvider',function($httpProvider){
    $httpProvider.interceptors.push('authInterceptor');
}]);


ikmcApp.config(['$routeProvider',function($routeProvider){

    $routeProvider.
        when('/',{
            templateUrl: 'Partials/login.html',
            controller: 'loginController'
        }).
        when('/register',{
            templateUrl: 'Partials/register.html',
            controller: 'registrationController'
        }).
        when('/success',{
            templateUrl: 'Partials/success.html',
            controller: 'successController'
        }).
        when('/error',{
            templateUrl: 'Partials/error.html',
            controller: 'errorController'
        }).
        otherwise({
            redirectTo: '/'
        });

}]);