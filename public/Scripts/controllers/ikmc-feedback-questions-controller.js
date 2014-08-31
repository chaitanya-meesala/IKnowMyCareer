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
        $scope.questions = success.data.feedbackQuestionsData;
    },function(error){
    });
   }

   $scope.submitFeedback = function(){

        var companyName = $scope.questions[1].answer;
       feedbackService.postFeedbackAnswers($scope.questions,companyName).then(
           function(success){
               if(success.data.internalStatusCode == 1000){
                   alert("Your feedback has been submitted successfully");
               }else{
                   alert(success.data.errorMessage);
               }
           },function(error){
               alert("Unable to process your request");
           }
       );

    }

}]);
