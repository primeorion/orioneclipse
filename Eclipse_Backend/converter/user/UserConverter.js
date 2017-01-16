"use strict";

var moduleName = __filename;

var helper = require('helper');
var config = require('config');

var UtilService = require("service/util/UtilService");
var baseConverter = require('converter/base/BaseConverter.js');
var UserRequest = require("model/user/UserRequest.js");
var UserResponse = require("model/user/UserResponse.js");
var UserPrivilegeResponse = require("model/user/UserPrivilegeResponse.js");

var messages = config.messages;
var httpResponseCode = config.responseCodes;
var logger = helper.logger(moduleName);

var utilService = new UtilService();

var UserConverter = function () { }

UserConverter.prototype.getRequestToModel = function(data){
	var user = new UserRequest();
	baseConverter(user, data);
	
	user.id = data.id;
	user.orionConnectExternalId = data.orionUserId;
	user.email = data.email;
	user.userLoginId = data.userLoginId;
	user.roleId = data.roleId;
	user.teamIds = data.teamIds;
	user.teamId = data.teamId;
	user.firmId = data.firmId;

	if (data.name) {
		logger.debug("splitting name with space (getRequestToModel())"+data.name);
		var nameArray = data.name.split(" ");
		if (nameArray.length > 1) {
			user.lastName = nameArray[1];
			user.firstName = nameArray[0];
		} else {
			user.firstName = nameArray[0];
			user.lastName = "";
		}
	}

	if (data.startDate) {
		logger.debug("convert startDate from format (mm/dd/yyyy) to format (yyyy-mm-dd) (getRequestToModel())"+data.startDate);
		var startDate = data.startDate;
		var startDateArray = startDate.split("/");
		user.startDate = startDateArray[2] + "-" + startDateArray[0] + "-" + startDateArray[1];
		if(utilService.compareDate(data.startDate) <= 0 ){
			user.status = 1;
		}else{
			user.status = 0;
		}
	}

	if (data.expireDate) {
		logger.debug("convert expireDate from format (mm/dd/yyyy) to format (yyyy-mm-dd) (getRequestToModel())"+data.expireDate);
		var expireDate = data.expireDate;
		var expireDateArray = expireDate.split("/");
		user.expireDate = expireDateArray[2] + "-" + expireDateArray[0] + "-" + expireDateArray[1];
		if(utilService.compareDate(data.expireDate) > 0 && user.startDate && user.status != 0){
			user.status = 1;
		}else{
			user.status = 0;
		}
	} 
	
	logger.debug("User status after evaluating startDate and expireDate (getRequestToModel())"+data.status);
	return user;
};

UserConverter.prototype.getModelToResponse = function (data, cb) {
	var self = this;
	var userList = [];
	var oldUserId = "";
	var userObject = {};
	var userResponse = {};
	data.forEach(function (user) {
		if (user.id === oldUserId) {
			if (user.teamId) {
				var team = {id: user.teamId,name: user.teamName};
				userResponse.teams.push(team);
			}
		} else {
			oldUserId = user.id;
			userObject = {};
			//userObject = self.getModelToResponse(user);
			userResponse = new UserResponse();
			var userTeams = [];
			var userRole = null;
			if (user.teamId) {
				var team = {id: user.teamId, name: user.teamName};
				userTeams.push(team);
			}
			if (user.roleId) {
				userResponse.role.id = user.roleId;
				userResponse.role.name = user.roleName;
			}
			userResponse.id = user.id;
			userResponse.orionUserId = user.orionConnectExternalId;
			userResponse.name = user.firstName + ' ' + user.lastName;
			userResponse.userLoginId = user.userLoginId;
			userResponse.status = user.status;
			userResponse.userLogo = user.userLogo;
			userResponse.createdOn = user.createdDate;
			userResponse.createdBy = user.createdBy;
			userResponse.editedOn = user.editedDate;
			userResponse.editedBy = user.editedBy;
			userResponse.startDate = user.startDate;
			userResponse.expireDate = user.expireDate;
			userResponse.email = user.email;
			userResponse.isDeleted = user.isDeleted;
			userResponse.teams = userTeams;
			userList.push(userResponse);
		}
	});
	return cb(null,userList);
};

UserConverter.prototype.userPrivilegeResponse = function (data, cb) {
	logger.info("Generating UI  (userPrivilegeResponse())");
	var privilegeList = [];
	if (data && data.length > 0) {
		data.forEach(function (userRolePrivilege) {
			var privilegeId = userRolePrivilege.id;
			var privilegeName = userRolePrivilege.name;
			var canAdd = userRolePrivilege.canAdd;
			var canUpdate = userRolePrivilege.canUpdate;
			var canDelete = userRolePrivilege.canDelete;
			var canRead = userRolePrivilege.canRead;
			var isDeleted = userRolePrivilege.isDeleted;
			var createdOn = userRolePrivilege.createdDate;
			var editedOn = userRolePrivilege.editedDate;
			var createdBy = userRolePrivilege.createdBy;
			var editedBy = userRolePrivilege.editedBy;
			if (privilegeId) {
				var userPrivilegeResponse = new UserPrivilegeResponse();
				userPrivilegeResponse.id = privilegeId,
				userPrivilegeResponse.name = privilegeName,
				userPrivilegeResponse.canAdd = canAdd,
				userPrivilegeResponse.canUpdate = canUpdate,
				userPrivilegeResponse.canDelete = canDelete,
				userPrivilegeResponse.canRead = canRead,
				userPrivilegeResponse.isDeleted = isDeleted,
				userPrivilegeResponse.createdOn = createdOn,
				userPrivilegeResponse.createdBy = createdBy,
				userPrivilegeResponse.editedOn = editedOn,
				userPrivilegeResponse.editedBy = editedBy
				privilegeList.push(userPrivilegeResponse);
			}
		});
	}
	logger.info("Generated UI successfully (userPrivilegeResponse())");
	return cb(null, privilegeList);

};


module.exports = UserConverter;
