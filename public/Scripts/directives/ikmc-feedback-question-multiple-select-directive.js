/**
 * Created by srini on 8/9/2014.
 */
ikmcDirectivessModule.directive('multipleSelect',function(){
    return {
        restrict: 'E',
        scope: {
            question: '=question'
        },
        templateUrl: 'Templates/ikmc-feedback-question-multiple-select.html'
    };
});