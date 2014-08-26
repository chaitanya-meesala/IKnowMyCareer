ikmcControllersModule.controller('registrationController',['$scope','$rootScope','$log','$location',
    'authenticationService',function($scope,$rootScope,$log,$location,authenticationService){
    $scope.form ={
        username: null,
        password: null,
        confirmPassword: null,
        firstName: null,
        lastName: null,
        emailId: null,
        collegeName: null,
        departmentName: null
    };

    $scope.regularExpressions = {
        USERNAME_REGEX: /^[a-zA-Z0-9_-]{6,30}$/,
        PASSWORD_REGEX: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\-\+\?\*\$\[\]\^\.\(\)\|`~!@#%&_ ={}:;',])[a-zA-Z0-9\-\+\?\*\$\[\]\^\.\(\)\|`~!@#%&_ ={}:;',]{8,128}$/
    };

    $scope.isUsernameFormatWrong = false;
    $scope.isPasswordFormatWrong = false;
    $scope.isPasswordNotVerified = false;
    $scope.isUsernameAlreadyExists = false;
    $scope.isEmailAlreadyExists = false;

    $scope.errorState = false;

    $scope.register = function(){
        if( !!$scope.form.username && !!$scope.form.password && !!$scope.form.confirmPassword &&
            !!$scope.form.firstName && !!$scope.form.lastName && !!$scope.form.emailId &&
            !$scope.isUsernameFormatWrong && !$scope.isPasswordFormatWrong &&
            !$scope.isPasswordNotVerified && !$scope.isUsernameAlreadyExists && !$scope.isEmailAlreadyExists){
        authenticationService.registerUser($scope.form).then(function(success){
            $log.info(success.data);
            if(success.data.internalStatusCode != 1000){
                $scope.errorMessage = success.data.errorMessage;
                $scope.errorState = true;
            }else{
                $location.path('success');
            }
        },function(error){
                $location.path('error');
        });
        }
    }


    $scope.usernameFieldBlurEvent = function(){
        if( !!$scope.form.username && !$scope.regularExpressions.USERNAME_REGEX.test($scope.form.username)){
            $scope.isUsernameFormatWrong = true;
        }else{
            $scope.isUsernameFormatWrong = false;
            authenticationService.checkForUsername($scope.form.username).then(function(success){
                if(success.data.internalStatusCode == 1000){
                    if(success.data.isUsernameExists){
                       $scope.isUsernameAlreadyExists = true;
                    }else{
                        $scope.isUsernameAlreadyExists = false;
                    }
                }
            },function(error){});
        }
    };

    $scope.usernameFieldFocusEvent = function(){
      $scope.isUsernameAlreadyExists = false;
    };


        $scope.emailIdFieldBlurEvent = function(){
            if(!!$scope.form.emailId){
                authenticationService.checkForEmailId($scope.form.emailId).then(function(success){

                    $log.info(success.data);

                    if(success.data.internalStatusCode == 1000){
                        if(success.data.isEmailIdExists){
                            $scope.isEmailAlreadyExists = true;
                        }else{
                            $scope.isEmailAlreadyExists = false;
                        }
                    }
                },function(error){});
            }

        };

        $scope.emailIdFieldFieldFocusEvent = function(){
            $scope.isEmailAlreadyExists = false;
        };

    $scope.$watch('form.username',function(oldValue,newValue){
        if($scope.regularExpressions.USERNAME_REGEX.test($scope.form.username)){
            $scope.isUsernameFormatWrong = false;
        }
    });

    $scope.passwordFieldBlurEvent = function(){
        if( !!$scope.form.password && !$scope.regularExpressions.PASSWORD_REGEX.test($scope.form.password)){
            $scope.isPasswordFormatWrong = true;
        }else{
            $scope.isPasswordFormatWrong = false;
        }
    }

    $scope.$watch('form.password',function(oldValue,newValue){
        if($scope.regularExpressions.PASSWORD_REGEX.test($scope.form.password)){
            $scope.isPasswordFormatWrong = false;
        }
    });

    $scope.confirmPasswordFieldBlurEvent = function(){
        if($scope.form.password !== $scope.form.confirmPassword){
            $scope.isPasswordNotVerified = true;
        }else{
            $scope.isPasswordNotVerified = false;
        }
    }

    $scope.$watch('form.confirmPassword',function(oldValue,newValue){
        if($scope.form.password === $scope.form.confirmPassword){
            $scope.isPasswordNotVerified = false;
        }
    });




}]);