"use strict";

var app = require("express")();
var helper = require('helper');
var request = require('request');
var util = require('util');
var config= require('config');
var sharedCache = require('service/cache').shared;
var middlewareLogin = require('middleware/LoginMiddleware.js');
var moduleName = __filename;
var logger = require("helper/Logger.js")(moduleName);
var constants = config.orionConstants;
var messages = config.messages;
var LoginService = require('service/admin/LoginService.js');
var loginService = new LoginService();
var responseCodes = config.responseCode;
var validate = helper.validate;

app.use(require('middleware/DBConnection').common); 

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
             		}, 'community_access_token');
         }else if(authorization[0] === loginService.HEADER_KEY_BASIC && !!authorization[1]){

        	 loginService.startLoginProcess(data, function(err, statusCode, data){
                 if(!!err){
                    logger.error(err);
                 }
 	 			return response(err, statusCode, data, res);
        	 }, 'community_access_token');

         }else{
              return response(messages.invalidHeaders, responseCodes.BAD_REQUEST, null, res);
         }

    }else{
           return response(messages.invalidHeaders, responseCodes.BAD_REQUEST, null, res);
    }

});

module.exports = app;