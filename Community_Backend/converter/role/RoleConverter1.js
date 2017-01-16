"use strict";

var moduleName = __filename;

var helper = require('helper');
var config = require('config');

var UtilService = require("service/util/UtilService");
var baseConverter = require('converter/base/BaseConverter.js');
var RoleRequest = require("model/role/RoleRequest.js");
var RoleListResponse = require("model/role/RoleListResponse.js");
var RoleDetailResponse = require("model/role/RoleDetailResponse.js");
var RoleTypeResponse = require("model/role/RoleTypeResponse.js");

var messages = config.messages;
var httpResponseCode = config.responseCodes;
var logger = helper.logger(moduleName);

var utilService = new UtilService();

var RoleConverter = function () { }

RoleConverter.prototype.getRequestToModel = function(data){
	var role = new RoleRequest();
	
	baseConverter(role, data);
	
	role.id = data.id,
	role.isDeleted = data.isDeleted,
	role.name = data.name;
	role.status =  1;

	role.roleTypeId = data.roleTypeId;
	if (data.startDate) {
		var startDate = data.startDate;
		var startDateArray = startDate.split("/");
		role.startDate = startDateArray[2]+"-"+startDateArray[0]+"-"+startDateArray[1];
		if(utilService.compareDate(role.startDate) <= 0 ){
			role.status = 1;
        }else{
        	role.status = 0;
        }
	}
	if (data.expireDate) {
		var expireDate = data.expireDate;
		var expireDateArray = expireDate.split("/");
		role.expireDate = expireDateArray[2]+"-"+expireDateArray[0]+"-"+expireDateArray[1];
		if(utilService.compareDate(role.expireDate) > 0 && data.startDate && role.status != 0){
			role.status = 1;
        }else{
        	role.status = 0;
        }
	}
	return this.rolePrivilegeRequestToModel(data.privileges, function(err, list){
		role.privileges = list;

		return role;	
	});
}
RoleConverter.prototype.getModelToResponse = function (data, cb) {
	
}
module.exports = RoleConverter;