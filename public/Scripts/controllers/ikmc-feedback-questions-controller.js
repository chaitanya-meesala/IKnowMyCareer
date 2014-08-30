ikmcControllersModule.controller('feedbackController',['$scope','feedbackService','$log',function($scope,feedbackService,$log){

  /*  $scope.questions = [{description:'what is your description ',type:'MULTIPLE_CHOICE',options:{one:'John',two:'Wan',three:'New',four:'Man'}},
    {description:'what is your pet  description ',type:'MULTI_SELECT',options:{one:'billi',two:'pill',three:'lwo',four:'lll'}},
        {description:'Is this game play?',type:'SHORT_ANSWER',options:{}}];

    $scope.question={description:'1',id:'Q1'};
    $scope.question1={description:'2',id:'Q2'};*/
    feedbackService.getFeedbackQuestionsData().then(function(success){
        $log.info(sucess.data);
        alert("Success");
    },function(error){

    });

}]);
