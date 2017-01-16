"use strict";

var moduleName = __filename;


var request = require('request');
var helper = require('helper');
var config = require('config');

var sharedCache = require('service/cache/').shared;
var localCache = require('service/cache/').local;
var UserDao = require('dao/admin/UserDao.js');
var TeamDao = require('dao/admin/TeamDao.js');
var RoleDao = require('dao/admin/RoleDao.js');
var FirmDao = require('dao/admin/FirmDao.js');
var UserConverter = require("converter/user/UserConverter.js");
var RoleConverter = require("converter/role/RoleConverter.js");

var constant = config.orionConstants;
var messages = config.messages;
var responseCode = config.responseCode;
var logger = helper.logger(moduleName);


var userConverter = new UserConverter();
var roleConverter = new RoleConverter();
var userDao = new UserDao();
var teamDao = new TeamDao();
var roleDao = new RoleDao();
var firmDao = new FirmDao();

var UserService = function () { };

UserService.prototype.addUser = function (data, cb) {
	logger.info("Add user service called (addUser())");
	var self = this;
	data.loginUserId = data.firstName;
	self.searchUserFromConnect(data,function(err,status,searchResult){
		if(err){
			logger.error("search user from connect(addUser())" + err);
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		}
		if(searchResult && searchResult.length > 0){
			logger.info("Search result found from connect (addUser())");
			self.compareInputUserIdWithConnectUserId(searchResult,data.orionConnectExternalId,function(valid){
				if(valid){
					userDao.get(data, function (err, fetched) {
						if (err) {
							logger.error("getting user (addUser())" + err);
							return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
						}
						if (typeof fetched !== "undefined" && fetched.length > 0) {
							logger.info("User already exist (addUser())");
							return cb(messages.userAlreadyExist, responseCode.UNPROCESSABLE);
						} else {
							if (data.teamIds && data.teamIds.length > 0 && data.roleId) {
							} else {
								data.status = 0;
							}
							var role = {id : data.roleId,reqId : data.reqId};
							roleDao.get(role,function(err,found){
								if(err){
									if (data.roleId){
										logger.error("Getting role (addUser())" + err);
										return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
									}
								}
								if (typeof found !== "undefined" && found.length > 0) {
									if(found[0].status === 0){
										data.status = 0;
									}
									self.isteamExists(data,function(err,status,result,teamStatus){
										if(err){
											logger.error("Team doesnot exist (addUser())"+err);
											return cb(err, status,result);
										}
										if(teamStatus === 0){
											data.status = 0;
										}
										userDao.add(data, function (err, added) {
											if (err) {
												logger.error("Adding user (addUser())" + err);
												return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
											}
											data.userId = added.insertId;
											userDao.assignUserToTeam(data, function (err, teamAssigned) {
												if (err) {
													if (data.teamIds && data.teamIds.length > 0) {
														logger.error("Assigning user to team (addUser())" + err);
														return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
													}
												}
												data.id = added.insertId;
												userDao.assignUserToFirm(data, function (err, firmAssigned) {
													if (err) {
															logger.error("Assigning user to firm (addUser())" + err);
															return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
														
													}
													
													self.getUserDetail(data, function (err, code, result) {
														if (err) {
															logger.error("Getting user detail (addUser())" + err);
															return cb(err, code);
														}
														logger.info("User created successfully (addUser())");
														return cb(null, responseCode.CREATED, result);
													});
												});
											});
										});
									});

								}else{
									logger.error("Role does not exist with id (addUser())" + data.roleId);
									return cb(messages.roleNotFound, responseCode.NOT_FOUND);
								}
							});	
						}
					});
				}else{
					logger.info("User Not found on connect  (addUser())");
					return cb(messages.userNotFoundOnConnect, responseCode.NOT_FOUND);
				}
			});
		}else{
			logger.info("User Not found on connect  (addUser())");
			return cb(messages.userNotFoundOnConnect, responseCode.NOT_FOUND);
		}
	});
};

