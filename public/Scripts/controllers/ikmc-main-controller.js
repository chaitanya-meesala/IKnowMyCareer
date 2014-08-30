ikmcControllersModule.controller('mainController',['$scope','$rootScope','$location',function($scope,$rootScope,$location){

    $scope.isLoginRelatedPage = true;

    $rootScope.$on('$routeChangeStart', function (event, next) {
        var userAuthenticated = $rootScope.isUserAuthenticated;
        if(next.isLoginRequired){
           $scope.isLoginRelatedPage = false;
        }
        if (!userAuthenticated && !!next.isLoginRequired ) {
            $location.path('/');
        }
    });

}]);