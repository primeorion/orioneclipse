"use strict";

var moduleName = __filename;
var logger = require("helper/Logger.js")(moduleName);

var jwt = require('jsonwebtoken');
var constants = require('config').env;

var JwtService = function() {};

JwtService.prototype.sign = function(data,cb){
	logger.info("JWT signing service called");
	
	var token;
	var err=null;
	try{
		token = jwt.sign(data, constants.sessionsecret);
	}catch(error){
		logger.error("Error in signing JWT" + error);
		err = error;
	}
	cb(err,token);
};

JwtService.prototype.verify = function(data, cb){
	logger.info("JWT verify service called");
	jwt.verify(data, constants.sessionsecret, cb);
};
	
module.exports = JwtService;