UserService.prototype.updateUser = function (data, cb) {
	logger.info("Update user service called (updateUser())");
	var self = this;
	var role = {id : data.roleId,reqId : data.reqId};
	roleDao.get(role,function(err,found){
		if(err){
			if (data.roleId){
				logger.error("Getting role (updateUser())" + err);
				return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
			}
		}
		if (typeof found !== "undefined" && found.length > 0) {
			if(found[0].status === 0){
				data.status = 0;
			}
			self.isteamExists(data,function(err,status,result,teamStatus){
				if(err){
					logger.error("Team doesnot exist (updateUser())"+err);
					return cb(err, status,result);
				}
					/*if(teamStatus === 0){
						data.status = 0;
					}*/
					userDao.update(data, function (err, updated) {
						if (err) {
							logger.error("updating user (updateUser())" + err);
							return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
						}
						if (updated.affectedRows > 0) {
							var teamIdsToAssociate = [];
							var counter = 0;

							if (data.teamIds) {
								if((data.teamIds).length > 0 ){
									data.userId = data.id;
									logger.debug("teamIds to associate are" + JSON.stringify(data.teamIds));
									userDao.assignUserToTeam(data, function (err, userTeamUpdated) {
										if (err) {
											logger.error("assigning user teams (updateUser())" + err);
											return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);

										}
										userDao.removeTeamfromUser(data, function (err, teamRemoved) {
											if (err) {
												logger.error("removing user teams (updateUser())" + err);
												return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
											}
											logger.info("User updated successfully (updateUser())");
											self.getUserDetail(data, function (err, code, result) {
												if (code === responseCode.INTERNAL_SERVER_ERROR || code === responseCode.NOT_FOUND) {
													logger.error("Getting user detail (updateUser())" + err);
													return cb(err, code);
												}
												return cb(null, responseCode.SUCCESS, result);
											});
										});
									});
								}else{
									userDao.removeTeamfromUser(data, function (err, teamRemoved) {
										if (err) {
											logger.error("removing user teams (updateUser())" + err);
											return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
										}
										logger.info("User updated successfully (updateUser())");
										self.getUserDetail(data, function (err, code, result) {
											if (code === responseCode.INTERNAL_SERVER_ERROR || code === responseCode.NOT_FOUND) {
												logger.error("Getting user detail (updateUser())" + err);
												return cb(err, code);
											}
											return cb(null, responseCode.SUCCESS, result);
										});
									});
								}
							} else {
								logger.info("User updated successfully (updateUser())");
								self.getUserDetail(data, function (err, code, result) {
									if (code === responseCode.INTERNAL_SERVER_ERROR || code === responseCode.NOT_FOUND) {
										logger.error("Getting user detail (updateUser())" + err);
										return cb(err, code);
									}
									return cb(null, responseCode.SUCCESS, result);
								});
							}

						} else {
							logger.info("User not Found (updateUser())");
							return cb(messages.userNotFound, responseCode.NOT_FOUND);
						}
					});
				});
		}else{
			logger.error("Role does not exist with id (updateUser())" + data.roleId);
			return cb(messages.roleNotFound, responseCode.NOT_FOUND);
		}
	});
};

UserService.prototype.getUserList = function (data, cb) {
	logger.info("Get users list service called (getUserList())");
	var self = this;
	userDao.getList(data, function (err, fetched) {
		if (err) {
			logger.error("Getting user list (getUserList())" + err);
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		}
		logger.info("Preparing user list for UI (getUserList())");
		userConverter.getModelToResponse(fetched, function (err,result) {
			logger.info("User list returned successfully (getUserList())");
			return cb(null, responseCode.SUCCESS, result);
		});
	});
};

UserService.prototype.getUserDetail = function (data, cb) {
	logger.info("Get user details service called (getUserDetail())");
	userDao.getDetail(data, function (err, fetched) {

		if (err) {
			logger.error("Getting user detail (getUserDetail())" + err);
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		} if (fetched.length > 0) {
			logger.info("Preparing user list for UI (getUserDetail())");
			userConverter.getModelToResponse(fetched, function (err,result) {
				if (result.length > 1) {
					return cb(null, responseCode.SUCCESS, result);
				} else {
					return cb(null, responseCode.SUCCESS, result[0]);
				}
			});
		} else {
			logger.info("User not found (getUserDetail())" + data.id);
			return cb(messages.userNotFound, responseCode.NOT_FOUND);
		}
	});
};

