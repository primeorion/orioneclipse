"use strict";

var app = require("express")();
var helper = require('helper');
var request = require('request');
var util = require('util');
var config= require('config');
var sharedCache = require('service/cache').shared;
var middlewareLogin = require('middleware/LoginMiddleware.js');
var response = require('controller/ResponseController.js');
var moduleName = __filename;
var logger = require("helper/Logger.js")(moduleName);
var constants = config.orionConstants;
var messages = config.messages;
var responseCodes = config.responseCode;
var UserService = require('service/admin/UserService.js');
var userService = new UserService();
var LoginService = require('service/admin/LoginService.js');
var loginService = new LoginService();
var validate = helper.validate;

app.use(require('middleware/DBConnection').common); 
 
var loginAsSchema = {
    type: 'object',
    properties: {
        userId: {
            type: 'number',
            required: true
        },
        firmId: {
             type: 'number'
        }
    }
};

/**
 * @api {get} /admin/token Login (LoginId:Password)
 * @apiName GetJWTToken
 * @apiVersion 1.0.0
 * @apiGroup Authentication
 * @apiPermission appuser
 *
 * @apiDescription This API gets Auth token from Orion Connect and returns JWT token. 
 *
 * @apiHeader {String} Authorization Base64 encoded user login credentials (userId:password).
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Basic cHJpbWV0Z2k6cHJpbWV0Z2kyMiE= 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/token
 *
 * @apiSuccess {String}   eclipse_access_token      The JWT Token.
 * @apiSuccess {String}   orion_access_token        The Orion Connect Auth Token.
 * @apiSuccess {String}   expires_in                Token Expire Time in Second.
 *
 * @apiError BAD_REQUEST Login credentials missing.
 * @apiError UNAUTHORIZED Invalid login credentials.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "message": "UNAUTHORIZED"
 *     }
 */

/**
 * @api {get} /admin/token Login (OrionConnect Auth Token)
 * @apiName GetJWTTokenUsingOCToken
 * @apiVersion 1.0.0
 * @apiGroup Authentication
 * @apiPermission appuser
 *
 * @apiDescription This API gets validates Orion Connect auth token and returns JWT token. 
 *
 * @apiHeader {String} Authorization Orion connect auth token
 * 
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session egdggdDGdfgGDgcHJpbWV0Z2k6cHJpbWV0Z2kyMiE 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/token
 *
 * @apiSuccess {String}   eclipse_access_token      The JWT Token.
 * @apiSuccess {String}   orion_access_token        The Orion Connect Auth Token.
 * @apiSuccess {String}   expires_in                Token Expire Time in Second.
 *
 * @apiError BAD_REQUEST Login credentials missing.
 * @apiError UNAUTHORIZED Invalid login credentials.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "message": "UNAUTHORIZED"
 *     }
 */

app.get('/token', middlewareLogin.login, function (req, res) {
	logger.info("Login request received");
	
    var data = req.data;
    var authorizationHeaders = req.headers.authorization;
    data.authorizationHeaders = authorizationHeaders;

    if(!!authorizationHeaders){
         var authorization = authorizationHeaders.split(' ');
         
         if(authorization.length !== 2){
             return response(messages.invalidHeaders, responseCodes.BAD_REQUEST, null, res);
         }
         
         if(authorization[0] === loginService.HEADER_KEY_SESSION && !!authorization[1]){
             data.orion_access_token = authorization[1];
			 
             return loginService.authenticateWithConnectAndGetEclipseToken(data, function(err, statusCode, data){
            	 			if(err){
            	 				return response(err, statusCode, data, res);
            	 			}
                            if(!!data){
                	 	        data.expires_in = constants.TOKEN_EXPIRES_IN;
                            }
            	 			response(null, statusCode, data, res);
             		});
         }else if(authorization[0] === loginService.HEADER_KEY_BASIC && !!authorization[1]){

        	 loginService.startLoginProcess(data, function(err, statusCode, data){
                 if(!!err){
                    logger.error(err);
                 }
 	 			return response(err, statusCode, data, res);
        	 });

         }else{
              return response(messages.invalidHeaders, responseCodes.BAD_REQUEST, null, res);
         }

    }else{
           return response(messages.invalidHeaders, responseCodes.BAD_REQUEST, null, res);
    }

});

