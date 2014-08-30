//Importing Frameworks
var express = require('express');
var mysql = require('mysql');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var logger = require('winston');
var httpProxy = require('http-proxy');
var mailer = require('nodemailer');
var crypto = require('crypto-js');
var geoip = require('geoip-lite');
var http = require('http');
var Q = require('q');
var randTokenGenerator = require('rand-token');
var googleMapApi = require('googlemaps');
var useragent = require('useragent');

var secret = "7x7k^9K^+=sM5HHSAK";

var proxyUrl = 'http://58.146.113.237:8080';
/*var devServerUrl = 'http://dev-services.iknowmycareer.com';
var dev01ServerUrl = 'http://dev01-services.iknowmycareer.com';
var dev02ServerUrl = 'http://dev02-services.iknowmycareer.com';
var dev03ServerUrl = 'http://dev03-services.iknowmycareer.com';
var dev04ServerUrl = 'http://dev04-services.iknowmycareer.com';*/

var devServerUrl =   'http://58.146.113.237:7000';
var dev01ServerUrl = 'http://58.146.113.237:7001';
var dev02ServerUrl = 'http://58.146.113.237:7002';
var dev03ServerUrl = 'http://58.146.113.237:7003';
var dev04ServerUrl = 'http://58.146.113.237:7004';

var siteUrl = "http://iknowmycareer.com";

//Declaring Proxy Server
var proxy = httpProxy.createProxyServer({});


//Load Balancing - Create Application Instances on 5 Ports and round robin through that application Instances
/*var applicationInstancesAddresses = [
    {target: webServicePartialUrl + ':7000'},
    {target: webServicePartialUrl + ':7001'},
    {target: webServicePartialUrl + ':7002'},
    {target: webServicePartialUrl + ':7003'},
    {target: webServicePartialUrl + ':7004'}
];*/

var applicationInstancesAddresses = [
 { target: devServerUrl },
 { target: dev01ServerUrl },
 { target: dev02ServerUrl },
 { target: dev03ServerUrl },
 { target: dev04ServerUrl }
 ];


//Creating Proxy Server on Port 8080. Round Robin Load Balancing Strategy
http.createServer(function (request, response) {
    var targetApplicationInstance = applicationInstancesAddresses.shift();
    var ipaddress = request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || request.connection.socket.remoteAddress;
    request.headers['client-ip-address'] = ipaddress;
    proxy.web(request, response, targetApplicationInstance);
    applicationInstancesAddresses.push(targetApplicationInstance);
}).listen(8080);

//Declaring Collge To Corporate Application
var collegeToCorporateApp = express();
collegeToCorporateApp.use(bodyParser.json());

//Creating transport for mailing services
var mailTransport = mailer.createTransport({
    service: 'gmail',
    auth: {user: 'campustocorporateteam@gmail.com', pass: 's8tAhuSpUthamuPhAzEz'},
    debug: true
});


//Adding Filters 
collegeToCorporateApp.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type , Authorization");
    next();
});

//Filter to check access to admin services
function adminCheck(request, response, next) {

    if (request.headers.authorization != null) {
        var userDetails = jwt.decode(request.headers.authorization.toString().substring(7), secret);
        if (userDetails.authenticationDetails.userType === "ADMIN" || userDetails.authenticationDetails.userType === "FOUNDER") {
            next();
        } else {
            try {
                var geo = geoip.lookup(request.headers['client-ip-address']);
                googleMapApi.reverseGeocode(googleMapApi.checkAndConvertPoint([geo.ll[0], geo.ll[1]]), function (err, data) {
                    var errorDescription = "The normal user: " + userDetails.username + " - " + userDetails.firstName + " " + userDetails.lastName +
                        " tried to access admin services.\n  IP Address: " +
                        request.headers['client-ip-address'] + "\n Country: " + geo.country + ", Region: " + geo.region + ", City: " + geo.city +
                        ", Latitude: " + geo.ll[0] + ", Longitude: " + geo.ll[1] + " Location: " + data.results[0].formatted_address;
                    logger.error({errorDescription: errorDescription, username: userDetails.username, errorCode: AuthenticationModuleErrorCodes.ADMIN_SERVICES_RESTRICTED_ACCESS_ERRORCODE });
                });

            } catch (error) {
                var errorDescription = "The normal user: " + userDetails.username + " tried to access admin services";
                logger.error({errorDescription: errorDescription, username: userDetails.username, errorCode: AuthenticationModuleErrorCodes.ADMIN_SERVICES_RESTRICTED_ACCESS_ERRORCODE});
            }
            response.json({internalStatusCode: 422, errorMessage: 'User Dont Have Admin Previligers'});
        }
    } else {
        response.json({internalStatusCode: 421, errorMessage: 'User Not Authenticated'});
    }
}

