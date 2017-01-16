"use strict";

var moduleName = __filename;
var config = require('config');
var JwtService = require('service/admin/JwtService.js');
var logger = require('helper/Logger.js')(moduleName);

var constants = config.orionConstants;
var responseCodes = config.responseCode;

var jwtService = new JwtService();

var TokenService = function() {}

TokenService.prototype.generateToken = function (eclipseUser, cb) {
 	logger.info("Generate token service called (generateToken())");
 	/*var user = {
			'firmId': eclipseUser.firmId,
			'userId': eclipseUser.userId
	};
	
	var dataToToken = constants.token();
	if(eclipseUser.actualUserId){
		dataToToken.actualUserId = eclipseUser.actualUserId;
	}
	dataToToken.firmId = user.firmId;
	dataToToken.userId = user.userId;
	jwtService.sign(dataToToken, function (err, token) {
		if (err) {
			logger.error("Error in signing token (generateToken())" + err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}else{
			return cb(null, responseCodes.SUCCESS, token);
		}
	});*/

	var user = {
			'userId': eclipseUser.userId
	};
	
	var dataToToken = constants.token();
	if(eclipseUser.actualUserId){
		dataToToken.actualUserId = eclipseUser.actualUserId;
	}
	dataToToken.userId = user.userId;
	jwtService.sign(dataToToken, function (err, token) {
		if (err) {
			logger.error("Error in signing token (generateToken())" + err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}else{
			return cb(null, responseCodes.SUCCESS, token);
		}
	});
};

module.exports = TokenService;