/**
 * @api {get} /admin/logout Logout
 * @apiName Logout
 * @apiVersion 1.0.0
 * @apiGroup Authentication
 * @apiPermission appuser
 *
 * @apiDescription This API invalidates token and logouts user from application. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/logout
 *
 * @apiSuccess {String}   message   Success message.
 *
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * @apiError UNAUTHORIZED Invalid JWT token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "message": "UNAUTHORIZED"
 *     }
 */
app.get('/logout', middlewareLogin.logout, function (req, res) {
	logger.info("Logout request received");
    try {
        var jsonKey = JSON.parse("{\""+constants.ERROR_MESSAGE_KEY+"\":\""+messages.logout+"\"}");
    }catch(err){
        logger.error(e);
        return response(messages.interServerError, responseCodes.INTERNAL_SERVER_ERROR, null, res);    
    }
	return response(null, res.statusCode, jsonKey, res);
});

/**
 * @api {get} /admin/authorization/user Get Authorized User
 * @apiName GetUser
 * @apiVersion 1.0.0
 * @apiGroup Authentication
 * @apiPermission appuser
 *
 * @apiDescription This API gets user id from Orion Connect application and fetch respective user details from Eclipse. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/authorization/user
 * 
 * @apiSuccess {Number}     id              The User-ID.
 * @apiSuccess {Number}     actualUserId    The Actual User-ID.
 * @apiSuccess {String}     name            Full Name of the User.
 * @apiSuccess {String}     userLogo        User logo path
 * @apiSuccess {Boolean}    status          User status - Active/Inactive.
 * @apiSuccess {String}     email           User email id.
 * @apiSuccess {String}     userLoginId     User login id.
 * @apiSuccess {Object}     role            User role details.
 * @apiSuccess {String[]}   team            User team details.
 * @apiSuccess {String}     firmId          Firm Id of user.
 * @apiSuccess {String}     firmName        Firm Name of user.
 * @apiSuccess {String}     firmLogo        Firm logo path.
 * @apiSuccess {Date}       startDate       Date from which user will be active in system.
 * @apiSuccess {Date}       expireDate      Date after which user will be inactive in system.     
 * @apiSuccess {Boolean}    isDeleted       User exist or not into the system.
 * @apiSuccess {Date}       createdOn       User creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the User into the system.
 * @apiSuccess {Date}       editedOn        User edited date into application.
 * @apiSuccess {String}     editedBy        Full Name of user who edited the User details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
          "id": 66,
          "actualUserId": null,
          "name": "Demo Unit",
          "userLogo": "https://orioneclipsedata.s3.amazonaws.com/hdc/images/3/66/download.jpg",
          "status": 1,
          "email": "emial@primetgi.com",
          "userLoginId": "prime@tgi.com",
          "role": {
              "id": 1,
              "name": "Rep Manag1er",
              "status": 1,
              "roleTypeId": 1,
              "roleType": "FIRM ADMIN",
              "startDate": "2016-01-21T18:30:00.000Z",
              "expireDate": "2016-12-24T18:30:00.000Z",
              "privileges": [
                {
                  "id": 57,
                  "name": "Teams",
                  "code": "TEAMS",
                  "category": "Admin",
                  "type": 0,
                  "canAdd": 1,
                  "addDisabled": 0,
                  "canUpdate": 1,
                  "updateDisabled": 0,
                  "canDelete": 1,
                  "deleteDisabled": 0,
                  "canRead": 1,
                  "readDisabled": "0",
                  "isDeleted": 0
                }
              ],
              "isDeleted": 0,
              "createdOn": "2016-07-29T06:35:20.000Z",
              "createdBy": "prime@tgi.com",
              "editedOn": "2016-11-30T06:04:58.000Z",
              "editedBy": "prime@tgi.com"
            },
          "teams": [
            {
              "id": 1,
              "name": "10221 team"
            }
          ],
          "firmId": 3,
          "firmName": null,
          "firmLogo": "https://orioneclipsedata.s3.amazonaws.com/hdc/images/3/orion-logo.png",
          "startDate": "2016-06-21T18:30:00.000Z",
          "expireDate": "2016-12-24T18:30:00.000Z",
          "isDeleted": 0,
          "createdOn": "2016-06-17T05:57:22.000Z",
          "createdBy": null,
          "editedOn": "2016-12-06T03:44:55.000Z",
          "editedBy": "prime@tgi.com"
        }
 *
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * @apiError UNAUTHORIZED Invalid JWT token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "message": "UNAUTHORIZED"
 *     }
 */