//Filter to check access to founder services
function founderCheck(request, response, next) {
    if (request.headers.authorization != null) {
        var userDetails = jwt.decode(request.headers.authorization.toString().substring(7), secret);
        if (userDetails.authenticationDetails.userType === "FOUNDER") {
            next();
        } else {
            try {
                var geo = geoip.lookup(request.headers['client-ip-address']);
                googleMapApi.reverseGeocode(googleMapApi.checkAndConvertPoint([geo.ll[0], geo.ll[1]]), function (err, data) {
                    var errorDescription = "The normal user: " + userDetails.username + " - " + userDetails.firstName + " " + userDetails.lastName +
                        " tried to access founder services.\n  IP Address: " +
                        request.headers['client-ip-address'] + "\n Country: " + geo.country + ", Region: " + geo.region + ", City: " + geo.city +
                        ", Latitude: " + geo.ll[0] + ", Longitude: " + geo.ll[1] + " Location: " + data.results[0].formatted_address;
                    logger.error({errorDescription: errorDescription, username: userDetails.username, errorCode: AuthenticationModuleErrorCodes.FOUNDER_SERVICES_RESTRICTED_ACCESS_ERRORCODE });
                });
            } catch (error) {
                var errorDescription = "The normal user: " + userDetails.username + " tried to access founder services";
                logger.error({errorDescription: errorDescription, username: userDetails.username, errorCode: AuthenticationModuleErrorCodes.FOUNDER_SERVICES_RESTRICTED_ACCESS_ERRORCODE});
            }
            response.json({InternalStatusCode: 423, ErrorMessage: 'User Dont Have Founder Previligers'});
        }
    } else {
        response.json({InternalStatusCode: 421, ErrorMessage: 'User Not Authenticated'});
    }
}


collegeToCorporateApp.use(expressJwt({secret: secret}).unless({path: ['/admin/*', '/founders/*', '/login', '/register', '/emailvalidation', '/checkforusername', '/checkforemail','/getStatus']}));
collegeToCorporateApp.all("/admin/*", adminCheck, function (request, response, next) {
    next();
});
collegeToCorporateApp.all("/founders/*", founderCheck, function (request, response, next) {
    next();
});


logger.add(logger.transports.File, { filename: 'collegeToCorporateAppLogFile.log', level: 'warn' });

//Creating mysql database connection
var sqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'peacock',
    database: 'test'
});

//Connecting to Database
sqlConnection.connect(function (error) {
    if (error) {
        logger.error("Unable to Connect to Database" + error);
    }
    else {

    }
});


/* Authentication Module Starts Here*/

var AuthenticationModuleErrorCodes = {
    PASSWORD_DB_ERRORCODE: 2000,
    USERNAME_DOES_NOT_EXISTS_ERRORCODE: 2001,
    INCORRECTPASSWORD_ERRORCODE: 2002,
    USER_REGISTRATION_DETAILS_DB_ERRORCODE: 2003,
    USER_NOT_REGISTERED_ERRORCODE: 2004,
    USERNAME_MISSED_ENTRY_IN_AUTHENTICATION_TABLE_ERRORCODE: 2005,
    USER_DETAILS_DB_ERRORCODE: 2006,
    USERNAME_MISSED_ENTRY_IN_USER_DETAILS_TABLE_ERRORCODE: 2007,
    LOCKED_USER_TRIED_TO_LOGIN_ERRORCODE: 2008,
    USERNAME_CHECK_DB_ERRORCODE: 2009,
    EMAILID_CHECK_DB_ERRORCODE: 2010,
    MANDATORY_FIELDS_EMPTY_ERRORCODE: 2011,
    USERNAME_NOT_IN_VALID_FORMAT_ERRORCODE: 2012,
    PASSWORD_NOT_IN_VALID_FORMAT_ERRORCODE: 2013,
    FIRSTNAME_NOT_IN_VALID_FORMAT_ERRORCODE: 2014,
    LASTNAME_NOT_IN_VALID_FORMAT_ERRORCODE: 2015,
    PHONENUMBER_NOT_IN_VALID_FORMAT_ERRORCODE: 2016,
    COLLEGENAME_NOT_IN_VALID_FORMAT_ERRORCODE: 2017,
    DEPARTMENTNAME_NOT_IN_VALID_FORMAT_ERRORCODE: 2018,
    USERNAME_ALREADY_EXISTS_ERRORCODE: 2019,
    EMAILID_ALREADY_EXISTS_ERRORCODE: 2020,
    USER_CREDENTIALS_INSERT_DB_ERRORCODE: 2021,
    USER_DETAILS_INSERT_DB_ERRORCODE: 2022,
    USER_AUTHENTICATION_DETAILS_INSERT_DB_ERRORCODE: 2023,
    EMAIL_VERIFICATION_TOKEN_UPDATE_DB_ERRORCODE: 2024,
    UNABLE_TO_SEND_EMAIL_ERRORCODE: 2025,
    USER_REGISTRATION_ACCESS_TOKEN_DB_ERRORCODE: 2026,
    USER_MISSING_ACCESS_TOKEN_ERRORCODE: 2027,
    USER_EMAIL_ACCESS_TOKEN_VALID_ERRORCODE: 2028,
    USER_ACTIVITY_DB_ERRORCODE: 2029,
    UNABLE_TO_FIND_THE_LOCATION_FROM_IP_ERRORCODE: 2030,
    ADMIN_SERVICES_RESTRICTED_ACCESS_ERRORCODE: 2031,
    FOUNDER_SERVICES_RESTRICTED_ACCESS_ERRORCODE: 2032
};