UserService.prototype.deleteUser = function (data, cb) {
	logger.info("Delete user service called (deleteUser())");
	if (data.id) {
		userDao.delete(data, function (err, deleted) {
			if (err) {
				logger.error("Deleting user (deleteUser())" + err);
				return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
			}
			if (deleted.affectedRows > 0) {
				userDao.removeTeamfromUser(data, function(err, rs){
					if (err) {
						logger.error("removing team associations user (deleteUser())" + err);
						return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
					}
					userDao.removeUserFromFirm(data, function(err, rs){
						if (err) {
							logger.error("removing user from firm (deleteUser())" + err);
							return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
						}
						logger.info("User deleted successfully (deleteUser())" + data.id);
						return cb(null, responseCode.SUCCESS, { "message": messages.userDeleted });							
					})
				})
			} else {
				logger.info("User not found (deleteUser())" + data.id);
				return cb(messages.userNotFoudOrDeleted, responseCode.NOT_FOUND);
			}
		});
	} else {
		logger.info("Missing required parameters (deleteUser())" + data.id);
		return cb(messages.missingParameters, responseCode.BAD_REQUEST)
	}
};

UserService.prototype.assignUserToTeam = function (data, cb) {
	logger.info("Assign user to team service called (assignUserToTeam())");
	userDao.get(data, function (err, userFound) {
		if (err) {
			logger.error("Getting user (assignUserToTeam())" + err);
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		}
		if (userFound && userFound.length > 0) {
			userDao.assignUserToTeam(data, function (err, assigned) {
				if (err) {
					logger.error("Assingning user to team (assignUserToTeam())" + err);
					return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
				}
				logger.info("User assigned successfully to team (assignUserToTeam())");
				return cb(null, responseCode.SUCCESS, { "message": messages.teamAssigned });
			});
		} else {
			logger.info("User not found (assignUserToTeam())" + data.id);
			return cb(messages.userNotFound, responseCode.NOT_FOUND);
		}
	});
};

UserService.prototype.assignRoleToUser = function (data, cb) {
	logger.info("Assign role to user service called (assignRoleToUser())");
	roleConverter.userModelToRoleEntity(data, function (err, roleEntity) {

		data.RoleEntityBean = roleEntity;
		roleDao.get(data.RoleEntityBean, function (err, roleFound) {
			if (err) {
				logger.error("Getting role (assignRoleToUser())" + err);
				return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
			}
			if (roleFound && roleFound.length > 0) {
				userDao.get(data, function (err, userFound) {
					if (err) {
						logger.error("Getting user (assignRoleToUser())" + err);
						return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
					}
					if (userFound && userFound.length > 0) {
						userDao.updateUserRole(data, function (err, updated) {
							if (err) {
								logger.error("updating userRole (assignRoleToUser())" + err);
								return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
							}
							if (updated.affectedRows > 0) {
								logger.info("Role assigned updated successfully to user (assignRoleToUser())");
								return cb(null, responseCode.SUCCESS, { "message": messages.roleAssignedUpdated });
							} else {
								userDao.assignRoleToUser(data, function (err, assigned) {
									if (err) {
										logger.error("Assigning role to user (assignRoleToUser())" + err);
										return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
									}
									logger.info("Role assigned successfully to user (assignRoleToUser())");
									return cb(null, responseCode.SUCCESS, { "message": messages.roleAssigned });
								});
							}
						});

					} else {
						logger.info("User not found (assignRoleToUser())" + data.id);
						return cb(messages.userNotFound, responseCode.NOT_FOUND);
					}
				});
			} else {
				logger.info("Role not found (assignRoleToUser())" + data.roleId);
				return cb(messages.roleNotFound, responseCode.NOT_FOUND);
			}
		});
	});
};

