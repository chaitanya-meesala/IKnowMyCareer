ikmcControllersModule.controller('mainController',['$scope','$rootScope','$location','$window',
    '$log',function($scope,$rootScope,$location,$window,$log){

    $scope.isLoginRelatedPage = true;


        $rootScope.firstName = $window.sessionStorage.firstName;
        $rootScope.lastName = $window.sessionStorage.lastName;
        $rootScope.username = $window.sessionStorage.username;
        $rootScope.isUserAuthenticated = $window.sessionStorage.isUserAuthenticated;

    $rootScope.$on('$routeChangeStart', function (event, next) {

       /* if (!$rootScope.isUserAuthenticated && !!next.isLoginRequired ) {
            $location.path('/');
        }*/
        if(next.isLoginRequired){
            $scope.isLoginRelatedPage = false;
        }else{
            $scope.isLoginRelatedPage = true;
        }
    });


     $rootScope.capitalizeFirstLetter = function(str){
         return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
     }

        $rootScope.ikmcStringFormatting = function(str){
            var temp = str.trim().split('_');
            var result = "";
           for(var i=0; i<temp.length-1;i++){
                result += $rootScope.capitalizeFirstLetter(temp[i]) + " ";
            }
            return result + $rootScope.capitalizeFirstLetter(temp[i]);
        }


}]);