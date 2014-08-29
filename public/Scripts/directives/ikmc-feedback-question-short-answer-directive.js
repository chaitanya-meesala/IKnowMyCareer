ikmcDirectivessModule.directive('shortAnswer',function(){
    return {
        restrict: 'E',
        scope: {
            question: '=question'
        },
        templateUrl: 'Templates/ikmc-feedback-question-short-answer.html'
    };
});