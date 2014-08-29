ikmcServiceModule.service('authenticationService',['$http','$log',function($http,$log){

    this.authenticateUser = function(data){
        var requestUrl = IKMC.Configuration["URLConfiguration"].serviceURL + '/login';
        var request = new IKMC.RequestObjects.AuthenticateUser(data);
        $log.info(requestUrl);
        $log.info(request);
        return $http.post(requestUrl,request);
    };

    this.registerUser = function(formData){
         var requestUrl = IKMC.Configuration["URLConfiguration"].serviceURL + '/register';
         var request = new IKMC.RequestObjects.UserRegistrationData(formData);
         $log.info(requestUrl);
         $log.info(request);
         return $http.post(requestUrl,request );
    };

    this.checkForUsername = function(username){
        var requestUrl = IKMC.Configuration["URLConfiguration"].serviceURL + '/checkforusername';
        var request = {username: username};
        $log.info(requestUrl);
        $log.info(request);
        return $http.post(requestUrl,request);
    };

    this.checkForEmailId = function(email){
        var requestUrl = IKMC.Configuration["URLConfiguration"].serviceURL + '/checkforemail';
        var request = { emailId : email };
        $log.info(requestUrl);
        $log.info(request);
        return $http.post(requestUrl,request);
    };

}]);