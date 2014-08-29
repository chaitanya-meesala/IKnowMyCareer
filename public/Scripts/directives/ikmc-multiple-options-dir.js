/**
 * Created by srini on 8/9/2014.
 */
ikmcDirectivessModule.directive('myDir',function(){
    return {
        restrict: 'E',
        scope: {
            customerInfo: '=info'
        },
        templateUrl: 'Partials/my-dir.html'
    };
});