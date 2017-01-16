"use strict";

var moduleName = __filename;
var config = require('config');

var responseController = require('controller/ResponseController.js');
var localCache = require('service/cache').local;
var sharedCache = require('service/cache/').shared;
var logger = require("helper/Logger.js")(moduleName);

var JwtService = require('service/admin/JwtService.js');
var LoginService = require('service/admin/LoginService.js');

var constants = config.orionConstants;
var messages = config.messages;
var responseCodes = config.responseCodes;

var loginService = new LoginService();
var jwtService = new JwtService();
var localCache = require('service/cache').local;

var sessionless_apis = [
	'/v1/rebalancer/rebalance',
];

function unthorisedResponse(res, msg){
	return responseController(msg, responseCodes.UNAUTHORIZED, null, res);
}

/*
 * will always run with eclipse token in headers 
*/
exports.authorization = function() {
	var isAuthorized = function(req, res, next) {
		logger.info("Verify authorization (isAuthorized())");
		
		var authorizationHeaders = req.headers.authorization;
		if(authorizationHeaders == "master" && sessionless_apis.includes(req.url.split("?")[0])){			
	    var cacheObject = localCache.get(req.data.reqId);	    
	    req.data.user = {firmId : req.body.firmId}; 
	    return next();
	  }else if(authorizationHeaders == 'Super ' + constants.CONNECT_API_KEY){	  	
	  	var cacheObject = localCache.get(req.data.reqId),
	  	connectFirmId = req.query.firmId || req.body.firmId || req.data.firmId;
	  	var firmId = localCache.get("orionConnectFirmList")[connectFirmId];	  	
	  	if(firmId == null)
	  		return unthorisedResponse(res, messages.invalidFirm);
	  	else{
	  		req.data.user = {firmId : firmId}; 	    
	    	return next();
	  	}
	  }
	  else if (authorizationHeaders) {
			var authorization = authorizationHeaders.split(' ');
			if(authorization[0] === loginService.HEADER_KEY_SESSION){
				var token = authorization[1];
				if (token) {
					req.data.token = token;
					jwtService.verify(token, function(err, decoded) {
						if (err) {
							logger.error("Error in isAuthorized (isAuthorized())" + err);
							return unthorisedResponse(res, messages.invalidHeaders);
						} else {
							var cacheObject = localCache.get(req.data.reqId);
							cacheObject.session = decoded;
							logger.debug("decoded info from token "+JSON.stringify(decoded));
							decoded.token = token;
							req.data.user = {userId: decoded.userId, firmId: decoded.firmId };
							if(decoded.actualUserId){
								req.data.user.actualUserId = decoded.actualUserId;
							}
							sharedCache.get(token,  function(err, data){
								if(err || !data){
									logger.error("Error in isAuthorized (isAuthorized())" + err);
									return unthorisedResponse(res, messages.notLoggedIn);
								}else{
									var tempUserInfo = JSON.parse(data);
									// logger.debug("In authorization middleware"+JSON.stringify(tempUserInfo));
									req.data.user.roleTypeId = tempUserInfo.roleTypeId;
									req.data.user.roleId = tempUserInfo.roleId;
									req.data.user.teamIds = tempUserInfo.teamIds;
									req.data.user.teamNames = tempUserInfo.teamNames;
									req.data.user.primaryTeam = tempUserInfo.primaryTeam;
									// console.log(tempUserInfo.teamNames);
									// console.log(tempUserInfo.primaryTeam);
									logger.info("Authorization successful (isAuthorized())",JSON.stringify(req.data.user));
									return next();
								}
							});
						}
					});
				}else{
					logger.info("Authorization failed (isAuthorized()) token is not present");
					return unthorisedResponse(res, messages.invalidHeaders);
				}
			}else{
				logger.info("Authorization failed (isAuthorized()) because header does not have session");
				return unthorisedResponse(res, messages.invalidHeaders);
			}
		}else{
			logger.info("Authorization failed (isAuthorized()) header is not preset");
			return unthorisedResponse(res, messages.invalidHeaders);
		}

		//if(!isTokenValid){
		//	return unthorisedResponse(res, messages.invalidHeaders);
		//}

	};

	isAuthorized.unless = require("express-unless");
	return isAuthorized;
};

