"use strict";

var config = require('config');
var applicationEnum = config.applicationEnum;

var RolePrivilege = function(data){
	
	/*
	 * ui - entity
	*/
	//var type = data.privilegeType;
	
	this.id = data.privilegeId,
	this.name = data.privilegeName,
	this.code = data.privilegeCode,
	this.category = data.privilegeCategory,
	this.type = data.privilegeType
	this.canAdd = data.canAdd,
	this.canUpdate =  data.canUpdate,
	this.canDelete = data.canDelete,
	this.canRead = data.canRead,
	this.isDeleted = data.privilegeIsDeleted;
	
	/*if (type !== null) {
		type = applicationEnum.privilege[type];
		this.type = type;
	}*/

}

module.exports = RolePrivilege;