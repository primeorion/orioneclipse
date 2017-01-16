"use strict";

var moduleName = __filename;
var request = require("request");
var util = require('util');

var config = require('config');
var UserService = require('service/admin/UserService.js');
var RoleService = require('service/admin/RoleService.js');
var FirmService = require('service/admin/FirmService.js');
var TokenService = require('service/admin/TokenService.js');
var NotificationService = require('service/notification/NotificationService.js');
var sharedCache = require('service/cache').shared;
var logInDao = new (require('dao/admin/LogInDao.js'))();
var firmDao = new (require('dao/admin/FirmDao.js'))();
var userDao = new (require('dao/admin/UserDao.js'))();
var dbConnectionService = require('service/dbpool/DBConnectionService.js');
var logger = require('helper/Logger.js')(moduleName);

var messages = config.messages;
var responseCodes = config.responseCode;
var httpResponseCodes = config.responseCodes;
var constants = config.orionConstants;
var orionApiResponseKeys = constants.orionApiResponseKey;

var userService = new UserService();
var firmService = new FirmService();
var tokenService = new TokenService();
var roleService = new RoleService();
var notificationService = new NotificationService();

var LoginService = function() {
	this.HEADER_KEY_SESSION = "Session";
	this.HEADER_KEY_BASIC = "Basic";
	this.CONNECT_API_TIMEOUT = 100000;
};

LoginService.prototype.startLoginProcess = function (reqData, cb) {
	logger.info("Login service called (startLoginProcess())");
	var thisService = this;

	this.getTokenFromConnectAPI(reqData, function (err, statusCode, data) {
		if (err) {
			logger.error("Error in Login service (startLoginProcess()) " + err);
			return cb(err, statusCode);
		} else {
			reqData.orion_access_token = data[orionApiResponseKeys.orionAccessToken];
			var expire_time = data[orionApiResponseKeys.orionExpireTime]; 
			thisService.authenticateWithConnectAndGetEclipseToken(reqData, function (err, statusCode, data) {
				if(err){
					logger.error("Error in Login service (startLoginProcess()) " + err);
					return cb(err, statusCode);
				}else{
					data.expires_in = expire_time;
					logger.info("Login service completed successfully (startLoginProcess())");
					return cb(null, statusCode, data );
				}
			});
		}
	});
};

LoginService.prototype.authenticateWithConnectAndGetEclipseToken = function (reqData, cb) {
	logger.info("Orion connect token authentication service called (authenticateWithConnectAndGetEclipseToken())");
	var thisService = this;
	var body = {
		authorizationHeaders: thisService.HEADER_KEY_SESSION +" "+ reqData.orion_access_token
	};

	this.getUserDetailFromConnectAPI(body, function (err, statusCode, data) {
		if (err) {
			logger.error("Error in Orion connect token authentication service (authenticateWithConnectAndGetEclipseToken()) "+ err);
			return cb(err, statusCode);
		} else {
			var orionUserId = data.userId;
			reqData.orionUserId = orionUserId;
			thisService.generateEclipseTokenFromUserDetail(reqData, function (err, statusCode, data) {
				if (err) {
					logger.error("Error in Orion connect token authentication service (authenticateWithConnectAndGetEclipseToken()) "+ err);
					return cb(err, statusCode);
				} else {
					reqData.eclipse_token = data;
					thisService.prepareUserSessionDataAndStoreInSharedCache(reqData, function(err, statusCode, data){
						if(err){
							logger.error("Error in Orion connect token authentication service (authenticateWithConnectAndGetEclipseToken()) "+ err);
							return cb(err, statusCode);
						}
						var responseData = {
							eclipse_access_token: reqData.eclipse_token,
							orion_access_token: reqData.orion_access_token
						};
						logger.info("Orion connect token authentication service completed successfully (authenticateWithConnectAndGetEclipseToken())");
						return cb(null, statusCode, responseData );
					});
				}
			});
		}
	});
};

