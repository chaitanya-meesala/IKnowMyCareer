/**
 * Created by srini on 8/9/2014.
 */
ikmcDirectivessModule.directive('multipleChoice',function(){
    return {
        restrict: 'E',
        scope: {
            question: '=question'
        },
        templateUrl: 'Templates/ikmc-feedback-question-multiple-choice.html'
    };
});