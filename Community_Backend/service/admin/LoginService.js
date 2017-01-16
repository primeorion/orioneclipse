"use strict";

var moduleName = __filename;
var request = require("request");
var util = require('util');

var config = require('config');
var env = config.env.name;
var eclipseProperties = config.env.prop.orion["eclipse"];
var UserService = require('service/admin/UserService.js');
var CommunityUserService = require('service/community/UserService.js');
var FirmService = require('service/admin/FirmService.js');
var TokenService = require('service/admin/TokenService.js');
var sharedCache = require('service/cache').shared;
var localCache = require('service/cache').local;
var logInDao = new(require('dao/admin/LogInDao.js'))();
var firmDao = new(require('dao/admin/FirmDao.js'))();
var userDao = new(require('dao/admin/UserDao.js'))();
var dbConnectionService = require('service/dbpool/DBConnectionService.js');
var logger = require('helper/Logger.js')(moduleName);
var Util = require('service/util/Util.js');
var util = new Util();

var messages = config.messages;
var responseCodes = config.responseCode;
var httpResponseCodes = config.responseCodes;
var constants = config.orionConstants;
var orionApiResponseKeys = constants.orionApiResponseKey;

var userService = new UserService();
var firmService = new FirmService();
var tokenService = new TokenService();
var commnunityUserService = new CommunityUserService();

var LoginService = function () {
	this.HEADER_KEY_SESSION = "Session";
	this.HEADER_KEY_BASIC = "Basic";
	this.CONNECT_API_TIMEOUT = 100000;
};

LoginService.prototype.startLoginProcess = function (reqData, cb, tokenName) {
	logger.info("Login service called (startLoginProcess())" + JSON.stringify(reqData));
	var thisService = this;
	this.getTokenFromConnectAPI(reqData, function (err, statusCode, data) {
		if (err) {
			logger.error("Error in Login service (startLoginProcess()) " + err);
			return cb(err, statusCode);
		} else {
			reqData.orion_access_token = data[orionApiResponseKeys.orionAccessToken];
			var expire_time = data[orionApiResponseKeys.orionExpireTime];
			thisService.authenticateWithConnectAndGetCommunityToken(reqData, function (err, statusCode, data) {
				if (err) {
					logger.error("Error in Login service (startLoginProcess()) " + err);
					return cb(err, statusCode);
				} else {
					data.expires_in = expire_time;
					logger.info("Login service completed successfully (startLoginProcess())");
					return cb(null, statusCode, data);
				}
			}, tokenName);
		}
	});
};

LoginService.prototype.authenticateWithConnectAndGetCommunityToken = function (reqData, cb, tokenName) {
	logger.info("Orion connect token authentication service called (authenticateWithConnectAndGetCommunityToken())");
	var thisService = this;
	var body = {
		authorizationHeaders: thisService.HEADER_KEY_SESSION + " " + reqData.orion_access_token
	};

	this.getUserDetailFromConnectAPI(body, function (err, statusCode, data) {
		if (err) {
			logger.error("Error in Orion connect token authentication service (authenticateWithConnectAndGetCommunityToken()) " + err);
			return cb(err, statusCode);
		} else {
			var orionUserId = data.userId;
			reqData.orionUserId = orionUserId;
			reqData.loginUserId = data.loginUserId;
			thisService.generateCommunityTokenFromUserDetail(reqData, function (err, statusCode, data) {
				if (err) {
					logger.error("Error in Orion connect token authentication service (authenticateWithConnectAndGetCommunityToken()) " + err);
					return cb(err, statusCode);
				} else {
					reqData.community_token = data;
					thisService.prepareUserSessionDataAndStoreInSharedCache(reqData, function (err, statusCode, data) {
						if (err) {
							logger.error("Error in Orion connect token authentication service (authenticateWithConnectAndGetCommunityToken()) " + err);
							return cb(err, statusCode);
						}
						var responseData = {
							community_access_token: reqData.community_token,
							orion_access_token: reqData.orion_access_token
						};
						logger.info("Orion connect token authentication service completed successfully (authenticateWithConnectAndGetCommunityToken())");
						return cb(null, statusCode, responseData);
					});
				}
			});
		}
	});
};