LoginService.prototype.generateEclipseTokenFromUserDetail = function (reqData, cb) {
	logger.info("JWT token generation service called (generateEclipseTokenFromUserDetail())");
	var orionUserId = reqData.orionUserId;
	var actualUserId = null;
	if(reqData.actualUserId){
		actualUserId = reqData.actualUserId;
	}
	firmService.getDefaultFirmIdUsingConnectUserId(reqData, function (err, statusCode, firmResult) {
		if (err) {
			logger.error("Error in JWT token generation service (generateEclipseTokenFromUserDetail()) " + err);
			return cb(err, statusCode);
		} else {
			var dataToUserToken = {
				userId: firmResult.Id,
				firmId: firmResult.firmId
			};
			if(actualUserId){
				dataToUserToken["actualUserId"] = actualUserId;
			}
			reqData.firmId = firmResult.firmId;
			reqData.userId = firmResult.Id;
			logger.debug("token data" + JSON.stringify(dataToUserToken));
			tokenService.generateToken(dataToUserToken, function (err, statusCode, data) {
				if (err) {
					logger.error("Error in JWT token generation service (generateEclipseTokenFromUserDetail()) " + err);
					return cb(err, statusCode);
				} else {
					var generatedToken = data;
					reqData.eclipse_token = generatedToken;
					logger.info("JWT token generation service completed successfully (generateEclipseTokenFromUserDetail())");
					cb(null, statusCode, data);
				}
			});		
		}
	});
};

LoginService.prototype.prepareUserSessionDataAndStoreInSharedCache = function(reqData, cb){
	logger.info("Prepare and store user session data in cache service called (prepareUserSessionDataAndStoreInSharedCache())");
	var thisService = this;
	this.associateFirmDBConnectionWithReq(reqData, function (err, statusCode, data) {
		if (err) {
			logger.error(err);
			return cb(err, statusCode);
		} else {
			reqData.reqId = data;
			userService.getLogInUserRoleAndTeam(reqData,function(err,statusCode,roleTeamResult){
				if(err){
					logger.error("getting LogIn User role and team"+err);
					return cb(err, statusCode);
				}
				if(roleTeamResult && roleTeamResult.length > 0){
					userService.getUserDataForUserSession(reqData, function (err, statusCode, data) {
						if (err) {
							logger.error("Error in store user session data in cache service (prepareUserSessionDataAndStoreInSharedCache()) " + err);
							return cb(err, statusCode);
						} else {
							if(data && data.eclipseUserId){
							reqData.userSession = data;
							thisService.putUserSessionInSharedCache(reqData, function (err, statusCode, data) {
								if (err) {
									logger.error("Error in store user session data in cache service (prepareUserSessionDataAndStoreInSharedCache()) " + err);
									return cb(err, statusCode);
								} else {
									logger.info("Prepare and store user session data in cache service completed successfully (prepareUserSessionDataAndStoreInSharedCache())");
									cb(null, statusCode, {});
								}
							});
						}else{
							logger.info("User Can't log in as no he is inactive ");
							return cb(messages.inactiveUser,httpResponseCodes.FORBIDDEN);
						}
						}
					});
				}else{
					logger.info("User Can't log in as no active team and role associated to it ");
					return cb(messages.noRoleTeamAssociate,httpResponseCodes.FORBIDDEN);
				}
			});
		}
	});
};

LoginService.prototype.getUserDetailFromConnectAPI = function (data, cb) {
	logger.info("Get user detail from orion connect service called (getUserDetailFromConnectAPI())");
	var authorization = data.authorizationHeaders;
	var self = this;
	
	var url = {
		url: constants.api.userDetail,
		headers: {
			'Authorization': authorization
		},
		timeout : self.CONNECT_API_TIMEOUT
	};
	request.get(url, function (err, response, body) {
		if (err) {
			logger.error("Error in get user detail from orion connect service (getUserDetailFromConnectAPI())" + err);
			return cb(err, httpResponseCodes.INTERNAL_SERVER_ERROR);
		}
		if(response.statusCode !== httpResponseCodes.SUCCESS){
			return cb(response[orionApiResponseKeys.errorMessage], response.statusCode, null);
		}
		try{
			body = JSON.parse(body);
		}catch(e){
			logger.error("Error in get user detail from orion connect service (getUserDetailFromConnectAPI())" + err);
			return cb(messages.jsonParserError, responseCodes.INTERNAL_SERVER_ERROR);
		}
		logger.info("Get user detail from orion connect service completed successfully (getUserDetailFromConnectAPI())");
		cb(err, response.statusCode, body);
	});
};

LoginService.prototype.getTokenFromConnectAPI = function (data, cb) {
	logger.info("Verify token with orion connect (getTokenFromConnectAPI())");
	
	var self = this;
	
	var authorization = data.authorizationHeaders;
	var url = {
		url: constants.api.logIn,
		headers: {
			'Authorization': authorization
		},
		timeout : self.CONNECT_API_TIMEOUT
	};

	request.get(url, function (err, response, data) {
		logger.info("Get details from orion connect API");
		if (err) {
			logger.error("Error in connecting orion connect API" + err);
			return cb(err, httpResponseCodes.INTERNAL_SERVER_ERROR);
		}
		if(response.statusCode !== httpResponseCodes.SUCCESS){
			return cb(response[orionApiResponseKeys.errorMessage], response.statusCode, null);
		}
		var result;
		try{
			result = JSON.parse(data);
		}catch(e){
			logger.error("Error in JSON pasring" + e);
			return cb(messages.jsonParserError, responseCodes.INTERNAL_SERVER_ERROR);
		}
		cb(err, response.statusCode, result);
	});

};

