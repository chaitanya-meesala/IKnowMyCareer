ikmcControllersModule.controller('mainController',['$scope','$rootScope','$location',
    '$log',function($scope,$rootScope,$location,$log){

    $scope.isLoginRelatedPage = true;

    $rootScope.$on('$routeChangeStart', function (event, next) {
        var userAuthenticated = $rootScope.isUserAuthenticated;

        if (!userAuthenticated && !!next.isLoginRequired ) {
            $location.path('/');
        }
        if(next.isLoginRequired){
            $scope.isLoginRelatedPage = false;
        }else{
            $scope.isLoginRelatedPage = true;
        }
    });

}]);