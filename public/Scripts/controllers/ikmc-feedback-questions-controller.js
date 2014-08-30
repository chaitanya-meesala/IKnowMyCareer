ikmcControllersModule.controller('feedbackController',['$scope','$rootScope','feedbackService','$log',function($scope,$rootScope,feedbackService,$log){

   $scope.init = function(){
    feedbackService.getFeedbackQuestionsData().then(function(success){
        for(var i= 0;i<success.data.feedbackQuestionsData.length;i++){
           if(success.data.feedbackQuestionsData[i].options!=null){
               for(var j=0; j<success.data.feedbackQuestionsData[i].options.length;j++){
                   success.data.feedbackQuestionsData[i].options[j] =  $rootScope.ikmcStringFormatting(success.data.feedbackQuestionsData[i].options[j]);
               }
           }
        }
        $log.info(success.data.feedbackQuestionsData);
        $scope.questions = success.data.feedbackQuestionsData;
    },function(error){
    });
   }

   $scope.submit = function(){
        $log.info($scope.questions);
    }

}]);