UserService.prototype.assignUserToFirm = function (inputData, cb) {
	logger.info("Assign user to firm service called (assignUserToFirm())");
	firmDao.get(data, function (err, firmFound) {
		if (err) {
			logger.error("Getting firm (assignUserToFirm())" + err);
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		}
		if (firmFound && firmFound.length > 0) {
			userDao.get(data, function (err, userFound) {
				if (err) {
					logger.error("Getting user (assignUserToFirm())" + err);
					return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
				}
				if (userFound && userFound.length > 0) {
					userDao.assignUserToFirm(data, function (err, assigned) {
						if (err) {
							logger.error("Assigning user to firm (assignUserToFirm())" + err);
							return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
						}
						logger.info("User assigned successfully to firm (assignUserToFirm())");
						return cb(null, responseCode.SUCCESS, { "message": messages.firmAssigned });
					});
				} else {
					logger.info("User not found (assignUserToFirm())" + data.id);
					return cb(messages.userNotFound, responseCode.NOT_FOUND);
				}
			});
		} else {
			logger.info("Firm not found (assignUserToFirm())" + data.firmId);
			return cb(messages.firmNotFound, responseCode.NOT_FOUND);
		}
	});
};

UserService.prototype.getUserRoleandPrivilege = function (data, cb) {
	logger.info("Get user role and privileges (getUserRoleandPrivilege())");
	userDao.get(data, function (err, fetched) {
		if (err) {
			logger.error("getting user (getUserRoleandPrivilege())" + err);
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		}
		if (fetched && fetched.length > 0) {
			userDao.getUserRoleandPrivilege(data, function (err, fetched) {
				if (err) {
					logger.error("Getting user role and privileges (getUserRoleandPrivilege())" + err);
					return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
				}
				logger.info("Preparing response for user role and privileges (getUserRoleandPrivilege())");
				userConverter.userPrivilegeResponse(fetched, function (err, rolePrivilege) {
					return cb(null, responseCode.SUCCESS, rolePrivilege);
				});
			});
		} else {
			logger.info("User not Found (getUserRoleandPrivilege())");
			return cb(messages.userNotFound, responseCode.NOT_FOUND);
		}
	});
};

UserService.prototype.getUserDataForUserSession = function (data, cb) {
	logger.info("Get user data for userSession (getUserDataForUserSession())");
	userDao.getLoggedInUserWithUserId(data, function (err, results) {
		if (err) {
			logger.error("Getting user role and privilege (getUserDataForUserSession())" + err);
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		} else {
			var loggedInUser = {};
			if (results && results.length > 0) {
				var userDetails = results[0];
				loggedInUser.roleId = userDetails.roleId;
				loggedInUser.roleName = userDetails.roleType;
				loggedInUser.email = userDetails.email;
				loggedInUser.name = userDetails.name;
				loggedInUser.communityUserId = userDetails.id;
				loggedInUser.eclipseDatabaseId = userDetails.eclipseDbId;
				loggedInUser.privileges = {};
				results.forEach(function(row){
					var privilege = {};
					if(row.privilegeId && row.code){
						privilege.id = row.privilegeId;
						privilege.name = row.name;
						privilege.canAdd = row.canAdd;
						privilege.canDelete = row.canDelete;
						privilege.canUpdate = row.canUpdate;
						privilege.canRead = row.canRead;
						privilege.code = row.code;
						loggedInUser.privileges[privilege.code.toLowerCase()] = privilege;
					}
				});
			}
			logger.info("User role and privilege returned successfully (getUserDataForUserSession())" + JSON.stringify(loggedInUser));
			return cb(null, responseCode.SUCCESS, loggedInUser);
		}
	});
};

UserService.prototype.getEclipseUserPrivilege = function (data, cb) {
	logger.info("Get user data for userSession (getUserDataForUserSession())");
	userDao.getEclipseUserPrivilege(data, function (err, results) {
		if (err) {
			logger.error("Getting user role and privilege (getUserDataForUserSession())" + err);
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		} else {
			var loggedInUser = {};
			var userDetails = data.eclipseUserDetails;
			loggedInUser.id = userDetails.id;
			loggedInUser.roleId = userDetails.role.roleTypeId;
			loggedInUser.roleName = userDetails.role.roleType;
			loggedInUser.email = userDetails.email;
			loggedInUser.name = userDetails.name;
			loggedInUser.eclipseDatabaseId = userDetails.firmId;
			loggedInUser.userLoginId = userDetails.userLoginId;
			loggedInUser.firmId = userDetails.firmId;
			loggedInUser.firmName = userDetails.firmName;
			loggedInUser.url = userDetails.firmLogo;
			loggedInUser.privileges = {};
			if (results && results.length > 0) {
				results.forEach(function(row){
					var privilege = {};
					if(row.privilegeId && row.code){
						privilege.id = row.privilegeId;
						privilege.name = row.name;
						privilege.canAdd = row.canAdd;
						privilege.canDelete = row.canDelete;
						privilege.canUpdate = row.canUpdate;
						privilege.canRead = row.canRead;
						privilege.code = row.code;
						loggedInUser.privileges[privilege.code.toLowerCase()] = privilege;
					}
				});
			}
			logger.info("User role and privilege returned successfully (getUserDataForUserSession())");
			return cb(null, responseCode.SUCCESS, loggedInUser);
		}
	});
};

