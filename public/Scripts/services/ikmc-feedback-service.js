ikmcServiceModule.service('feedbackService',['$http','$log','$window',function($http,$log,$window){

    this.getFeedbackQuestionsData = function(){
        var requestUrl = IKMC.Configuration["URLConfiguration"].serviceURL + '/getFeedbackQuestionsData';
        var request = {};
        $log.info(requestUrl);
        $log.info(request);
        return $http.post(requestUrl,request);
    }

    this.postFeedbackAnswers = function(questions,companyName){
        var requestUrl = IKMC.Configuration["URLConfiguration"].serviceURL+'/postFeedbackAnswersData';
        var request = {};
        request.username = $window.sessionStorage.username;
        request.companyName = companyName;
        request.feedbackAnswersData = [];
        for(var i=0;i<questions.length;i++){
            request.feedbackAnswersData.push({questionId: questions[i].Id, answer: questions[i].answer});
        }
        $log.info(requestUrl);
        $log.info(request);
        return $http.post(requestUrl,request);
    }

}]);