ikmcControllersModule.controller('feedbackController',['$scope','feedbackService','$log',function($scope,feedbackService,$log){

   $scope.init = function(){
    feedbackService.getFeedbackQuestionsData().then(function(success){
        var temp =  success.data.feedbackQuestionsData;
        $log.info(success.data.feedbackQuestionsData);
        $scope.questions = success.data.feedbackQuestionsData;
    },function(error){
    });
   }

   $scope.submit = function(){
        $log.info($scope.questions);
    }

}]);