app.get('/authorization/user', function (req, res) {
	logger.info("Get user from orion connect request received");
    req.data.id = req.data.user.userId;
    
    loginService.getLoggedinUser(req.data, function (err, status, user) {
       return response(err, status, user, res);
    });
});


/**
 * @api {post} /admin/token/loginas Login As
 * @apiName Log In as API
 * @apiVersion 1.0.0
 * @apiGroup Authentication
 * @apiPermission appuser
 *
 * @apiDescription This API return token for logIn as another user for already logged in user. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam {number}       userId                 Full Name of user to logIn as.
 * @apiParam {number}       firmId                 Full Name of user Firm to logIn as.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
         "userId":1,
         "firmId":1  
        }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/token/loginas
 * 
 * @apiSuccess {String}   eclipse_access_token      The JWT Token.
 * @apiSuccess {String}   orion_access_token        The Orion Connect Auth Token.
 * @apiSuccess {String}   expires_in                Token Expire Time in Second.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
        {
          "eclipse_access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY5ODIzOTU0LjY5MSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6NDc3LCJ1c2VySWQiOjEsImlhdCI6MTQ2OTc4Nzk1NH0.Z1tRPzvWb1lid1mhgjAZaR_oTWn8a48FCmrY3fQBywM",
          "orion_access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTUxMiJ9.eyJBX1VEIjoiODA1NzQwIiwiTU4iOiJETVotTUQtVEVTVDAyIiwiaXNzIjoiT3Jpb24iLCJhdWQiOiJodHRwOi8vc2Vzc2lvbi5vcmlvbiIsImV4cCI6MTQ2OTgyMzkzOCwibmJmIjoxNDY5Nzg3OTM4fQ.LdaxRAvdQz8-7hgMD5RDZ0rLxv5Cu8qVP1eybfJnMhE8wE5aWxfGf7wqSB6Q1fj1Or8OLci_LrOP-K0X0vszfg",
          "expire_time": 36000
        }
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 * @apiError Bad_Request When without request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 * @apiError NOT_FOUND When user firm association not found.
 * @apiError UNAUTHORIZED When user is unauthorized to loginAs.
 *
 * 
 */
app.post('/token/loginas', validate({ body: loginAsSchema }), function (req, res) {
    logger.info("logIn as request received");
    loginService.logInAs(req.data, function (err, status, user) {
       return response(err, status, user, res);
    });
});

/**
 * @api {get} /admin/token/loginas/revert Revert Login As
 * @apiName RevertLogIn
 * @apiVersion 1.0.0
 * @apiGroup Authentication
 * @apiPermission appuser
 *
 * @apiDescription This API Revert the loggedInAs user to actual user
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/token/loginas/revert
 *
 * @apiSuccess {String}   eclipse_access_token      The JWT Token.
 * @apiSuccess {String}   orion_access_token        The Orion Connect Auth Token.
 * @apiSuccess {String}   expires_in                Token Expire Time in Second.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
        {
          "eclipse_access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY5ODIzOTU0LjY5MSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6NDc3LCJ1c2VySWQiOjEsImlhdCI6MTQ2OTc4Nzk1NH0.Z1tRPzvWb1lid1mhgjAZaR_oTWn8a48FCmrY3fQBywM",
          "orion_access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTUxMiJ9.eyJBX1VEIjoiODA1NzQwIiwiTU4iOiJETVotTUQtVEVTVDAyIiwiaXNzIjoiT3Jpb24iLCJhdWQiOiJodHRwOi8vc2Vzc2lvbi5vcmlvbiIsImV4cCI6MTQ2OTgyMzkzOCwibmJmIjoxNDY5Nzg3OTM4fQ.LdaxRAvdQz8-7hgMD5RDZ0rLxv5Cu8qVP1eybfJnMhE8wE5aWxfGf7wqSB6Q1fj1Or8OLci_LrOP-K0X0vszfg",
          "expire_time": 36000
        }
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 */
app.get('/token/loginas/revert', function (req, res) {
    logger.info("logIn rever request received");
    loginService.logInAsRevert(req.data, function (err, status, user) {
       return response(err, status, user, res);
    });
});

module.exports = app;

