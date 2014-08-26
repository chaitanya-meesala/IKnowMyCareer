ikmcControllersModule.controller('loginController',['$scope','$rootScope','$location',function($scope,$rootScope,$location){
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
    }
}]);