/*UserService.prototype.getUserDataForUserSession = function (data, cb) {
	logger.info("Get user data for userSession (getUserDataForUserSession())");

	userDao.getLoggedInUserWithUserId(data, function (err, results) {
		if (err) {
			logger.error("Getting user role and privilege (getUserDataForUserSession())" + err);
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		} else {
			var loggedInUser = {};
			if (results && results.length > 0) {
				loggedInUser.connectUserId = results[0].orionConnectExternalId;
				loggedInUser.eclipseUserId = results[0].id;
				loggedInUser.roleId = results[0].roleId;
				loggedInUser.roleName = results[0].roleName;
				loggedInUser.roleTypeId = results[0].roleTypeId;
				loggedInUser.roleType = results[0].roleType;
				loggedInUser.roleTypeBitValue = results[0].roleTypeBitValue;
				loggedInUser.privileges = {};
				var tempTeams = {};
				var teamIds = [];
				for (var i = 0; i < results.length; i++) {
					var row = results[i];
					var privilege = {};
					if(loggedInUser.roleTypeId !== 1){
						if(row.teamId){
							var teamId = row.teamId;
							var teamName = row.teamName;
							if(!tempTeams.hasOwnProperty(teamId)){
								tempTeams[teamId] = teamName;
								teamIds.push(teamId);
							}
						}
					}
					if (row.privilegeId && row.code) {
						privilege.id = row.privilegeId;
						privilege.name = row.name;
						privilege.canAdd = row.canAdd;
						privilege.canDelete = row.canDelete;
						privilege.canUpdate = row.canUpdate;
						privilege.canRead = row.canRead;
						privilege.code = row.code;
						privilege.category = row.category;
						loggedInUser.privileges[privilege.code.toLowerCase()] = privilege;
					}
				}
				loggedInUser.teamIds = teamIds;
			}
			logger.info("User role and privilege returned successfully (getUserDataForUserSession())");
			return cb(null, responseCode.SUCCESS, loggedInUser);
		}
	});
};*/

UserService.prototype.getUsers = function (fetched, cb) {
	var userIds = [];
	var userMap = {};
	fetched.forEach(function (user) {
		var userBody = {
			name: user.firstName + " " + user.lastName,
			status: user.status,
			createdOn: user.createdDate,
			isDeleted: user.isDeleted
		};
		userMap[user.orionConnectExternalId] = userBody;
	});
	return cb(null, userMap);
};

UserService.prototype.searchUserFromConnect = function (inputData, cb) {
	logger.info("Get user details from orion connect request received");
	sharedCache.get(inputData.token, function (err, data) {
		var user = {}
		if (err) {
			logger.error("Error getting token info from sharedCache (searchUserFromConnect())"+ err);
			return cb(err, responseCode.internalServerError, data);
		} else {
			var token;
			try {
				token = JSON.parse(data).connect_token;
			} catch (err) {
				logger.error("Error parsing JSON (searchUserFromConnect())"+ err);
				return cb(messages.interServerError, responseCode.INTERNAL_SERVER_ERROR, null);
			}
			logger.debug("token for which we get info from shared Cache is (searchUserFromConnect())" + token);

		}
		var reqParams = {
			url: constant.api.searchOrionUser + "/" + inputData.loginUserId,
			headers: { 'Authorization': 'Session ' + token }
		};
		logger.error("The error is: " + inputData.loginUserId);
		request(reqParams, function (err, connectResponse, data) {
			try {
				var parsedData = JSON.parse(data);
				parsedData.forEach(function(userDetails){
					var firstName = userDetails.entityName.split(',')[0];
					var secondName = '';
					if(userDetails.entityName.split(',').length > 1){
						secondName = userDetails.entityName.split(',')[1].trim();
					}
					userDetails.name = firstName + ' ' + secondName;
				});
				return cb(err, connectResponse.statusCode, parsedData);
			} catch (err) {
				logger.error("Response from connect server (searchUserFromConnect())"+err)
				return cb(messages.interServerError, responseCode.INTERNAL_SERVER_ERROR, null);
			}

		});
	});
};