LoginService.prototype.generateCommunityTokenFromUserDetail = function (reqData, cb) {
	logger.info("JWT token generation service called (generateCommunityTokenFromUserDetail())");
	var self = this;
	var orionUserId = reqData.orionUserId;
	var actualUserId = null;
	if (reqData.actualUserId) {
		actualUserId = reqData.actualUserId;
	}

	userService.authenticateWithCommunity(reqData, function (err, statusCode, authResult) {
		if (err) {
			logger.error("Error in JWT token generation service (generateCommunityTokenFromUserDetail()) " + err);
			return cb(err, statusCode);
		} else {
			if (authResult && authResult.length > 0 && reqData.redirectFromEclipse == false) {
				var dataToUserToken = {
					userId: authResult[0].id
				};
				if (actualUserId) {
					dataToUserToken["actualUserId"] = actualUserId;
				}
				reqData.userId = authResult[0].id;
				reqData.eclipseDbId = authResult[0].eclipseDbId;
				logger.debug("token data" + JSON.stringify(dataToUserToken));
				tokenService.generateToken(dataToUserToken, function (err, statusCode, data) {
					if (err) {
						logger.error("Error in JWT token generation service (generateCommunityTokenFromUserDetail()) " + err);
						return cb(err, statusCode);
					} else {
						var generatedToken = data;
						reqData.community_token = generatedToken;
						logger.info("JWT token generation service completed successfully (generateCommunityTokenFromUserDetail())");
						cb(null, statusCode, data);
					}
				});
			} else {
				logger.debug('********************** in authenticate with eclipse');
				//authenticate user with eclipse
				self.authenticateWithEclipse(reqData, function (err, status, eclipseUserResult) {
					if (err) {
						return cb(err, status);
					}
					if (eclipseUserResult) {
						var dataToUserToken = {
							userId: eclipseUserResult.id
						};
						if (actualUserId) {
							dataToUserToken["actualUserId"] = actualUserId;
						}
						reqData.userId = eclipseUserResult.id;
						reqData.eclipseUserDetails = eclipseUserResult;
						logger.debug("token data" + JSON.stringify(dataToUserToken));
						tokenService.generateToken(dataToUserToken, function (err, statusCode, data) {
							if (err) {
								logger.error("Error in JWT token generation service (generateCommunityTokenFromUserDetail()) " + err);
								return cb(err, statusCode);
							} else {
								var generatedToken = data;
								reqData.community_token = generatedToken;
								logger.info("JWT token generation service completed successfully (generateCommunityTokenFromUserDetail())");
								cb(null, statusCode, data);
							}
						});
					} else {
						return cb(messages.inactiveUser, httpResponseCodes.FORBIDDEN);
					}
				});
			}
		}
	});
};