var RegularExpressions = {
    USERNAME_REGEX: /^[a-z0-9_-]{6,30}$/,
    PASSWORD_REGEX: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\-\+\?\*\$\[\]\^\.\(\)\|`~!@#%&_ ={}:;',])[a-zA-Z0-9\-\+\?\*\$\[\]\^\.\(\)\|`~!@#%&_ ={}:;',]{8,128}$/,
    FIRSTNAME_REGEX: /^[a-zA-Z ,.'-]{3,20}$/,
    LASTNAME_REGEX: /^[a-zA-Z ,.'-]{3,20}$/,
    PHONENUMBER_REGEX: /^[0-9]{9,15}/,
    COLLEGENAME_REGEX: /^[a-zA-Z -].{3,100}$/,
    DEPARTMENTNAME_REGEX: /^[a-zA-Z -].{3,100}$/
};

var AuthenticateUserResponse = function () {
    this.internalStatusCode = null;
    this.errorMessage = null;
    this.userInformation = null;
    this.token = null;
};

var AuthenticateUserRequest = function (data) {
    this.username = data.username;
    this.password = data.password;
};

var UserDetailsObject = function () {
    this.username = null;
    this.emailId = null;
    this.firstName = null;
    this.lastName = null;
    this.phoneNumber = null;
    this.collegeName = null;
    this.departmentName = null;
    this.authenticationDetails = null;
}

var UserRegistrationData = function (data) {
    this.username = data.username;
    this.password = data.password;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.emailId = data.emailId;
    this.phoneNumber = data.phoneNumber;
    this.collegeName = data.collegeName;
    this.departmentName = data.departmentName;
}

var UserActivityObject = function () {
    this.username = null;
    this.ipAddress = null;
    this.geoLocation = null;
    this.browserFamily = null;
    this.browserVersion = null;
    this.deviceFamily = null;
    this.deviceVersion = null;
    this.operatingSystemFamily = null;
    this.operatingSystemVersion = null;
}


//Function to check the credentials and returns the Validation State

collegeToCorporateApp.get('/getStatus',function(request,response){
    response.json({status: "Site Up and Running"});
});

//Service for Log In
collegeToCorporateApp.post('/login', function (request, response) {

    var authenticateUserRequest = new AuthenticateUserRequest(request.body);
    var username = authenticateUserRequest.username;
    var password = authenticateUserRequest.password;

    authenticateUser(username, password).then(function (success) {
        response.json(success.authResponse);
        var agent = useragent.parse(request.headers['user-agent']);
        var userActivity = new UserActivityObject();
        userActivity.username = success.username;
        userActivity.ipAddress = request.headers["client-ip-address"];
        getGeoLocation(userActivity.ipAddress).then(function (success) {
            userActivity.geoLocation = success.geoLocation;
            userActivity.browserFamily = agent.family;
            userActivity.browserVersion = agent.toVersion();
            userActivity.operatingSystemFamily = agent.os.family;
            userActivity.operatingSystemVersion = agent.os.toVersion();
            userActivity.deviceFamily = agent.device.family;
            userActivity.deviceVersion = agent.device.toVersion();
            updateUserActivity(userActivity).then(null, null);
        }, function (error) {
            logger.error(error);
        });

    }, function (error) {
        response.json({internalStatusCode: error.errorCode, errorMessage: error.errorDescription});
    });
});

//Service for New User Registration
collegeToCorporateApp.post('/register', function (request, response) {
    registerNewUser(request.body).then(function (success) {
        response.json({internalStatusCode: 1000});
    }, function (error) {
        response.json({internalStatusCode: error.errorCode, errorMessage: error.errorDescription});
    });
});

//Service to validate the email address
collegeToCorporateApp.get('/emailvalidation', function (request, response) {
    var emailIdValidationToken = request.param('emailidvalidationtoken');
    var username = request.param('userid');
    var updateRegistrationStatusPromise = updateRegistrationStatus(username);
    getEmailIdAccessTokenValidity(username, emailIdValidationToken).then(updateRegistrationStatusPromise).then(function (success) {
        if (success.isEmailIdAccessTokenValid) {
            //response.json({internalStatusCode: 1000});
            response.redirect(siteUrl);
        } else {
            response.json({internalStatusCode: AuthenticationModuleErrorCodes.USER_EMAIL_ACCESS_TOKEN_VALID_ERRORCODE, errorMessage: "The access token is not valid"});
        }
    }, function (error) {
        response.json({internalStatusCode: error.errorCode, errorMessage: errorDescription});
    });
});

collegeToCorporateApp.post('/checkforusername', function (request, response) {
    checkForUsername(request.body.username).then(function (success) {
        response.json({internalStatusCode: 1000, username: success.username, isUsernameExists: success.isUsernameExists});
    }, function (error) {
        response.json({internalStatusCode: error.errorCode, errorMessage: error.errorDescription});
    });
});

collegeToCorporateApp.post('/checkforemail', function (request, response) {
    checkForEmailId(request.body.emailId).then(function (success) {
        response.json({internalStatusCode: 1000, emailId: success.emailId, isEmailIdExists: success.isEmailIdExists});
    }, function (error) {
        response.json({internalStatusCode: error.errorCode, errorMessage: error.errorDescription});
    });
});


var getGeoLocation = function (ipaddress) {

    var deferred = Q.defer();
    var geo = geoip.lookup(ipaddress);

    googleMapApi.reverseGeocode(googleMapApi.checkAndConvertPoint([geo.ll[0], geo.ll[1]]), function (error, data) {

        if (error) {

            var errorDescription = "Unable to find the location from ip address";
            var errorObject = {username: username, errorDescription: errorDescription, error: error, errorCode: AuthenticationModuleErrorCodes.UNABLE_TO_FIND_THE_LOCATION_FROM_IP_ERRORCODE};
            logger.error(errorObject);
            deferred.resolve({geoLocation: null});

        } else {
            deferred.resolve({geoLocation: data.results[0].formatted_address});
        }
    });
    return deferred.promise;

}

/*Registration Module Starts Here*/
var registerNewUser = function (data) {
    var deferred = Q.defer();
    var userRegistrationData = new UserRegistrationData(data);

    if (!userRegistrationData.username || !userRegistrationData.password || !userRegistrationData.firstName || !userRegistrationData.lastName || !userRegistrationData.emailId) {
        var errorDescription = "The Mandatory fields are not checked on UI side or some malicious activity going on";
        var errorObject = {errorCode: AuthenticationModuleErrorCodes.MANDATORY_FIELDS_EMPTY_ERRORCODE, errorDescription: errorDescription };
        logger.warn(errorObject);
        deferred.reject(errorObject);
    } else {

        if (!RegularExpressions.USERNAME_REGEX.test(userRegistrationData.username)) {
            var errorDescription = "Username not in valid format";
            var errorObject = {errorCode: AuthenticationModuleErrorCodes.USERNAME_NOT_IN_VALID_FORMAT_ERRORCODE, errorDescription: errorDescription};
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else if (!RegularExpressions.PASSWORD_REGEX.test(userRegistrationData.password)) {
            var errorDescription = "Password not in valid format";
            var errorObject = {errorCode: AuthenticationModuleErrorCodes.PASSWORD_NOT_IN_VALID_FORMAT_ERRORCODE, errorDescription: errorDescription};
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else if (!RegularExpressions.FIRSTNAME_REGEX.test(userRegistrationData.firstName)) {
            var errorDescription = "First name not in valid format";
            var errorObject = {errorCode: AuthenticationModuleErrorCodes.FIRSTNAME_NOT_IN_VALID_FORMAT_ERRORCODE, errorDescription: errorDescription};
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else if (!RegularExpressions.LASTNAME_REGEX.test(userRegistrationData.lastName)) {
            var errorDescription = "Last name not in valid format";
            var errorObject = {errorCode: AuthenticationModuleErrorCodes.LASTNAME_NOT_IN_VALID_FORMAT_ERRORCODE, errorDescription: errorDescription};
            logger.info(errorObject);
            deferred.reject(errorObject);
        } else if (!!userRegistrationData.phoneNumber && !RegularExpressions.PHONENUMBER_REGEX.test(userRegistrationData.phoneNumber)) {
            var errorDescription = "Phone number not in valid format";
            var errorObject = {errorCode: AuthenticationModuleErrorCodes.PHONENUMBER_NOT_IN_VALID_FORMAT_ERRORCODE, errorDescription: errorDescription};
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else if (!!userRegistrationData.collegeName && !RegularExpressions.COLLEGENAME_REGEX.test(userRegistrationData.collegeName)) {
            var errorDescription = "College name not in valid format";
            var errorObject = {errorCode: AuthenticationModuleErrorCodes.COLLEGENAME_NOT_IN_VALID_FORMAT_ERRORCODE, errorDescription: errorDescription};
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else if (!!userRegistrationData.departmentName && !RegularExpressions.DEPARTMENTNAME_REGEX.test(userRegistrationData.departmentName)) {
            var errorDescription = "Department name not in valid format";
            var errorObject = {errorCode: AuthenticationModuleErrorCodes.DEPARTMENTNAME_NOT_IN_VALID_FORMAT_ERRORCODE, errorDescription: errorDescription}
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else {

            checkForUsername(userRegistrationData.username).then(function (success) {
                if (success.isUsernameExists) {
                    var errorDescription = "Username already exists";
                    deferred.reject({errorCode: AuthenticationModuleErrorCodes.USERNAME_ALREADY_EXISTS_ERRORCODE, errorDescription: errorDescription });
                } else {
                    checkForEmailId(userRegistrationData.emailId).then(function (success) {
                        if (success.isEmailIdExists) {
                            var errorDescription = "E mail Id already exists";
                            deferred.reject({errorCode: AuthenticationModuleErrorCodes.EMAILID_ALREADY_EXISTS_ERRORCODE, errorDescription: errorDescription});
                        } else {
                            var insertUserCredentialsPromise = insertUserCredentialsData(userRegistrationData.username, userRegistrationData.password);
                            var insertUserDetailsPromise = insertUserDetailsData(userRegistrationData.username, userRegistrationData.firstName, userRegistrationData.lastName,
                                userRegistrationData.emailId, userRegistrationData.phoneNumber, userRegistrationData.collegeName, userRegistrationData.departmentName);
                            var insertUserAuthenticationDetailsPromise = insertUserAuthenticationData(userRegistrationData.username);
                            Q.all([insertUserCredentialsPromise, insertUserDetailsPromise, insertUserAuthenticationDetailsPromise]).spread(generateAndUpdateEmailVerificationToken).
                                then(sendEmailVerificationLinkToClient).then(function (success) {
                                    deferred.resolve({registrationStatus: "Success", username: userRegistrationData.username});
                                }, function (error) {
                                    deferred.reject({errorCode: errorCode, errorDescription: errorDescription, error: error.error});
                                });
                        }
                    }, function (error) {
                        deferred.reject({errorCode: error.errorCode, errorDescription: error.errorDescription, error: error.error});
                    });
                }
            }, function (error) {
                deferred.reject({errorCode: error.errorCode, errorDescription: error.errorDescription, error: error.error})
            });
        }
    }
    return deferred.promise;
};

var getEmailIdAccessTokenValidity = function (username, validationToken) {
    var deferred = Q.defer();
    var validateEmailSql = "SELECT ?? from ?? WHERE ??=?";
    var validateEmailSqlInserts = ['userRegistrationAccessToken', 'UserAuthentication', 'username', username];
    validateEmailSql = mysql.format(validateEmailSql, validateEmailSqlInserts);
    validateEmailSqlQuery = sqlConnection.query(validateEmailSql, function (error, rows, fields) {
        if (error) {
            var errorDescription = "Error occurred in querying the user registration access token for user: " + username;
            var errorObject = {username: username, error: error, errorDescription: errorDescription, errorCode: AuthenticationModuleErrorCodes.USER_REGISTRATION_ACCESS_TOKEN_DB_ERRORCODE};
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else if (rows.length == 0) {
            var errorDescription = "User: " + username + " missing access token";
            var errorObject = {username: username, errorDescription: errorDescription, errorCode: AuthenticationModuleErrorCodes.USER_MISSING_ACCESS_TOKEN_ERRORCODE};
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else {
            if (validationToken === rows[0].userRegistrationAccessToken) {
                deferred.resolve({username: username, isEmailIdAccessTokenValid: true});
            } else {
                var errorDescription = "The user: " + username + " gave invalid access token for  email id verification";
                logger.error({errorDescription: errorDescription, username: username});
                deferred.resolve({username: username, isEmailIdAccessTokenValid: false});
            }
        }
    });
    return deferred.promise;
};


var updateRegistrationStatus = function (username) {
    var deferred = Q.defer();
    var updateRegistrationStatusSql = "UPDATE ?? SET ??=? WHERE ??=?";
    var updateRegistrationStatusSqlInserts = ['UserAuthentication', 'isRegistered', true, 'username', username];
    updateRegistrationStatusSql = mysql.format(updateRegistrationStatusSql, updateRegistrationStatusSqlInserts);
    var updateRegistrationStatusSqlQuery = sqlConnection.query(updateRegistrationStatusSql, function (error, rows, fields) {
        if (error) {
            var errorDescription = "Error occurred in updating registration status";
            var errorObject = {username: username, errorDescription: errorDescription, error: error, errorCode: AuthenticationModuleErrorCodes.REGISTRATION_STATUS_UPDATE_DB_ERRORCODE};
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else {
            deferred.resolve({username: username, status: "Registration status Successfully updated"});
        }
    });
    return deferred.promise;
};

var insertUserCredentialsData = function (username, password) {
    var deferred = Q.defer();
    var passwordHash = crypto.SHA3(password).toString();
    var insertUserCredentialsSql = "INSERT INTO ?? (??,??) VALUES (?,?)";
    var insertUserCredentialsSqlInserts = ['UserCredentials', 'username', 'password', username, passwordHash];
    insertUserCredentialsSql = mysql.format(insertUserCredentialsSql, insertUserCredentialsSqlInserts);
    var insertUserCredentialsSqlQuery = sqlConnection.query(insertUserCredentialsSql, function (error, result) {
        if (error) {
            var errorDescription = "Error occurred in inserting user credentials";
            var errorObject = {username: username, error: error, errorDescription: errorDescription, errorCode: AuthenticationModuleErrorCodes.USER_CREDENTIALS_INSERT_DB_ERRORCODE};
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else {
            deferred.resolve({inserUserCredentialsStatus: "User credentials inserted successfully", username: username});
        }
    });
    return deferred.promise;
};

var insertUserDetailsData = function (username, firstName, lastName, emailId, phoneNumber, collegeName, departmentName) {
    var deferred = Q.defer();
    var insertUserDetailsSql = "INSERT INTO ?? (??,??,??,??,??,??,??) VALUES (?,?,?,?,?,?,?)";
    var insertUserDetailsSqlInserts = ['UserDetails', 'username', 'firstName', 'lastName', 'emailId', 'phoneNumber', 'collegeName', 'departmentName',
        username, firstName, lastName, emailId, phoneNumber, collegeName, departmentName];
    insertUserDetailsSql = mysql.format(insertUserDetailsSql, insertUserDetailsSqlInserts);
    var insertUserDetailsSqlQuery = sqlConnection.query(insertUserDetailsSql, function (error, rows, fields) {
        if (error) {
            var errorDescription = "Error occurred in inserting user details";
            var errorObject = {username: username, error: error, errorDescription: errorDescription, errorCode: AuthenticationModuleErrorCodes.USER_DETAILS_INSERT_DB_ERRORCODE};
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else {
            deferred.resolve({insertUserDetailsStatus: "User details inserted successfully", username: username,
                userDetails: {firstName: firstName, lastName: lastName, emailId: emailId}});
        }
    });
    return deferred.promise;
};


var insertUserAuthenticationData = function (username) {
    var deferred = Q.defer();
    var userType = 'CLIENT';
    var insertUserAuthenticationSql = "INSERT INTO ?? (??,??) VALUES (?,?)";
    var insertUserAuthenticationSqlInserts = ['UserAuthentication', 'username', 'userType', username, userType];
    insertUserAuthenticationSql = mysql.format(insertUserAuthenticationSql, insertUserAuthenticationSqlInserts);
    var insertUserAuthenticationSqlQuery = sqlConnection.query(insertUserAuthenticationSql, function (error, rows, fields) {
        if (error) {
            var errorDescription = "Error occured in inserting user authentication details";
            var errorObject = {username: username, error: error, errorDescription: errorDescription, errorCode: AuthenticationModuleErrorCodes.USER_AUTHENTICATION_DETAILS_INSERT_DB_ERRORCODE};
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else {
            deferred.resolve({insertUserAuthenticationStatus: "User authentication details inserted successfully", username: username});
        }
    });
    return deferred.promise;
};

var generateAndUpdateEmailVerificationToken = function (a, b, c) {
    var deferred = Q.defer();
    var username = b.username;
    var userDetails = b.userDetails;
    var token = randTokenGenerator.generate(150);
    logger.info("token: " + token);
    var updateEmailIdTokenSql = "UPDATE ?? SET ??=? WHERE ??=?";
    var updateEmailIdTokenSqlInserts = ['UserAuthentication', 'userRegistrationAccessToken', token, 'username', username];
    updateEmailIdTokenSql = mysql.format(updateEmailIdTokenSql, updateEmailIdTokenSqlInserts);
    var updateEmailIdTokenSqlQuery = sqlConnection.query(updateEmailIdTokenSql, function (error, rows, fields) {
        if (error) {
            var errorDescription = "Error occurred in updating Email Id verification token";
            var errorObject = {username: username, errorDescription: errorDescription, error: error, errorCode: AuthenticationModuleErrorCodes.EMAIL_VERIFICATION_TOKEN_UPDATE_DB_ERRORCODE};
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else {
            deferred.resolve({username: username, updateEmailVerificationTokenStatus: "The email verification token is successfully updated", token: token, userDetails: userDetails});
        }
    });
    return deferred.promise;
};

var constructConfimationLinkEmailOptions = function (emailId, token, firstName, lastName, username) {
    logger.info("Entered into construct confirmation link email options function");
    var activationLink = proxyUrl + "/emailvalidation?userid=" + username + "&emailidvalidationtoken=" + token;
    return {
        from: "DoNotReply<campustocorporateteam@gmail.com>", // sender address
        to: emailId, // list of receivers
        subject: "Campus to Corporate Registration Activation Link", // Subject line
        html: "Dear " + firstName + " " + lastName + "," +
            "<br/><br/>Your profile has been created in \'campus to corporate initiative\' website. Your userid is: <b>" + username +
            "</b><br/><br/>Please click here  to activate your account OR copy and paste the following <a href=\"" + activationLink + "\">" +
            activationLink + "</a> into your browser<br/><br/>" +
            "This is system generated email and please do not reply<br/><br/>" +
            "Regards,<br/>Campus to Corporate Initiative Team"
    }
};

var sendEmailVerificationLinkToClient = function (success) {
    var deferred = Q.defer();
    logger.info("Entered send email verification function");
    var userDetails = success.userDetails;
    var username = success.username;
    logger.info(username + "  " + success.username);
    var emailOptions = constructConfimationLinkEmailOptions(userDetails.emailId, success.token, userDetails.firstName, userDetails.lastName, username);
    mailTransport.sendMail(emailOptions, function (error, info) {
        if (error) {
            var errorDescription = "Unable to send email for username: " + username + " to email: " + userDetails.emailId;
            var errorObject = {errorDescription: errorDescription, error: error, errorCode: AuthenticationModuleErrorCodes.UNABLE_TO_SEND_EMAIL_ERRORCODE};
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else {
            deferred.resolve({username: username, emailSendingStatus: "Email successfully sent to client"});
        }
    });
    return deferred.promise;
};

var checkForUsername = function (username) {
    logger.info("Entered check for username");
    var deferred = Q.defer();
    var checkUsernameSql = "SELECT ?? FROM ?? WHERE ?? = ?";
    var checkUsernameSqlInserts = ['username', 'UserDetails', 'username', username];
    checkUsernameSql = mysql.format(checkUsernameSql, checkUsernameSqlInserts);
    var checkUsernameSqlQuery = sqlConnection.query(checkUsernameSql, function (error, rows, fields) {
        if (error) {
            var errorDescription = "Error occured in querying username";
            var errorObject = {username: username, error: error, errorDescription: errorDescription, errorCode: AuthenticationModuleErrorCodes.USERNAME_CHECK_DB_ERRORCODE};
            logger.error(errorObject);
            deferred.reject(errorObject);
        }
        else {
            if (rows.length > 0) {
                deferred.resolve({username: username, isUsernameExists: true});
            }
            deferred.resolve({username: username, isUsernameExists: false});
        }
    });
    return deferred.promise;
}

var checkForEmailId = function (emailId) {
    var deferred = Q.defer();
    var checkForEmailSql = "SELECT ?? from ?? WHERE ?? = ?";
    var checkForEmailSqlInserts = ['emailId', 'UserDetails', 'emailId', emailId];
    checkForEmailSql = mysql.format(checkForEmailSql, checkForEmailSqlInserts);
    var checkForEmailSqlQuery = sqlConnection.query(checkForEmailSql, function (error, rows, fields) {
        if (error) {
            var errorDescription = "Error occurred in querying the email id";
            var errorObject = {emailId: emailId, errorDescription: errorDescription, error: error, errorCode: AuthenticationModuleErrorCodes.EMAILID_CHECK_DB_ERRORCODE};
            logger.error(errorObject);
            deferred.error(errorObject);
        }
        else {
            if (rows.length > 0) {
                deferred.resolve({emailId: emailId, isEmailIdExists: true});
            } else {
                deferred.resolve({emailId: emailId, isEmailIdExists: false});
            }
        }
    });
    return deferred.promise;
}


/*Registration Module Ends Here*/

/*Authentication Module Ends Here*/

/*
 Steps to perform in authenticating the user
 1. Get Password for the User
 2. Get the User Credentials State
 3. If user valid, Check his registration Details
 4. If user already Registered get his details
 5. Generate a jwt and send the reponse back to the client. 
 */
//Function that returns the promise to get the password for a username
var getPasswordForTheUser = function (username, passwordHash) {

    var deferred = Q.defer();
    var validateUserSql = "SELECT ?? from ?? WHERE ?? = ?";
    var validateUserSqlInserts = ['password', 'UserCredentials', 'username', username];
    validateUserSql = mysql.format(validateUserSql, validateUserSqlInserts);
    var validateUserSqlQuery = sqlConnection.query(validateUserSql, function (error, rows, fields) {
        if (error) {
            var errorDescription = "Error occured in querying for User Credentials for username: " + username;
            var errorObject = {username: username, error: error, errorDescription: errorDescription, errorCode: AuthenticationModuleErrorCodes.PASSWORD_DB_ERRORCODE };
            logger.error(errorObject);
            deferred.reject(errorObject);
        }
        else if (rows.length == 0) {
            var errorDescription = "The username " + username + " does not exists in database";
            var errorObject = {username: username, errorDescription: errorDescription, errorCode: AuthenticationModuleErrorCodes.USERNAME_DOES_NOT_EXISTS_ERRORCODE };
            logger.warn(errorObject);
            deferred.reject(errorObject);
        }
        else {
            deferred.resolve({username: username, passwordHash: passwordHash, password: rows[0].password});
        }
    });
    return deferred.promise;
};


//The Success Call Back for Getting Password 
var getPasswordForUserSuccessPromise = function (success) {
    var deferred = Q.defer();
    var username = success.username;
    var passwordHash = success.passwordHash;

    if (passwordHash === success.password) {
        deferred.resolve({username: username, successStatus: "The user is valid"});
    }
    else {
        var errorDescription = "The password entered is incorrect for username: " + username;
        var errorObject = {username: username, errorDescription: errorDescription, errorCode: AuthenticationModuleErrorCodes.INCORRECTPASSWORD_ERRORCODE };
        logger.warn(errorObject);
        deferred.reject(errorObject);
    }
    return deferred.promise;
}

//To Chack whether the user registered or not

var getAuthenticationDetailsOfUserPromise = function (success) {

    var deferred = Q.defer();
    var username = success.username;
    var isUserRegisteredSql = "SELECT ??,??,??,??,?? from ?? WHERE ?? = ?";
    var isUserRegisteredSqlInserts = ['userType', 'isRegistered', 'isLocked', 'mustChangePassword', 'lastLoginTime', 'UserAuthentication', 'username', username];
    isUserRegisteredSql = mysql.format(isUserRegisteredSql, isUserRegisteredSqlInserts);
    var isUserRegisteredSqlQuery = sqlConnection.query(isUserRegisteredSql, function (error, rows, fields) {
        if (error) {
            var errorDescription = "Error occured in querying for user registration status for username: " + username;
            var errorObject = {username: username, errorDescription: errorDescription, errorCode: AuthenticationModuleErrorCodes.USER_REGISTRATION_DETAILS_DB_ERRORCODE };
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else if (rows.length == 0) {
            var errorDescription = "The username: " + username + " missed entry in authentication table";
            var errorObject = {username: username, errorDescription: errorDescription, errorCode: AuthenticationModuleErrorCodes.USERNAME_MISSED_ENTRY_IN_AUTHENTICATION_TABLE_ERRORCODE };
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else {
            var isUserRegistered = rows[0].isRegistered;
            var isUserLocked = rows[0].isLocked;
            if (!isUserRegistered) {
                var errorDescription = "The user: " + username + " not registered but tried to login";
                var errorObject = {username: username, errorDescription: errorDescription, errorCode: AuthenticationModuleErrorCodes.USER_NOT_REGISTERED_ERRORCODE};
                logger.warn(errorObject);
                deferred.reject(errorObject);
            } else if (isUserLocked) {
                var errorDescription = "The user: " + username + " was locked but tried to login";
                var errorObject = {usename: username, errorDescription: errorDescription, errorCode: AuthenticationModuleErrorCodes.LOCKED_USER_TRIED_TO_LOGIN_ERRORCODE};
                logger.warn(errorObject);
                deferred.reject(errorObject);
            } else {
                deferred.resolve({username: username, userAuthenticationDetails: {userType: rows[0].userType, mustChangePassword: rows[0].mustChangePassword, lastLoginTime: rows[0].lastLoginTime}, successStatus: "User authentication Completed"});
            }
        }
    });
    return deferred.promise;
}

var getUserDetails = function (success) {
    var username = success.username;
    var deferred = Q.defer();
    var getUserDetailsSql = "SELECT * from ?? WHERE ?? = ? ";
    var getUserDetailsSqlInserts = ['UserDetails', 'username', username];
    getUserDetailsSql = mysql.format(getUserDetailsSql, getUserDetailsSqlInserts);
    var getUserDetailsQuery = sqlConnection.query(getUserDetailsSql, function (error, rows, fields) {
        if (error) {
            var errorDescription = "Error occured in querying for user details for username: " + username;
            var errorObject = {username: username, errorDescription: errorDescription, errorCode: AuthenticationModuleErrorCodes.USER_DETAILS_DB_ERRORCODE };
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else if (rows.length == 0) {
            var errorDescription = "The username: " + username + " missed entry in user details table";
            var errorObject = {username: username, errorDescription: errorDescription, errorCode: AuthenticationModuleErrorCodes.USERNAME_MISSED_ENTRY_IN_USER_DETAILS_TABLE_ERRORCODE};
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else {
            var userDetails = new UserDetailsObject();
            userDetails.username = rows[0].username;
            userDetails.firstName = rows[0].firstName;
            userDetails.lastName = rows[0].lastName;
            userDetails.emailId = rows[0].emailId;
            userDetails.phoneNumber = rows[0].phoneNumber;
            userDetails.collegeName = rows[0].colegeName;
            userDetails.departmentName = rows[0].departmentName;
            userDetails.authenticationDetails = success.userAuthenticationDetails;
            deferred.resolve({username: username, successStatus: "User details successfully retrieved", userDetails: userDetails});
        }
    });
    return deferred.promise;
}

var updateUserActivity = function (data) {
    var deferred = Q.defer();
    var updateUserActivitySql = "INSERT INTO ?? (??,??,??,??,??,??,??,??,??) VALUES (?,?,?,?,?,?,?,?,?)";
    var updateUserActivitySqlInserts = ['UserActivity', 'username', 'ipAddress', 'geoLocation', 'browserFamily', 'browserVersion',
        'deviceFamily', 'deviceVersion', 'operatingSystemFamily', 'operatingSystemVersion', data.username, data.ipAddress,
        data.geoLocation, data.browserFamily, data.browserVersion, data.deviceFamily, data.deviceVersion, data.operatingSystemFamily,
        data.operatingSystemVersion];
    updateUserActivitySql = mysql.format(updateUserActivitySql, updateUserActivitySqlInserts);
    var updateUserActivityQuery = sqlConnection.query(updateUserActivitySql, function (error, rows, fields) {
        if (error) {
            var errorDescription = "Error occured in inserting user activity";
            var errorObject = {username: data.username, errorDescription: errorDescription, errorCode: AuthenticationModuleErrorCodes.USER_ACTIVITY_DB_ERRORCODE  }
            logger.error(errorObject);
            deferred.reject(errorObject);
        } else {
            deferred.resolve({username: data.username, successStatus: "User activity successfully updated"});
        }
    });
    return deferred.promise;
}


var authenticateUser = function (username, password) {
    var passwordHash = crypto.SHA3(password).toString();
    var deferred = Q.defer();

    getPasswordForTheUser(username, passwordHash).then(getPasswordForUserSuccessPromise).
        then(getAuthenticationDetailsOfUserPromise).then(getUserDetails).
        then(function (success) {

            var authenticateUserResponse = new AuthenticateUserResponse();
            authenticateUserResponse.internalStatusCode = 1000;
            var token = jwt.sign(success.userDetails, secret, {expiresInMinutes: 60 * 3});
            authenticateUserResponse.token = token;
            authenticateUserResponse.userInformation = {
                firstName: success.userDetails.firstName,
                lastName: success.userDetails.lastName,
                mustChangePassword: success.userDetails.authenticationDetails.mustChangePassword
            }
            deferred.resolve({username: username, authResponse: authenticateUserResponse});

        }, function (error) {
            logger.error(error);
            var authenticateUserResponse = new AuthenticateUserResponse();
            authenticateUserResponse.internalStatusCode = error.errorCode;
            authenticateUserResponse.errorMessage = error.errorDescription;
            deferred.resolve({username: username, authResponse: authenticateUserResponse});
        });
    return deferred.promise;
};


collegeToCorporateApp.get('/api/getData', function (request, response) {
    response.send("Normal User");
});

collegeToCorporateApp.get('/admin/getData', function (request, response) {
    response.send("Admin User");
});

collegeToCorporateApp.get('/founders/getData', function (request, response) {
    response.send("Founder User");
});


/*
* Feedback module starts from here
* */

var FeedbackModuleErrorCodes = {
  FEEDBACK_QUESTIONS_DB_ERRORCODE: 3001
};

var FeedbackObjects = {};
FeedbackObjects.FeedbackQuestionObject = function(row){
    this.Id = row.questionId;
    this.description = row.questionText;
    this.type = row.questionType;
    this.options = row.questionOptions.trim().split('|');
    this.suggestion = row.questionSuggestion;
}


collegeToCorporateApp.post('/getFeedbackQuestionsData',function(request,response){
    getFeedbackQuestionsData().then(function(success){
        response.json({internalStatusCode: 1000, feedbackQuestionsData: success.feedbackQuestionsData});
    },function(error){
        response.json({internalStatusCode: error.errorCode, errorMessage: error.errorDescription,error: error.error});
    });
});

var getFeedbackQuestionsData = function(){
    logger.info("Entered get feedback questions function");
    var deferred = Q.defer();
    var getFeedbackQuestionsDataSql = "SELECT * FROM ?? ";
    var getFeedbackQuestionsDataSqlInserts = ['FeedbackQuestions'];
    getFeedbackQuestionsDataSql = mysql.format(getFeedbackQuestionsDataSql, getFeedbackQuestionsDataSqlInserts);
    var getFeedbackQuestionsDataSqlQuery = sqlConnection.query(getFeedbackQuestionsDataSql, function (error, rows, fields) {
        if (error) {
            var errorDescription = "Error occured in querying feedback questions data";
            var errorObject = {username: "NO_USERNAME_REQUIRED", error: error, errorDescription: errorDescription, errorCode: FeedbackModuleErrorCodes.FEEDBACK_QUESTIONS_DB_ERRORCODE};
            logger.error(errorObject);
            deferred.reject(errorObject);
        }
        else {
            var data = [];
            for(var i=0;i<rows.length;i++){
              data.push(new FeedbackObjects.FeedbackQuestionObject(rows[i]));
            }
            deferred.resolve({username: "NO_USERNAME_REQUIRED", feedbackQuestionsData: data});
        }
    });
    return deferred.promise;
}



collegeToCorporateApp.listen(7000);
collegeToCorporateApp.listen(7001);
collegeToCorporateApp.listen(7002);
collegeToCorporateApp.listen(7003);
collegeToCorporateApp.listen(7004);