UserService.prototype.compareInputUserIdWithConnectUserId = function(searchResult,id,cb){
	var isMatch = false;
	if(Array.isArray(searchResult)){
		for (var i = 0; i < searchResult.length; i++) {
			var user = searchResult[i];
			if(user.userId){
				if(user.userId === id){
					isMatch = true;
					break;
				}
			}
		}
		return cb(isMatch);
	}else{
		return cb(false);
	}
};

UserService.prototype.getAccessForUser = function(data, cb){

	userDao.getAccessForUser(data, function(err, rs){
		if (err) {
			logger.error("Getting user role and privilege (getUserDataForUserSession())" + err);
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		}
		cb(null, responseCode.SUCCESS, rs);
	});
};

UserService.prototype.getLogInUserRoleAndTeam = function(data,cb) {
	logger.info("get login User team and role call start (getLogInUserRoleAndTeam())");

	userDao.getLogInUserRoleAndTeam(data,function(err,result){
		if (err) {
			logger.error("Getting login user role and team (getLogInUserRoleAndTeam())" + err);
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		}
		cb(null, responseCode.SUCCESS, result);
	});
}

UserService.prototype.roleTypeForUser = function(data, cb){

	var token = localCache.get(data.reqId).session.token;

	if(token){
		sharedCache.get(token, function(err, result){
			if (err) {
				logger.error("Getting user role and privilege (getUserDataForUserSession())" + err);
				return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
			}
			try{
				result = JSON.parse(result);
			}catch(err){
				logger.error("Getting user role and privilege (getUserDataForUserSession())" + err);
				return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
			}
			cb(err, result);
		});		
	}

}

UserService.prototype.getUserSummary = function(data,cb){
	userDao.getUserSummary(data,function(err,result){
		if(err){
			logger.error("error fetching summary getUserSummary())"+err);
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		}
		logger.info("summary fetched successfully (getUserSummary())");
		return cb(null,responseCode.SUCCESS,result);
	});
};

UserService.prototype.isteamExists = function(data,cb){
	var teamIds = data.teamIds;
	var reqId = data.reqId;
	var teamNotFound = [];
	var counter = 0;
	var statusCounter = 0;
	if(Array.isArray(teamIds) ){
		if(teamIds.length>0){
			teamIds.forEach(function(teamId){
				var team = {id : teamId,reqId : reqId}
				teamDao.get(team,function(err,result){
					counter++;
					if(err){
						logger.debug("Error getting team (isteamExists())"+err);
						return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
					}
					if(result && result.length <= 0){
						logger.info("team not Found (isteamExists())" + teamId);
						teamNotFound.push(teamId);
					}else{
						if(result[0].status === 1){
							statusCounter++;
						}
					}
					if(counter === teamIds.length){
						if(teamNotFound.length>0){
							return cb(messages.teamNotFound+" with id = "+teamNotFound,responseCode.NOT_FOUND)
						}else{
							if(statusCounter>0){
								return cb(null,responseCode.SUCCESS,teamNotFound,1);//last value is the status for user
							}else{
								return cb(null,responseCode.SUCCESS,teamNotFound,0);//last value is the status for user
							}
							
						}
					}
				})
			});
		}else{
			logger.debug("empty team array (isteamExists())")
			return cb(null,responseCode.SUCCESS,teamNotFound,1);//last value is the status for user
		}
	}else{
		logger.debug("teamIds should be array (isteamExists())")
		return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
	}
}

/*authenticate user form community db*/
UserService.prototype.authenticateWithCommunity = function(data,cb){
	logger.info("get logged in user called in admin user service (authenticateWithCommunity()) ");
    userDao.getLoggedInUserDetails(data, function(err, result){
        if(err){
            logger.error("get user called(authenticateWithCommunity())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
		return cb(null, responseCode.SUCCESS, result);   
    });
}
module.exports = UserService;


