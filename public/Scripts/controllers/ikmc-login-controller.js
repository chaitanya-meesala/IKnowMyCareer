ikmcControllersModule.controller('loginController',['$scope','$rootScope','$location','authenticationService','$log','$window',function($scope,$rootScope,$location,authenticationService,$log,$window){
    $scope.loginCredentials = {username: null, password: null};
    $scope.carouselControls = {
      slideInterval: 5000,
      slides: [
          { data: "LoginCarouselTemplates/KnowAboutACompany.html" },
          { data: "LoginCarouselTemplates/InDepthKnowledge.html" },
          { data: "LoginCarouselTemplates/Experiences.html" },
          { data: "LoginCarouselTemplates/Companies.html" }
          /*{ data: "LoginCarouselTemplates/KnowAboutACompany.html" }*/
      ]
    };
   $rootScope.goToView = function(view){
        $location.path(view);
    };


    $scope.authenticationErrorFlag = false;

    $scope.logIn = function(){
        authenticationService.authenticateUser($scope.loginCredentials).then(function(success){
            $log.info(success.data);
            if(success.data.internalStatusCode == 1000){
                $rootScope.isUserAuthenticated = $window.sessionStorage.isUserAuthenticated = true;
                $window.sessionStorage.token = success.data.token;
                $rootScope.username = $window.sessionStorage.username = $scope.loginCredentials.username;
                $rootScope.firstName = $window.sessionStorage.firstName = success.data.userInformation.firstName;
                $rootScope.lastName = $window.sessionStorage.lastName = success.data.userInformation.lastName;
                $location.path('/feedback');
            }
            else{
                $scope.authenticationErrorFlag = true;
                alert("Wrong Credentials");
            }
        },function(error){
            $location.path('/error');
        });
    }
}]);