ikmcServiceModule.service('feedbackService',['$http','$log',function($http,$log){

    this.getFeedbackQuestionsData = function(){
        var requestUrl = IKMC.Configuration["URLConfiguration"].serviceURL + '/getFeedbackQuestionsData';
        var request = {};
        $log.info(requestUrl);
        $log.info(request);
        return $http.post(requestUrl,request);
    }

}]);