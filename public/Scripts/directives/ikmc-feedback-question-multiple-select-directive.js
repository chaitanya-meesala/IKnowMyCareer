/**
 * Created by srini on 8/9/2014.
 */
ikmcDirectivessModule.directive('multipleSelect',function(){
    return {
        restrict: 'E',
        scope: {
            question: '=question'
        },
        templateUrl: 'Templates/ikmc-feedback-question-multiple-select.html',
        controller: ['$scope',function($scope){
            $scope.question.answer = [];
            $scope.toggleSelection = function(option){
                var index = $scope.question.answer.indexOf(option);
                if(index > -1){
                    $scope.question.answer.splice(index,1);
                }else{
                    $scope.question.answer.push(option);
                }
            };
        }]
    };
});