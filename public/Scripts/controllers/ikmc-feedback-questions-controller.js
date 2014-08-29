ikmcControllersModule.controller('feedbackController',['$scope',function($scope){

    $scope.questions = [{description:'what is your description ',type:'MULTIPLE',options:{one:'John',two:'Wan',three:'New',four:'Man'}},
    {description:'what is your pet  description ',type:'SELECT',options:{one:'billi',two:'pill',three:'lwo',four:'lll'}},
        {description:'Is this game play?',type:'ShortAnswer',options:{}}];

    $scope.question={description:'1',id:'Q1'};
    $scope.question1={description:'2',id:'Q2'};
}]);
