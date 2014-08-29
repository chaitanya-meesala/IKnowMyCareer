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
            controller: 'loginController',
            isLoginRequired: false
        }).
        when('/register',{
            templateUrl: 'Partials/register.html',
            controller: 'registrationController',
            isLoginRequired: false
        }).
        when('/success',{
            templateUrl: 'Partials/success.html',
            controller: 'successController',
            isLoginRequired: false
        }).
        when('/error',{
            templateUrl: 'Partials/error.html',
            controller: 'errorController',
            isLoginRequired: false
        }).
        otherwise({
            redirectTo: '/'
        });

}]);