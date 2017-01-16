"use strict";

var moduleName = __filename;

var config = require('config');
var lodash = require("lodash");
var RoleDao = require('dao/admin/RoleDao.js');
var UserDao = require('dao/admin/UserDao.js');
var PrivilegeDao = require('dao/admin/PrivilegeDao.js');
var UtilService = require('service/util/UtilService.js');
var RoleConverter = require('converter/role/RoleConverter.js');
var RolePrivilegeModel = require('model/privilege/RolePrivilegeRequest.js');
var logger = require('helper/Logger.js')(moduleName);

var messages = config.messages;
var responseCodes = config.responseCodes;
var applicationEnum = config.applicationEnum;

var utilService = new UtilService();
var roleConverter = new RoleConverter();
var roleDao = new RoleDao();
var userDao = new UserDao();
var privilegeDao = new PrivilegeDao();

var RoleService = function () { };

RoleService.prototype.addRole = function (data, cb) {
	var self = this;
	logger.info("Create role service called (addRole())");		
		roleDao.get(data, function (err, fetched) {
			if (err) {
				logger.error("Getting role (addRole())" + err);
				return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
			}
			if (fetched && fetched.length > 0) {
				logger.error("Role already exist with name (addRole())" + data.name);
				return cb(messages.roleAlreadyExist, responseCodes.UNPROCESSABLE);
			} else {
				data.roleType = data.roleTypeId;
				roleDao.getRoleType(data, function (err, roleTypeFound) {
					if (err) {
						logger.error("Getting role type (addRole())" + err);
						return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
					}
					if (roleTypeFound && roleTypeFound.length > 0) {
						roleDao.add(data, function (err, added) {
							if (err) {
								logger.error("Adding role (addRole())" + err);
								return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
							}
							data.id = added.insertId;
							self.validPrivileges(data,function(valid,inValidPrivileges){
								if(valid){
									if (data.privileges && data.privileges.length >= 1) {
										roleDao.addRolePrivilege(data, function (err, privilegeAdded) {
											if (err) {
												logger.error("Adding privilege to role (addRole())" + err);
												return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
											}
											self.getRoleDetail(data, function (err, code, result) {
												if (code === responseCodes.INTERNAL_SERVER_ERROR || code === responseCodes.NOT_FOUND) {
													logger.error("Getting role detail (addRole())" + err);
													return cb(err, code);
												}
												logger.info("Role created successfully  (addRole())");
												return cb(null, responseCodes.CREATED, result);
											});
										});
									} else {
										self.getRoleDetail(data, function (err, code, result) {
											if (code === responseCodes.INTERNAL_SERVER_ERROR || code === responseCodes.NOT_FOUND) {
												logger.error("Getting role detail (addRole())" + err);
												return cb(err, code);
											}
											logger.info("Role created successfully  (addRole())");
											return cb(null, responseCodes.CREATED, result);
										});
									}
								}else{
									logger.debug("Not valid Privilege for role type")
									return cb(messages.invalidPrivilegeForRoleType+" = "+inValidPrivileges,responseCodes.UNPROCESSABLE);
								}
							});
						});
					} else {
						logger.info("Role Type not Found (addRole())" + data.roleTypeId);
						return cb(messages.roleTypeNotFound, responseCodes.NOT_FOUND);
					}
				});
			}
		});
};