LoginService.prototype.prepareUserSessionDataAndStoreInSharedCache = function (reqData, cb) {
	logger.info("Prepare and store user session data in cache service called (prepareUserSessionDataAndStoreInSharedCache())");
	var thisService = this;
	this.associateFirmDBConnectionWithReq(reqData, function (err, statusCode, data) {
		if (err) {
			logger.error(err);
			return cb(err, statusCode);
		} else {
			reqData.reqId = data;
			if (reqData.eclipseUserDetails) {
				//it means user is from eclipse
				reqData.eclipseDbId = reqData.eclipseUserDetails.firmId;
				thisService.putUserSessionInSharedCache(reqData, function (err, statusCode, data) {
					if (err) {
						logger.error("Error in store user session data in cache service (prepareUserSessionDataAndStoreInSharedCache()) " + err);
						return cb(err, statusCode);
					} else {
						logger.info("Prepare and store user session data in cache service completed successfully (prepareUserSessionDataAndStoreInSharedCache())");
						cb(null, statusCode, {});
					}
				});
			} else {
				userService.getUserDataForUserSession(reqData, function (err, statusCode, data) {
					if (err) {
						logger.error("Error in store user session data in cache service (prepareUserSessionDataAndStoreInSharedCache()) " + err);
						return cb(err, statusCode);
					} else {
						if (data && data.communityUserId) {
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
						} else {
							logger.info("User Can't log in as no he is inactive ");
							return cb(messages.inactiveUser, httpResponseCodes.FORBIDDEN);
						}
					}
				});
			}
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
		timeout: self.CONNECT_API_TIMEOUT
	};
	request.get(url, function (err, response, body) {
		if (err) {
			logger.error("Error in get user detail from orion connect service (getUserDetailFromConnectAPI())" + err);
			return cb(err, httpResponseCodes.INTERNAL_SERVER_ERROR);
		}
		if (response.statusCode !== httpResponseCodes.SUCCESS) {
			return cb(response[orionApiResponseKeys.errorMessage], response.statusCode, null);
		}
		try {
			body = JSON.parse(body);

		} catch (e) {
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
		timeout: self.CONNECT_API_TIMEOUT
	};

	request.get(url, function (err, response, data) {
		logger.info("Get details from orion connect API");
		if (err) {
			logger.error("Error in connecting orion connect API" + err);
			return cb(err, httpResponseCodes.INTERNAL_SERVER_ERROR);
		}
		if (response.statusCode !== httpResponseCodes.SUCCESS) {
			return cb(response[orionApiResponseKeys.errorMessage], response.statusCode, null);
		}
		var result;
		try {
			result = JSON.parse(data);
		} catch (e) {
			logger.error("Error in JSON pasring" + e);
			return cb(messages.jsonParserError, responseCodes.INTERNAL_SERVER_ERROR);
		}
		cb(err, response.statusCode, result);
	});
};

LoginService.prototype.putUserSessionInSharedCache = function (data, cb) {
	logger.info("Update session in shared cache service called (putUserSessionInSharedCache())");
	var token = data.community_token;
	var loggedInUser = {};
	if (data.eclipseUserDetails) {
		if (data.eclipseUserDetails.role.roleTypeId == 1) {
			data.eclipseUserRoleId = 4;
		} else {
			data.eclipseUserRoleId = 5;
		}
		userService.getEclipseUserPrivilege(data, function (err, status, eclipsePrivilege) {
			if (err) {
				return cb(err, status);
			}
			loggedInUser['eclipseUserDetails'] = eclipsePrivilege;
			var eclipseDatabaseId = data.eclipseDatabaseId;
			var expireTime = parseInt(constants.token().exp);
			loggedInUser["connect_token"] = data.orion_access_token;
			loggedInUser["expire_time"] = constants.token();
			loggedInUser['eclipseDatabaseId'] = eclipseDatabaseId;
			sharedCache.put(token, JSON.stringify(loggedInUser), function (err, data) {
				if (err) {
					logger.error(err);
					cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
				} else {
					cb(null, responseCodes.SUCCESS);
				}
			}, expireTime);
		});
	} else {
		loggedInUser = data.userSession;
		var expireTime = parseInt(constants.token().exp);
		loggedInUser["connect_token"] = data.orion_access_token;
		loggedInUser["expire_time"] = constants.token();
		sharedCache.put(token, JSON.stringify(loggedInUser), function (err, data) {
			if (err) {
				logger.error(err);
				cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
			} else {
				cb(null, responseCodes.SUCCESS);
			}
		}, expireTime);
	}
};

LoginService.prototype.associateFirmDBConnectionWithReq = function (reqData, cb) {
	logger.info("Associating Connection object with req for user trying to log in (associateFirmDBConnectionWithReq())");
	dbConnectionService.getDbConnectionForFirm(reqData, function (err, data) {
		if (err) {
			logger.error(err);
			return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
		} else {
			logger.debug("following reqId created" + data);
			cb(null, responseCodes.SUCCESS, data);
		}
	});
};

LoginService.prototype.logInAs = function (reqData, cb) {
	logger.info("start service  (logInAs())");
	var thisService = this;
	if (reqData.user.actualUserId) {
		logger.info("user already loginAs  (logInAs())");
		return cb(messages.alreadyLogInAs, responseCodes.BAD_REQUEST);
	} else {
		var actualUserId = reqData.user.userId;
		var tempUserId = reqData.userId;
		reqData.userId = actualUserId;
		var tempFirmId = reqData.firmId;
		//reqData.firmId = reqData.user.firmId;
		logInDao.getUserFirm(reqData, function (err, result) {
			if (err) {
				logger.error(err);
				return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
			}
			if (result && result.length > 0) {
				if (result[0].Id === tempUserId && result[0].firmId === reqData.user.firmId) {
					logger.info("User already login with same user in same firm (logInAs())");
					return cb(messages.alreadyLogInWithSameFirm, responseCodes.BAD_REQUEST);
				} else {
					reqData.userId = tempUserId;
					reqData.firmId = tempFirmId;
					logInDao.getUserFirm(reqData, function (err, result) {
						if (err) {
							logger.error(err);
							return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
						}
						if (result && result.length > 0) {
							var orionUserId = result[0].orionConnectExternalId;
							reqData.orionUserId = orionUserId;
							reqData.actualUserId = actualUserId;
							thisService.generateCommunityTokenFromUserDetail(reqData, function (err, statusCode, data) {
								if (err) {
									logger.error("Error in Orion connect token authentication service (logInAs()) " + err);
									return cb(err, statusCode);
								} else {
									reqData.community_token = data;
									var oldEclipseToken = reqData.token;
									var orion_access_token = null;
									sharedCache.get(reqData.token, function (err, data) {
										if (err || !data) {
											logger.error("Error in get token (logInAs())" + err);
										} else {
											data = JSON.parse(data);
											reqData.orion_access_token = data.connect_token;
											reqData.expire_time = data.expire_time;
											thisService.prepareUserSessionDataAndStoreInSharedCache(reqData, function (err, statusCode, result) {
												data.logInAsToken = []
												data.logInAsToken.push(reqData.community_token);
												if (err) {
													logger.error("Error in Orion connect token authentication service (logInAs()) " + err);
													return cb(err, statusCode);
												}
												sharedCache.put(oldEclipseToken, JSON.stringify(data), function (err, data) {
													if (err) {
														logger.error(err);
														cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
													} else {
														logger.debug("Data put into shared cache" + data);
														cb(null, responseCodes.SUCCESS);
													}
												});
												var responseData = {
													community_access_token: reqData.community_token,
													orion_access_token: reqData.orion_access_token,
													expire_time: constants.tokenExpireMilliSec
												};
												logger.info("Orion connect token authentication service completed successfully (logInAs())");
												return cb(null, statusCode, responseData);
											});
										}
									});

								}
							});
						} else {
							logger.info("User firm association not found" + reqData.firmId);
							return cb(messages.userFirmAssociationNotFound, responseCodes.NOT_FOUND);
						}
					});
				}
			} else {
				logger.info("User do not have permission to LogIn as In this firm" + reqData.firmId);
				return cb(messages.NoPermissionForLoginAs, responseCodes.UNAUTHORIZED);
			}
		});
	}
};

LoginService.prototype.logInAsRevert = function (reqData, cb) {
	logger.info("start service  (logInAsRevert())");
	var self = this;
	if (reqData.user.actualUserId) {
		var tempUser = {
			id: reqData.user.actualUserId,
			reqId: reqData.reqId
		}
		userDao.get(tempUser, function (err, result) {
			if (err) {
				logger.error("Error in Orion connect token authentication service (logInAsRevert()) " + err);
				return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
			}
			reqData.orionUserId = result[0].orionConnectExternalId;

			self.generateCommunityTokenFromUserDetail(reqData, function (err, statusCode, data) {
				if (err) {
					logger.error("Error in Orion connect token authentication service (logInAsRevert()) " + err);
					return cb(err, statusCode);
				} else {
					reqData.community_token = data;
					self.prepareUserSessionDataAndStoreInSharedCache(reqData, function (err, statusCode, data) {
						if (err) {
							logger.error("Error in Orion connect token authentication service (logInAsRevert()) " + err);
							return cb(err, statusCode);
						}
						sharedCache.get(reqData.token, function (err, data) {
							if (err) {
								logger.error("Not able to get login as token from shared cache(logInAsRevert()) " + err);
								return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
							}
							var tokenDetail = JSON.parse(data);
							var responseData = {
								community_access_token: reqData.community_token,
								orion_access_token: tokenDetail.connect_token,
								expire_time: constants.tokenExpireMilliSec
							};
							sharedCache.del(reqData.token, function (err, data) {
								if (err) {
									logger.error("Not able to remove login as token from shared cache(logInAsRevert()) " + err);
									return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
								}
								logger.info("Orion connect token authentication service completed successfully (logInAsRevert())");
								return cb(null, statusCode, responseData);
							});
						});
					});
				}
			});
		});
	} else {
		return cb(messages.notLoggedInAs, responseCodes.BAD_REQUEST);
	}
};

LoginService.prototype.getLoggedinUser = function (reqData, cb) {
	userService.getUserDetail(reqData, function (err, status, user) {
		var firmId = reqData.user.firmId;
		reqData.firmId = firmId;
		firmDao.getEclipseFirm(reqData, function (err, result) {
			if (err) {
				logger.error("Get logged in user firm Detail(getLoggedinUser()) " + err);
				return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
			}
			var firmName = result[0].name;
			var loggedInUser = {
				id: user.id,
				name: user.name,
				status: user.status,
				email: user.email,
				userLoginId: user.userLoginId,
				role: user.role,
				teams: user.teams,
				firmId: firmId,
				firmName: firmName,
				startDate: user.startDate,
				expireDate: user.expireDate,
				isDeleted: user.isDeleted,
				createdOn: user.createdOn,
				createdBy: user.createdBy,
				editedOn: user.editedOn,
				editedBy: user.editedBy
			}
			return cb(err, status, loggedInUser);
		});
	});
};

LoginService.prototype.getCommunityLoggedinUser = function (reqData, cb) {
	var communityToken = localCache.get(reqData.reqId).session.token;
	sharedCache.get(communityToken, function (err, tokenData) {
		var eclipseUserDetailsInfo = JSON.parse(tokenData);
		if (eclipseUserDetailsInfo.eclipseUserDetails) {
			var info = eclipseUserDetailsInfo.eclipseUserDetails;
			var roleType = info.roleName;
			var result = {
                "id": info.id,
                "roleId": 4,
                "roleType": 'Advisor('+ roleType +')',
                "orionConnectExternalId": '',
                "name": info.name,
                "isDeleted": 0,
                "loginUserId": info.userLoginId,
                "email": info.email,
                "createdDate": info.createdOn,
                "createdBy": info.createdBy,
                "editedDate": info.editedOn,
                "editedBy": info.editedBy,
                "eclipseDatabaseId": info.firmId,
                "eclipseDatabaseName": info.firmName,
                "path": "",
                "url": info.url
            };
			return cb(null, responseCodes.SUCCESS, result);
		} else {
			commnunityUserService.getLoggedinUser(reqData, function (err, status, user) {
				if (user) {
					return cb(null, responseCodes.SUCCESS, user);
				} else {
					return cb(messages.userNotFound, responseCodes.NOT_FOUND);
				}
			});
		}
	})
};

LoginService.prototype.verifyConnectTokenAndReturnEclipseToken = function (reqData, cb) {
	logger.debug('verify connect token and return eclipse token service called (verifyConnectTokenAndReturnEclipseToken())');
	if (reqData.orion_access_token) {
		var authorizationHeaders = "Session " + reqData.orion_access_token;
		var url = {
			url: 'http://' + eclipseProperties.host + ':' + eclipseProperties.port + '/v1/admin/token',
			headers: {
				'Authorization': authorizationHeaders
			}
		};
		request.get(url, function (err, response, body) {
			logger.debug('response ' + JSON.stringify(response));
			if (response.statusCode != 200) {
				return cb(response);
			} else {
				return cb(null, response);
			}
		});
	} else {
		var communityToken = localCache.get(reqData.reqId).session.token;
		logger.debug('community token ' + communityToken);
		sharedCache.get(communityToken, function (err, tokenData) {
			var connect_token = JSON.parse(tokenData).connect_token;
			var authorizationHeaders = "Session " + connect_token;
			var url = {
				url: 'http://' + eclipseProperties.host + ':' + eclipseProperties.port + '/v1/admin/token',
				headers: {
					'Authorization': authorizationHeaders
				}
			};
			request.get(url, function (err, response, body) {
				if (response.statusCode != 200) {
					return cb(response);
				} else {
					return cb(null, response);
				}
			});
		});
	}
};

LoginService.prototype.authenticateWithEclipse = function (reqData, cb) {
	logger.debug('authenticate with eclipse service called (authenticateWithEclipse())');
	var self = this;
	self.verifyConnectTokenAndReturnEclipseToken(reqData, function (err, token) {
		if (err) {
			logger.error('error in verifying connect token ' + JSON.stringify(err));
			var errorBody = JSON.parse(err.body);
			return cb(errorBody.message, err.statusCode);
		}
		var tokenBody = JSON.parse(token.body);
		var eclipseToken = tokenBody.eclipse_access_token;
		var authorizationHeaders = "Session " + eclipseToken;
		util.getEclipseUserRoles(reqData, eclipseToken, function (err, status, eclipseData) {
			if (err) {
				return cb(err, status);
			}
			return cb(null, responseCodes.SUCCESS, eclipseData);
		});
	});
}
module.exports = LoginService;