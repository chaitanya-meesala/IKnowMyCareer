/**
 * Created by srini on 8/9/2014.
 */
ikmcDirectivessModule.directive('multipleSelect',function(){
    return {
        restrict: 'E',
        scope: {
            customerInfo: '=info'
        },
        templateUrl: 'Partials/multiple-select.html'
    };
});