RoleService.prototype.updateRole = function (data, cb) {
	logger.info("Update role service called (updateRole())");
	var self = this;
		if (data.name) {
			roleDao.get(data, function (err, fetched) {
				if (err) {
					logger.error("Getting role (addRole())" + err);
					return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				}

				if (fetched && fetched.length > 0 && ((fetched[0].id != data.id && fetched[0].name === data.name)
					|| fetched[1] && fetched[1].name === data.name)) {
					logger.error("Role already exist with name (addRole())" + data.name);
				return cb(messages.roleAlreadyExist, responseCodes.UNPROCESSABLE);
			} else {
				roleDao.update(data, function (err, updated) {
					if (err) {
						logger.error("updating role (updateRole())" + err);
						return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
					}

					if (data.privileges) {
						if (data.privileges.length >= 1) {
							self.validPrivileges(data,function(valid,inValidPrivileges){
								if(valid){
									roleDao.updateRolePrivilege(data, function (err, privilegeUpdated) {
										if (err) {
											logger.error("updating role privilege (updateRole())" + err);
											return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
										}
										roleDao.removeRolePrivileges(data, function (err, removedPriveleges) {
											self.changeUserStatusBasedOnRoleStatus(data, function (err, code, result) {
												if (code === responseCodes.INTERNAL_SERVER_ERROR || code === responseCodes.NOT_FOUND) {
													logger.error("getting role detail (updateRole())" + err);
													return cb(err, code);
												}
												logger.info("Role updated successfully (updateRole())");
												return cb(null, responseCodes.SUCCESS, result);
											});
										})
									});
								}else{
									logger.debug("Not valid Privilege for role type (updateRole())");
									return cb(messages.invalidPrivilegeForRoleType+" = "+inValidPrivileges,responseCodes.UNPROCESSABLE);
								}
							});
						} else {
							var rolePrivilegeModel = new RolePrivilegeModel();
							data.privileges.push(rolePrivilegeModel);
								roleDao.removeRolePrivileges(data, function (err, removedPriveleges) {
									self.changeUserStatusBasedOnRoleStatus(data, function (err, code, result) {
										if (code === responseCodes.INTERNAL_SERVER_ERROR || code === responseCodes.NOT_FOUND) {
											logger.error("getting role detail (updateRole())" + err);
											return cb(err, code);
										}
										logger.info("Role updated successfully (updateRole())");
										return cb(null, responseCodes.SUCCESS, result);
									});
								});
						}
					} else {
						self.changeUserStatusBasedOnRoleStatus(data, function (err, code, result) {
							if (code === responseCodes.INTERNAL_SERVER_ERROR || code === responseCodes.NOT_FOUND) {
								logger.error("getting role detail (updateRole())" + err);
								return cb(err, code);
							}
							logger.info("Role updated successfully (updateRole())");
							return cb(null, responseCodes.SUCCESS, result);
							
						});
					}
				});
			}
		});

		} else {
			logger.info("Missing required parameters for update role (updateRole())");
			return cb(messages.missingParameters, responseCodes.BAD_REQUEST)
		}
};

