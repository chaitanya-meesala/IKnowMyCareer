IKMC.RequestObjects = {};

IKMC.RequestObjects.UserRegistrationData = function(data){
    this.username = data.username;
    this.password = data.password;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.emailId = data.emailId;
    this.phoneNumber = data.phoneNumber;
    this.collegeName = data.collegeName;
    this.departmentName = data.departmentName;
}

IKMC.RequestObjects.AuthenticateUser = function(data){
    this.username = data.username;
    this.password = data.password;
}