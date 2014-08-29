ikmcDirectivessModule.directive('shortAnswer',function(){
    return {
        restrict: 'E',
        scope: {
            customerInfo: '=info'
        },
        templateUrl: 'Partials/short-answer.html'
    };
});