RoleService.prototype.getRoleList = function (data, cb) {
	logger.info("Get roles service called (getRoleList())");
	roleDao.getList(data, function (err, fetched) {
		if (err) {
			logger.error("getting role list (getRoleList())" + err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}
		logger.info("Role list returned successfully (getRoleList())");
		var uiRoleList = roleConverter.roleListFromEntityToModel(fetched);
		return cb(null, responseCodes.SUCCESS, uiRoleList);
	});
};

RoleService.prototype.getRoleDetail = function (data, cb) {
	logger.info("Get role details service called (getRoleDetail())");
	var self = this;
	roleDao.getDetail(data, function (err, fetched) {
		if (err) {
			logger.error("getting role detail (getRoleDetail())" + err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}
		if (fetched && fetched.length > 0) {
			roleConverter.roleDetailEntityToModel(fetched, function (err, rolePrivilege) {
				if (err) {
					logger.error("Converting role detail from entity to ui" + err);
					return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				}
				logger.info("Preparing response for role detail (getRoleDetail())");
				return cb(err, responseCodes.SUCCESS, rolePrivilege);

			});
		} else {
			logger.info("Role not Found (getRoleDetail())" + data.roleId);
			return cb(messages.roleNotFound, responseCodes.NOT_FOUND);
		}
	});
};

RoleService.prototype.deleteRole = function (data, cb) {
	logger.info("Delete role service called (deleteRole())");
		if (data.id) {
			roleDao.delete(data, function (err, deleted) {
				if (err) {
					logger.error("deleting role (deleteRole())" + err);
					return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				}
				if (deleted.affectedRows > 0) {
					logger.debug("inside role priv delete");
					roleDao.removeRolePrivileges(data, function (err, removedPriveleges) {
						roleDao.inActiveUser(data,function(err,result){
							if(err){
								logger.error("inactive the user associate to role (deleteRole())" + err);
								return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
							}
							logger.info("Role deleted successfully (deleteRole())" + data.roleId);
							return cb(null, responseCodes.SUCCESS, { "message": messages.roleDeleted });
						});									
					});
				} else {
					logger.info("Role not Found Or already deleted(deleteRole())" + data.roleId);
					return cb(messages.roleNotFoundOrDeleted, responseCodes.NOT_FOUND);
				}
			});
			
		} else {
			logger.info("Missing required parameters for delete role (deleteRole())");
			return cb(messages.missingParameters, responseCodes.BAD_REQUEST);
		}
};

RoleService.prototype.addPrivilege = function (data, cb) {
    //check for role data
    	roleDao.get(data, function (err, role) {
    		if (err) {
    			logger.error("Getting role (addPrivilege())" + err);
    			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
    		}
    		if (role && role.length > 0) {
				roleDao.addRolePrivilege(data, function (err, fetched) {
					if (err) {
						logger.error("Adding privilege to role (addPrivilege())" + err);
						return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
					}
					logger.info("Add privilege to role successfully (addPrivilege())");
					return cb(null, responseCodes.SUCCESS, { "message": messages.privilegesAdded });
				});
			} else {
				logger.info("Role not Found (addPrivilege())" + data.roleId);
				return cb(messages.roleNotFound, responseCodes.NOT_FOUND)
			}
		});
};


RoleService.prototype.getId = function (data, cb) {
	data.entityName = 'role';
	utilService.getAndStoreNextSeqId(data, function (err, seqId) {
		if (err) {
			logger.error("getting next role Id (getId())" + err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR)
		}
		logger.info("RoleId returned successfully (getId())");
		return cb(null, responseCodes.SUCCESS, { id: seqId });
	});
};

RoleService.prototype.getRoleTypeList = function (data, cb) {
	logger.info("Get role type list service called (getRoleTypeList())");
	roleDao.getRoleTypeList(data, function (err, fetched) {
		if (err) {
			logger.error("getting roleType List (getRoleTypeList())" + err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}
		logger.info("RoleType list returned successfully (getRoleTypeList())");
		roleConverter.roleTypeListEntityToRequest(fetched, function (err, data) {
			if (err) {
				logger.error("Converting roletype entity to ui" + err);
				return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
			}
			return cb(null, responseCodes.SUCCESS, data);
		});
	});
};

RoleService.prototype.reassignRole = function (data, cb) {
	logger.info("Reassign role service called (reassignRole())");
	if (data.newRoleId && data.oldRoleId) {
		data.id = data.newRoleId;
			roleDao.get(data, function (err, role) {
				if (err) {
					logger.error("Getting role (reassignRole())" + err);
					return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				}
				if (role && role.length > 0) {
					var newRoleType = role[0].roleType;
					data.id = data.oldRoleId;
					roleDao.get(data, function (err, oldRole) {
						if (err) {
							logger.error("Getting role (reassignRole())" + err);
							return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
						}
						if (oldRole && oldRole.length > 0) {
							if(oldRole[0].roleType === newRoleType){
								roleDao.reassignRole(data, function (err, fetched) {
									if (err) {
										logger.error("Reassign role (reassignRole())" + err);
										return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
									}
									if (fetched.affectedRows > 0) {
										logger.info("Role reassigned successfully (reassignRole()) \n");
										return cb(null, responseCodes.SUCCESS, { "message": messages.roleReassigned });
									} else {
										logger.info("No User associate with role (reassignRole()) \n");
										return cb(messages.noUserAssociatedWithRole + " id = " + data.oldRoleId, responseCodes.NOT_FOUND);
									}
								});
							}else{
								logger.error("Role Type of new role and old role is not same");
								return cb(messages.diffRoleType, responseCodes.BAD_REQUEST)
							}
						} else {
							logger.info("Role not Found (reassignRole())" + data.oldRoleId);
							return cb(messages.roleNotFound, responseCodes.NOT_FOUND);
						}
					});
				} else {
					logger.info("Role not Found (reassignRole())" + data.newRoleId);
					return cb(messages.roleNotFound, responseCodes.NOT_FOUND);
				}
			});
	} else {
		logger.info("Missing required parameters for reassign role (reassignRole()) \n");
		return cb(messages.missingParameters, responseCodes.BAD_REQUEST);
	}
};

RoleService.prototype.getRoleSummary = function(data,cb){
	roleDao.getRoleSummary(data,function(err,result){
		if(err){
			logger.error("error fetching summary getRoleSummary())"+err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}
		logger.info("summary fetched successfully (getRoleSummary())");
		return cb(null,responseCodes.SUCCESS,result);
	});
};
RoleService.prototype.getRoleUsers = function(data,cb){
	roleDao.get(data,function(err,result){
		if(err){
			logger.error("error fetching role getRoleUsers())"+err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}
		if(result && result.length>0){
			roleDao.getRoleUsers(data,function(err,result){
				if(err){
					logger.error("error fetching getRoleUsers())"+err);
					return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				}
				logger.info("Role users list fetched successfully (getRoleUsers())");
				return cb(null,responseCodes.SUCCESS,result);
			});
		}else{
			logger.debug("Role does not exist (getRoleUsers())");
			return cb(messages.roleNotFound,responseCodes.NOT_FOUND);
		}
	});
	
};
RoleService.prototype.changeUserStatusBasedOnRoleStatus = function(data,cb){
	var self = this;
	self.getRoleDetail(data, function (err, code, result) {
		if (code === responseCodes.INTERNAL_SERVER_ERROR || code === responseCodes.NOT_FOUND) {
			logger.error("getting role detail (changeUserStatusBasedOnRoleStatus())" + err);
			return cb(err, code);
		}
		data.status = result.status;
		data.roleId = result.id;
		if(result.status === 0 ){
			userDao.changeUserStatusBasedOnRoleStatus(data,function(err,statusResult){
				if(err){
					logger.error("changing user status based on role status (changeUserStatusBasedOnRoleStatus())"+err);
					return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				}
				logger.info("User status updated successfully (changeUserStatusBasedOnRoleStatus())");
				return cb(null, responseCodes.SUCCESS, result);
			});
		}else{
			logger.info("User status updated successfully (changeUserStatusBasedOnRoleStatus())");
			return cb(null, responseCodes.SUCCESS, result);
		}
	});	
};
RoleService.prototype.validPrivileges = function(data,cb){
	var roleTypeId = null;
	if(data.roleTypeId){
		roleTypeId = data.roleTypeId
	}else{
		roleTypeId = data.roleType;
	}
	var privileges = data.privileges;
	privilegeDao.getAll(data,function(err,privilegesFound){
		if(err){
			logger.debug("Error in getting privileges");
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}
		var inputPrivileges = [];
		privileges.forEach(function(privilege){
			var id = privilege.id;
			inputPrivileges.push(id);
		});
		if(privilegesFound && privilegesFound.length>0){
			var dbPrivileges = [];
			privilegesFound.forEach(function(privilege){
				var id = privilege.id;
				dbPrivileges.push(id);
			});

			var invalidPrivileges = lodash.difference(inputPrivileges, dbPrivileges);
			if(invalidPrivileges && invalidPrivileges.length>0){
				return cb(false,invalidPrivileges);
			}else{
				return cb(true);
			}
		}else{
			return cb(false,inputPrivileges);
		}
	});
}
module.exports = RoleService;
