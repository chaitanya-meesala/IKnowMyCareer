ikmcControllersModule.controller('feedbackController',['$scope',function($scope){

    $scope.questions = [{name:'what is your name ',type:'MULTIPLE',options:{one:'John',two:'Wan',three:'New',four:'Man'}},
    {name:'what is your pet  name ',type:'SELECT',options:{one:'billi',two:'pill',three:'lwo',four:'lll'}},
        {name:'Is this game play?',type:'ShortAnswer',options:{}}];

    $scope.question={name:'1',id:'Q1'};
    $scope.question1={name:'2',id:'Q2'};
}]);