LoginService.prototype.putUserSessionInSharedCache = function (data, cb) {
	logger.info("Update session in shared cache service called (putUserSessionInSharedCache())");
	var firmId = data.firmId;
	var token = data.eclipse_token;
	data.userSession.firmId = firmId;
	var loggedInUser = data.userSession;
	var expireTime = parseInt(constants.token().exp);
	loggedInUser["connect_token"] = data.orion_access_token;
	loggedInUser["expire_time"] = constants.token();
	sharedCache.put(token, JSON.stringify(loggedInUser), function (err, data) {
		if (err) {
			logger.error(err);
			cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		} else {
			logger.debug("Data put into shared cache" + JSON.stringify(loggedInUser));
			cb(null, responseCodes.SUCCESS);
		}
	}, expireTime);
	logger.debug("the user detail we have is "+JSON.stringify(data));
	
};

LoginService.prototype.associateFirmDBConnectionWithReq = function(reqData, cb){
	logger.info("Associating Connection object with req for user trying to log in (associateFirmDBConnectionWithReq())");
	dbConnectionService.getDbConnectionForFirm(reqData, function(err, data){
		if(err){
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}else{
			logger.debug("following reqId created" + data);
			cb(null, responseCodes.SUCCESS, data);
		}
	});		
};

LoginService.prototype.logInAs = function(reqData, cb){
	logger.info("start service  (logInAs())");
	var thisService = this;
	if(reqData.user.actualUserId){
		logger.info("user already loginAs  (logInAs())");
		return cb(messages.alreadyLogInAs, responseCodes.BAD_REQUEST);
	}else{
		var actualUserId = reqData.user.userId;
		var tempUserId = reqData.userId;
		reqData.userId = actualUserId;
		var tempFirmId = null;
		if(reqData.firmId){
			tempFirmId = reqData.firmId;
		}else{
			tempFirmId = reqData.user.firmId;
			reqData.firmId = tempFirmId;
		}
		logInDao.getUserFirm(reqData, function(err, result){
			if(err){
				logger.error(err);
				return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
			}
			if(result && result.length>0){
				if(result[0].Id === tempUserId && result[0].firmId === reqData.user.firmId){
					logger.info("User already login with same user in same firm (logInAs())");
					return cb(messages.alreadyLogInWithSameFirm, responseCodes.BAD_REQUEST);
				}else{
					reqData.userId = tempUserId;
					reqData.firmId = tempFirmId;
					logInDao.getUserFirm(reqData, function(err, result){
						if(err){
							logger.error(err);
							return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
						}
						if(result && result.length>0){
							var orionUserId = result[0].orionConnectExternalId;
							reqData.orionUserId = orionUserId;
							reqData.actualUserId = actualUserId;
							thisService.generateEclipseTokenFromUserDetail(reqData, function (err, statusCode, data) {
								if (err) {
									logger.error("Error in Orion connect token authentication service (logInAs()) "+ err);
									return cb(err, statusCode);
								} else {
									reqData.eclipse_token = data;
									var oldEclipseToken = reqData.token;
									var orion_access_token = null;
									sharedCache.get(reqData.token,  function(err, data){
										if(err || !data){
											logger.error("Error in get token (logInAs())" + err);
										}else{
											data = JSON.parse(data);
											reqData.orion_access_token = data.connect_token;
											reqData.expire_time = data.expire_time;
											thisService.prepareUserSessionDataAndStoreInSharedCache(reqData, function(err, statusCode, result){
												data.logInAsToken = []
												data.logInAsToken.push(reqData.eclipse_token);
												if(err){
													logger.error("Error in Orion connect token authentication service (logInAs()) "+ err);
													return cb(err, statusCode);
												}
												sharedCache.put(oldEclipseToken, JSON.stringify(data), function (err, data) {
													if (err) {
														logger.error(err);
														cb(err, responseCodes.INTERNAL_SERVER_ERROR);
													} else {
														logger.debug("Data put into shared cache" + data);
														cb(null, responseCodes.SUCCESS);
													}
												});
												var responseData = {
													eclipse_access_token: reqData.eclipse_token,
													orion_access_token: reqData.orion_access_token,
													expire_time: constants.tokenExpireMilliSec
												};
												logger.info("Orion connect token authentication service completed successfully (logInAs())");
												return cb(null, statusCode, responseData );
											});
										}
									});

								}
							});
						}else{
							logger.info("User firm association not found"+reqData.firmId);
							return cb(messages.userFirmAssociationNotFound, responseCodes.UNPROCESSABLE);
						}
					});
				}
			}else{
				logger.info("User do not have permission to LogIn as In this firm"+reqData.firmId);
				return cb(messages.NoPermissionForLoginAs, responseCodes.UNAUTHORIZED);
			}
		});	
	}
};
LoginService.prototype.logInAsRevert = function(reqData, cb){
	logger.info("start service  (logInAsRevert())");
	var self = this;
	if(reqData.user.actualUserId){
		var tempUser = {id :reqData.user.actualUserId,reqId:reqData.reqId }
		userDao.get(tempUser,function(err,result){
			if(err){
				logger.error("Error in Orion connect token authentication service (logInAsRevert()) "+ err);
				return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
			}
			reqData.orionUserId = result[0].orionConnectExternalId;
		
		self.generateEclipseTokenFromUserDetail(reqData, function (err, statusCode, data) {
			if (err) {
				logger.error("Error in Orion connect token authentication service (logInAsRevert()) "+ err);
				return cb(err, statusCode);
			} else {
				reqData.eclipse_token = data;
				self.prepareUserSessionDataAndStoreInSharedCache(reqData, function(err, statusCode, data){
					if(err){
						logger.error("Error in Orion connect token authentication service (logInAsRevert()) "+ err);
						return cb(err, statusCode);
					}
					sharedCache.get(reqData.token,function(err,data){
						if(err){
							logger.error("Not able to get login as token from shared cache(logInAsRevert()) "+ err);
							return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
						}
						var tokenDetail = JSON.parse(data);
						var responseData = {
							eclipse_access_token: reqData.eclipse_token,
							orion_access_token: tokenDetail.connect_token,
							expire_time: constants.tokenExpireMilliSec
						};
						sharedCache.del(reqData.token,function(err,data){
							if(err){
								logger.error("Not able to remove login as token from shared cache(logInAsRevert()) "+ err);
								return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
							}
							logger.info("Orion connect token authentication service completed successfully (logInAsRevert())");
							return cb(null, statusCode, responseData );
						});
					});
				});
			}
		});
	});
	}else{
		return cb(messages.notLoggedInAs,responseCodes.BAD_REQUEST);
	}
	
};
LoginService.prototype.getLoggedinUser = function(reqData, cb){
	userService.getUserDetail(reqData, function (err, status, user) {
		var roleId = user.role.id;
		var firmId = reqData.user.firmId;
		var actualUserId = null;
		if(reqData.user.actualUserId){
			actualUserId = reqData.user.actualUserId;
		}
		reqData.firmId = firmId;
		firmDao.getEclipseFirm(reqData,function(err,result){
			if(err){
				logger.error("Get logged in user firm Detail(getLoggedinUser()) "+ err);
				return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
			}
			var firmName = result[0].name;
			var firmLogo = result[0].path;
			reqData.id = roleId;
			roleService.getRoleDetail(reqData, function(err,code,result){
				if(err){
					logger.error("Get logged in user firm Detail(getLoggedinUser()) "+ err);
					return cb(err, code);
				}
				var userRolePrivilege = result;
				var loggedInUser = {};
				loggedInUser.id = user.id;
				loggedInUser.actualUserId = actualUserId;
				loggedInUser.name = user.name;
				loggedInUser.userLogo = user.userLogo;
				loggedInUser.status = user.status;
				loggedInUser.email = user.email;
				loggedInUser.userLoginId = user.userLoginId;
				loggedInUser.role = userRolePrivilege;
				loggedInUser.teams = user.teams;
				loggedInUser.firmId = firmId;
				loggedInUser.firmName = firmName;
				loggedInUser.firmLogo = firmLogo;
				loggedInUser.startDate = user.startDate;
				loggedInUser.expireDate = user.expireDate;
				loggedInUser.isDeleted = user.isDeleted;
				loggedInUser.createdOn = user.createdOn;
				loggedInUser.createdBy = user.createdBy;
				loggedInUser.editedOn = user.editedOn;
				loggedInUser.editedBy = user.editedBy;
				return cb(err, status, loggedInUser);
			});
		});
	});
};
module.exports = LoginService;
